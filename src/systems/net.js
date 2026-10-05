// Multiplayer + persistence client for the Colyseus backend (Lift-rock-for-treasure-backend).
//   - progress: hydrates useGameStore from the saved doc on join, then pushes debounced saves.
//   - presence: streams the local player's pose/animation inputs and mirrors the other
//     players into systems/remotePlayers.js + useRemoteStore for rendering.
// Offline (server unreachable) the game simply runs single-player; nothing is saved.
import { Client } from '@colyseus/sdk'
import { useGameStore } from '../store/useGameStore.js'
import { useLeaderboardStore } from '../store/useLeaderboardStore.js'
import { useRemoteStore } from '../store/useRemoteStore.js'
import { remotes } from './remotePlayers.js'
import { player } from './playerState.js'
import { authState, getDisplayName, getEquippedAvatar, getStableUserId, onAvatarChanged, subscribeAuth } from './bloxity.js'
import { DEV_MODE } from '../data/bloxity.js'
import { UPGRADES, moveSpeedFor } from '../data/upgrades.js'

// Two Legion channels (`dev` branch -> dev, `main` -> prod), each with its own hostname; Vite's MODE
// picks one at build time. Empty = no server configured: the game stays single-player.
const SERVER_URL_DEV = import.meta.env.VITE_SERVER_URL_DEV || 'ws://localhost:2567'
const SERVER_URL_MAIN = import.meta.env.VITE_SERVER_URL_MAIN || ''
const SERVER_URL = import.meta.env.MODE === 'production' ? SERVER_URL_MAIN : SERVER_URL_DEV
const MOVE_HZ = 15
const SAVE_DEBOUNCE_MS = 1000
const RETRY_MS = 3000
const JOIN_TIMEOUT_MS = 45000 // one attempt; covers a scaled-to-zero host booting
const FIRST_LOAD_BACKOFF_MS = [2000, 4000, 8000, 12000, 15000, 15000] // then give up and show "Try again"

// Store keys the server persists (backend src/sanitize.ts).
const SAVED = [
  'cash', 'gems', 'rebirths', 'strength', 'level', 'xp', 'xpNeeded', 'backpackLevel', 'speedLevel',
  'inventory', 'ownedAuras', 'equippedAura', 'ownedArms', 'equippedArm', 'heldItem', 'plotSlots', 'baseUpgraded', 'discovered',
]
// Subset other players can see; sent right away instead of waiting for the save debounce.
const VISIBLE = ['equippedAura', 'equippedArm', 'level', 'rebirths', 'heldItem', 'baseUpgraded']

const pick = (st, keys) => Object.fromEntries(keys.map((k) => [k, st[k]]))

let room = null
let hydrated = false // saved progress applied (or confirmed absent); saving is blocked before this
let lastSaved = ''
let lastVisible = ''
let lastMove = ''
let saveTimer = 0
let started = false
let everLoaded = false // progress received at least once; later drops reconnect silently
let connecting = false
let attempt = 0 // consecutive failed joins before the first successful load
let joinedAs = '' // user id the current connection was opened (or last identified) with

// Dev builds and guests have no Bloxity id; a per-browser id keeps their progress too.
function localGuestId() {
  try {
    let id = localStorage.getItem('lrft-guest-id')
    if (!id) {
      id = `guest-${crypto.randomUUID()}`
      localStorage.setItem('lrft-guest-id', id)
    }
    return id
  } catch {
    return ''
  }
}
const currentUserId = () => getStableUserId() || localGuestId()
const avatarJson = () => {
  try {
    const a = authState.user && !DEV_MODE ? getEquippedAvatar() : null
    return a ? JSON.stringify(a) : ''
  } catch {
    return ''
  }
}

