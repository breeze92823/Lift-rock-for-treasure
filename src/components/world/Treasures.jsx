import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { TREASURES } from '../../data/world.js'
import { ITEM_INFO } from '../../data/loot.js'
import { padMaterial } from '../../materials/world.js'
import { shortMoney } from '../../utils/shortMoney.js'
import { Block, Label } from './parts.jsx'
import { MODELS, GenericItem, RARITY, RARITY_FALLBACK } from './LootItems.jsx'

// Showcase pedestals: a studded coloured pad, a Celestial / Divine loot item turning slowly
// above it, and its floating name / rarity / cost label (same look as loot on the Lift floor).
// Buying is the E zone in systems/loot.js.
export default function Treasures() {
  const spinners = useRef([])
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    spinners.current.forEach((g, i) => {
      if (!g) return
      g.rotation.y = t * 0.5 + i
      g.position.y = 1.4 + Math.sin(t * 1.6 + i) * 0.12
    })
  })
  return TREASURES.map((t, i) => {
    const rarity = ITEM_INFO[t.item].rarity
    const Model = MODELS[t.item] || GenericItem
    const { fill } = RARITY[rarity] || RARITY_FALLBACK
    return (
      <group key={t.id} position={[t.x, 0, t.z]}>
        <Block w={3.6} h={0.3} d={3.6} mat={padMaterial(t.pad)} />
        <group ref={(g) => (spinners.current[i] = g)} scale={2}>
          <Model />
        </group>
        <Label
          position={[0, 4.6, 0]}
          height={2.6}
          lines={[
            { text: t.item, size: 64 },
            { text: rarity, size: 34, fill, line: 5 },
            { text: shortMoney(t.cost), size: 58, fill: '#4dff3a', stroke: '#0b3a00' },
          ]}
        />
      </group>
    )
  })
}
