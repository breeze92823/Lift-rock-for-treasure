import { useEffect, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Quaternion, Vector3 } from 'three'
import { useRemoteStore } from '../store/useRemoteStore.js'
import { remotes } from '../systems/remotePlayers.js'
import { buildDefaultCharacter, loadBaseCharacter } from '../systems/defaultCharacter.js'
import { attachEquippedAccessories } from '../systems/avatarLoader.js'
import { makeGait, updateGait, disposeGait, setHolding } from '../systems/avatarAnim.js'
import { applyArmSkin } from '../systems/armSkin.js'
import { TRAINING_SPOTS } from '../data/world.js'
import { Label } from './world/parts.jsx'

const _up = new Vector3(0, 1, 0)
const _q = new Quaternion()
const POS_RATE = 12 // exponential smoothing toward the latest network position (1/s)
const TURN_RATE = 0.001 // same slerp base as Player.jsx
const spotByKey = new Map(TRAINING_SPOTS.map((s) => [s.key, s]))

// One other player: the game's default character (plus their equipped Bloxity accessories),
// driven by the same gait code as the local player from the animation inputs the server relays.
function RemotePlayer({ id }) {
  const ref = useRef()
  const gaitRef = useRef(null)
  const [avatar, setAvatar] = useState(() => buildDefaultCharacter())
  const [name, setName] = useState('')
  const loadedAvatarJson = useRef(null)
  const poll = useRef(0)
  const [rev, setRev] = useState(0)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const p = remotes.get(id)
      const json = p?.avatar || ''
      loadedAvatarJson.current = json
      const group = await loadBaseCharacter()
      let equipped = null
      try {
        equipped = json ? JSON.parse(json) : null
      } catch {
        // malformed avatar JSON: show the bare character
      }
      await attachEquippedAccessories(group, equipped).catch(() => {})
      if (!cancelled) setAvatar(group)
    })()
    return () => {
      cancelled = true
    }
  }, [id, rev])

  useEffect(() => {
    gaitRef.current = makeGait({ root: avatar, nodes: avatar.nodes || {}, clips: avatar.animations || [] })
    return () => {
      disposeGait(gaitRef.current)
      gaitRef.current = null
    }
  }, [avatar])

  useFrame((_s, delta) => {
    const g = ref.current
    const p = remotes.get(id)
    if (!g || !p) return
    const dt = Math.min(delta, 0.1)
    const k = 1 - Math.exp(-POS_RATE * dt)
    if (!g.userData.placed) {
      g.position.set(p.x, p.y, p.z) // first update: appear in place instead of gliding from the origin
      g.userData.placed = true
    } else {
      g.position.x += (p.x - g.position.x) * k
      g.position.y += (p.y - g.position.y) * k
      g.position.z += (p.z - g.position.z) * k
    }
    _q.setFromAxisAngle(_up, p.yaw)
    g.quaternion.slerp(_q, 1 - Math.pow(TURN_RATE, dt))

    applyArmSkin(avatar, p.equippedArm || null)
    const gait = gaitRef.current
    if (gait) {
      setHolding(gait, p.holding ? 'both' : false)
      updateGait(gait, dt, p.speed01, p.grounded, p.bending, spotByKey.get(p.training) ?? null, p.lifting < 0 ? null : p.lifting)
    }

    // Name changes and avatar edits are rare; check twice a second.
    poll.current += dt
    if (poll.current > 0.5) {
      poll.current = 0
      const n = p.username || 'Player'
      if (n !== name) setName(n)
      if ((p.avatar || '') !== loadedAvatarJson.current) {
        loadedAvatarJson.current = p.avatar || ''
        setRev((r) => r + 1) // rebuild the character with the new accessories
      }
    }
  })

  return (
    <group ref={ref}>
      <primitive object={avatar} />
      {name && <Label position={[0, 2.5, 0]} height={0.5} lines={[{ text: name, size: 56 }]} />}
    </group>
  )
}

export default function RemotePlayers() {
  const ids = useRemoteStore((s) => s.ids)
  return ids.map((id) => <RemotePlayer key={id} id={id} />)
}