function applyProgress(doc) {
  const patch = {}
  for (const k of SAVED) if (doc[k] !== undefined) patch[k] = doc[k]
  patch.homePlot = doc.homePlot ?? 0
  if (patch.inventory) patch.backpack = patch.inventory.length
  if (patch.backpackLevel) patch.backpackMax = UPGRADES.backpack.value(patch.backpackLevel)
  if (patch.speedLevel) player.moveSpeed = moveSpeedFor(patch.speedLevel)
  if (patch.plotSlots) patch.plotSlots = { ...patch.plotSlots }
  // Backends that don't store baseUpgraded yet: keep the purchase in this browser.
  const upKey = `lrft-base-upgraded:${currentUserId()}`
  try {
    if (patch.baseUpgraded) localStorage.setItem(upKey, '1')
    else if (localStorage.getItem(upKey)) patch.baseUpgraded = true
  } catch {}
  useGameStore.setState(patch)
}

function saveNow() {
  clearTimeout(saveTimer)
  saveTimer = 0
  if (!room || !hydrated) return
  const data = pick(useGameStore.getState(), SAVED)
  const json = JSON.stringify(data)
  if (json === lastSaved) return
  lastSaved = json
  room.send('saveProgress', data)
}

function onStoreChange(st) {
  if (!room || !hydrated) return
  const vis = JSON.stringify(pick(st, VISIBLE))
  if (vis !== lastVisible) {
    lastVisible = vis
    room.send('appearance', pick(st, VISIBLE))
  }
  if (!saveTimer) saveTimer = setTimeout(saveNow, SAVE_DEBOUNCE_MS)
}

function sendMove() {
  if (!room) return
  const speed = player.moveSpeed || 1
  const msg = {
    x: +player.position.x.toFixed(2),
    y: +player.position.y.toFixed(2),
    z: +player.position.z.toFixed(2),
    yaw: +player.facing.toFixed(2),
    speed01: +Math.min(1, Math.hypot(player.velocity.x, player.velocity.z) / speed).toFixed(2),
    grounded: player.grounded,
    bending: !!player.bending,
    lifting: player.lifting ?? null,
    training: player.training?.key ?? null,
    holding: !!useGameStore.getState().heldItem,
  }
  const json = JSON.stringify(msg)
  if (json === lastMove) return
  lastMove = json
  room.send('move', msg)
}

// Mirrors room.state.players into remotes / useRemoteStore. Polled (a few Hz) rather than
// callback-driven so it needs nothing beyond the plain state objects the SDK keeps live.
let lastSig = ''
function syncRoster() {
  if (!room?.state?.players) return
  const ids = []
  const plots = {}
  const parts = []
  room.state.players.forEach((p, sid) => {
    if (sid === room.sessionId) return
    ids.push(sid)
    remotes.set(sid, p)
    const slots = {}
    p.plotSlots?.forEach((it, key) => {
      slots[key] = { name: it.name, rarity: it.rarity, glyph: it.glyph }
    })
    plots[p.homePlot] = { slots, baseUpgraded: !!p.baseUpgraded }
    parts.push(`${sid}:${p.homePlot}:${p.baseUpgraded ? 1 : 0}:${p.avatar?.length ?? 0}:${Object.entries(slots).map(([k, v]) => k + v.name).join(',')}`)
  })
  for (const sid of [...remotes.keys()]) if (!ids.includes(sid)) remotes.delete(sid)
  const sig = parts.join('|')
  if (sig !== lastSig) {
    lastSig = sig
    useRemoteStore.setState({ ids, plots })
  }
}

