import { useRef } from 'react'
import { createPortal, useFrame } from '@react-three/fiber'
import { MODELS, GenericItem } from './world/LootItems.jsx'
import { bothHandsLayout } from '../systems/avatarAnim.js'

// The equipped (held) loot item, drawn between the character's hands. Portalled
// into the Spine2 bone so it follows the body, and positioned each frame from the
// same two-handed layout the arm pose uses (so it tracks the proportions too).
// Scale is in rig units (the rig root is ~0.28 m per unit).
const ITEM_SCALE = 1.2
const LIFT = 0.45 // loot models rest on y=0; centre them on the hands

export default function HeldItem({ avatar, name }) {
  const ref = useRef()
  const spine = avatar?.nodes?.Spine2

  useFrame(() => {
    const g = ref.current
    if (!g) return
    const layout = bothHandsLayout(avatar.nodes)
    if (layout) g.position.set(0, layout.y - LIFT * ITEM_SCALE, layout.z)
  })

  if (!spine || !name) return null
  const Model = MODELS[name] || GenericItem
  return createPortal(
    <group ref={ref} scale={ITEM_SCALE}>
      <Model />
    </group>,
    spine,
  )
}
