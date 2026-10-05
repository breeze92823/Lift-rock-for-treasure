// "Press E to ..." orchestration. Zones are circles on the ground; the nearest
// one the player stands in becomes the active prompt, and holding E against it
// for its holdMs (systems/interactHold.js) fires its onConfirm. Stepped once
// per frame from GameLoop.jsx. Framework-free: components/hud/HUD.jsx polls
// interactState + interactHoldState to draw the prompt.
import { DEFAULT_RANGE, HOLD_MS } from '../data/interact.js'
import { STALLS } from '../data/world.js'
import { player } from './playerState.js'
import { isInteractKeyDown } from './input.js'
import { step as stepHold } from './interactHold.js'
import { playConfirmPop } from './sfx.js'
import { showActionResult } from './actionResult.js'
import { useGameStore, openWindow } from '../store/useGameStore.js'

// { id, x, z, range, prompt, holdMs?, enabled?(), onConfirm() }; a zone whose
// enabled() returns false is ignored.
export function proximityZone(zone) {
  return { range: DEFAULT_RANGE, holdMs: HOLD_MS, ...zone }
}

// Stall rings sit 2.8 m in front of each counter (components/world/Stalls.jsx).
export const zones = STALLS.map((s) =>
  proximityZone({
    id: `stall:${s.id}`,
    x: s.x + Math.sin(s.facing) * 2.8,
    z: s.z + Math.cos(s.facing) * 2.8,
    range: 1.7,
    prompt: `Open ${s.label}`,
    onConfirm: () => showActionResult(`${s.label} coming soon`, false),
  }),
)

// The Arms stall opens the Arms window (same hold-E flow as Sell in systems/loot.js).
const armsStall = zones.find((z) => z.id === 'stall:arms')
if (armsStall) {
  armsStall.prompt = 'Open Arms'
  armsStall.holdMs = 500
  armsStall.onConfirm = () => openWindow('arms')
}

// The Upgrades stall opens the Upgrades window.
const upgradesStall = zones.find((z) => z.id === 'stall:upgrades')
if (upgradesStall) {
  upgradesStall.prompt = 'Open Upgrades'
  upgradesStall.holdMs = 500
  upgradesStall.onConfirm = () => openWindow('upgrades')
}

// The Aura stall opens the Aura window.
const auraStall = zones.find((z) => z.id === 'stall:aura')
if (auraStall) {
  auraStall.prompt = 'Open Aura'
  auraStall.holdMs = 500
  auraStall.onConfirm = () => openWindow('aura')
}

// The prompt currently on screen: null, or { id, prompt }.
export const interactState = { near: null }

// Returns an unregister function.
export function addZone(zone) {
  const z = proximityZone(zone)
  zones.push(z)
  return () => {
    const i = zones.indexOf(z)
    if (i >= 0) zones.splice(i, 1)
  }
}

function nearestZone() {
  const p = player.position
  let best = null
  let bestD = Infinity
  for (const z of zones) {
    const d = Math.hypot(p.x - z.x, p.z - z.z)
    if (z.enabled && !z.enabled()) continue
    if (d <= z.range && d < bestD) {
      best = z
      bestD = d
    }
  }
  return best
}

export function stepInteract() {
  // No prompt (and no re-firing) while the Sell window is open.
  const zone = (useGameStore.getState().sellOpen || useGameStore.getState().rebirthOpen || useGameStore.getState().indexOpen || useGameStore.getState().upgradesOpen || useGameStore.getState().armsOpen || useGameStore.getState().auraOpen) ? null : nearestZone()
  interactState.near = zone ? { id: zone.id, prompt: typeof zone.prompt === 'function' ? zone.prompt() : zone.prompt } : null

  if (stepHold(zone ? zone.id : null, isInteractKeyDown(), zone?.holdMs)) {
    playConfirmPop()
    zone.onConfirm()
  }
}