async function connect() {
  connecting = true
  try {
    const client = new Client(SERVER_URL)
    let timer
    const timeout = new Promise((_, reject) => {
      timer = setTimeout(() => reject(new Error('Server did not respond in time.')), JOIN_TIMEOUT_MS)
    })
    const r = await Promise.race([
      client.joinOrCreate('world', { userId: currentUserId(), username: getDisplayName(), avatar: avatarJson() }),
      timeout,
    ]).finally(() => clearTimeout(timer))
    attempt = 0
    room = r
    joinedAs = currentUserId()
    lastSaved = lastVisible = lastMove = ''
    r.onMessage('leaderboard', (boards) => useLeaderboardStore.setState(boards))
    r.onMessage('serverError', () => {
      useGameStore.setState({ netError: 'Could not load your progress.' })
      r.leave()
    })
    r.onMessage('progress', (doc) => {
      // Reconnect: local state is newer than the saved doc, so push it instead of re-hydrating.
      const reconnect = hydrated
      if (!reconnect) applyProgress(doc)
      else useGameStore.setState({ homePlot: doc.homePlot ?? 0 })
      hydrated = true
      everLoaded = true
      lastSaved = reconnect ? '' : JSON.stringify(pick(useGameStore.getState(), SAVED))
      lastVisible = ''
      useGameStore.setState({ progressLoaded: true, netError: '', netWaking: false })
      if (reconnect) saveNow()
      onStoreChange(useGameStore.getState())
    })
    r.onMessage('noProgress', ({ homePlot = 0 } = {}) => {
      useGameStore.setState({ homePlot, progressLoaded: true, netError: '', netWaking: false })
      hydrated = true
      everLoaded = true
      lastSaved = '' // brand-new account: store the current (default) state right away
      saveNow()
      onStoreChange(useGameStore.getState())
    })
    r.onLeave(() => {
      if (room === r) room = null
      remotes.clear()
      lastSig = ''
      useRemoteStore.setState({ ids: [], plots: {} })
      if (everLoaded) setTimeout(connect, RETRY_MS)
      else if (!useGameStore.getState().netError) fail('Connection lost.')
    })
  } catch (err) {
    console.warn('[net] could not join the server', err?.message || err)
    if (everLoaded) setTimeout(connect, RETRY_MS * 2)
    else if (attempt < FIRST_LOAD_BACKOFF_MS.length) {
      // Host may be waking from scale-to-zero (503 / CORS failure): keep trying quietly.
      useGameStore.setState({ netWaking: true })
      setTimeout(connect, FIRST_LOAD_BACKOFF_MS[attempt++])
    } else fail(err?.message || 'Could not reach the server.')
  } finally {
    connecting = false
  }
}

// First load failed: stop retrying on our own and let the loading screen offer a "Try again" button.
function fail(message) {
  useGameStore.setState({ netError: message, netWaking: false })
}

export function retryNet() {
  if (connecting) return
  attempt = 0
  useGameStore.setState({ netError: '' })
  connect()
}

export function startNet() {
  if (started) return
  if (!SERVER_URL) {
    useGameStore.setState({ progressLoaded: true })
    return console.warn('[net] no server URL configured, playing offline')
  }
  started = true
  useGameStore.subscribe(onStoreChange)
  useGameStore.subscribe((st, prev) => {
    if (st.baseUpgraded && !prev.baseUpgraded) {
      try { localStorage.setItem(`lrft-base-upgraded:${currentUserId()}`, '1') } catch {}
    }
  })
  setInterval(sendMove, 1000 / MOVE_HZ)
  setInterval(syncRoster, 200)
  window.addEventListener('pagehide', saveNow)
  document.addEventListener('visibilitychange', () => document.hidden && saveNow())

  // Wait for Bloxity auth to settle so the real account id (not a guest id) is used.
  let begun = false
  const begin = () => {
    if (begun) return
    begun = true
    connect()
  }
  if (DEV_MODE || authState.ready) begin()
  else {
    subscribeAuth((s) => s.ready && begin())
    setTimeout(begin, 4000)
  }
  // Sign-in/out after joining: switch the saved identity; the server answers with progress/noProgress.
  subscribeAuth(() => {
    const id = currentUserId()
    if (!room || !begun || id === joinedAs) return
    joinedAs = id
    hydrated = false
    room.send('identify', { userId: id, username: getDisplayName() })
    room.send('setAvatar', { avatar: avatarJson() })
  })
  onAvatarChanged(() => room?.send('setAvatar', { avatar: avatarJson() }))
}
