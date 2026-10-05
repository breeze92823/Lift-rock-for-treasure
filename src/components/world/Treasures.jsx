import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { TREASURES } from '../../data/world.js'
import { MAT, padMaterial, plastic } from '../../materials/world.js'
import { RARITY_PILL } from '../../utils/labels.js'
import { Block, Label } from './parts.jsx'

// Procedural stand-ins for the showcased treasures. Each model sits with its
// base at y=0 and is about 2 m across.
function RobotHead() {
  return (
    <group>
      <Block w={2} h={1.7} d={1.7} mat={plastic('#c9ccd3')} />
      <Block y={0.25} z={0.86} w={1.6} h={1.2} d={0.04} mat={plastic('#8fe6ff', { emissive: '#3fb8e0', emissiveIntensity: 0.6 })} />
      <Block x={-0.4} y={0.95} z={0.89} w={0.22} h={0.32} d={0.02} mat={MAT.black} />
      <Block x={0.4} y={0.95} z={0.89} w={0.22} h={0.32} d={0.02} mat={MAT.black} />
      <Block y={0.5} z={0.89} w={0.6} h={0.1} d={0.02} mat={MAT.black} />
      {[-1.05, 1.05].map((x) => (
        <mesh key={x} position={[x, 0.85, 0]} rotation-z={Math.PI / 2} material={plastic('#8d9099')}>
          <cylinderGeometry args={[0.3, 0.3, 0.2, 16]} />
        </mesh>
      ))}
      <mesh position={[0.3, 2.3, 0]} rotation-z={-0.25} material={MAT.post}>
        <cylinderGeometry args={[0.04, 0.04, 1.3, 6]} />
      </mesh>
      <mesh position={[0.48, 2.95, 0]} material={plastic('#ff3030', { emissive: '#ff1010', emissiveIntensity: 0.5 })}>
        <sphereGeometry args={[0.14, 12, 8]} />
      </mesh>
    </group>
  )
}

function CursedBox() {
  return (
    <group>
      <Block w={1.5} h={1.3} d={1.5} mat={plastic('#4a2a6e')} />
      <Block y={1.3} w={1.6} h={0.12} d={1.6} mat={plastic('#2bd98a')} />
      <mesh position={[0, 1.65, 0]} material={MAT.post}>
        <cylinderGeometry args={[0.12, 0.12, 0.6, 8]} />
      </mesh>
      <mesh position={[0, 2.25, 0]} material={MAT.white} castShadow>
        <sphereGeometry args={[0.5, 20, 14]} />
      </mesh>
      <mesh position={[0, 2.3, 0.45]} material={plastic('#ff2e4d')}>
        <sphereGeometry args={[0.1, 10, 8]} />
      </mesh>
      {Array.from({ length: 7 }, (_, i) => {
        const a = (i / 7) * Math.PI * 2
        return (
          <mesh key={i} position={[Math.cos(a) * 0.35, 2.6, Math.sin(a) * 0.35]} rotation={[Math.sin(a) * 0.6, 0, -Math.cos(a) * 0.6]} material={plastic('#8a2be2')}>
            <coneGeometry args={[0.16, 0.6, 6]} />
          </mesh>
        )
      })}
    </group>
  )
}

function Jet() {
  return (
    <group position={[0, 0.9, 0]} rotation-y={0.5}>
      <mesh rotation-z={Math.PI / 2} material={MAT.white} castShadow>
        <capsuleGeometry args={[0.45, 3, 6, 16]} />
      </mesh>
      <mesh position={[1.25, 0.25, 0]} material={plastic('#4fb6ff', { roughness: 0.2 })}>
        <sphereGeometry args={[0.38, 14, 10]} />
      </mesh>
      <Block y={-0.08} w={1.3} h={0.1} d={4.2} mat={MAT.white} />
      <Block x={-1.7} y={0} w={0.6} h={1.1} d={0.1} mat={plastic('#2f86e8')} />
      <Block x={-1.7} y={-0.05} w={0.6} h={0.08} d={1.6} mat={MAT.white} />
    </group>
  )
}

function InfinitySkull() {
  const ice = plastic('#8fd6ff', { emissive: '#3a8cff', emissiveIntensity: 0.55, transparent: true, opacity: 0.82, roughness: 0.2 })
  return (
    <group scale={1.3}>
      <mesh position={[0, 1.3, 0]} scale={[1, 0.95, 1.1]} material={ice} castShadow>
        <sphereGeometry args={[1, 24, 16]} />
      </mesh>
      <Block y={0.15} z={0.25} w={1.2} h={0.6} d={1} mat={ice} />
      {[-0.38, 0.38].map((x) => (
        <mesh key={x} position={[x, 1.15, 0.85]} material={plastic('#0d1a3a')}>
          <sphereGeometry args={[0.26, 14, 10]} />
        </mesh>
      ))}
      <mesh position={[0, 0.82, 1]} rotation-x={Math.PI} material={plastic('#0d1a3a')}>
        <coneGeometry args={[0.12, 0.22, 3]} />
      </mesh>
    </group>
  )
}

const MODELS = { robot: RobotHead, cursed: CursedBox, jet: Jet, skull: InfinitySkull }

function labelLines(t) {
  const lines = []
  if (t.count) lines.push({ text: t.count, size: 70, fill: '#ff2d2d', stroke: '#3a0000' })
  lines.push({ text: t.name, size: 64 })
  lines.push({ text: t.rarity, size: 38, ...RARITY_PILL[t.rarity] })
  if (t.price) lines.push({ text: t.price, size: 64, fill: '#4dff3a', stroke: '#0b3a00' })
  if (t.note) lines.push({ text: t.note, size: 34, fill: '#4dff3a', stroke: '#0b3a00' })
  return lines
}

// Showcase pedestals: a studded coloured pad, the treasure turning slowly
// above it, and its floating name / rarity / value label.
export default function Treasures() {
  const spinners = useRef([])
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    spinners.current.forEach((g, i) => {
      if (!g) return
      g.rotation.y = t * 0.5 + i
      g.position.y = 0.5 + Math.sin(t * 1.6 + i) * 0.12
    })
  })
  return TREASURES.map((t, i) => {
    const Model = MODELS[t.id]
    const big = t.id === 'skull'
    return (
      <group key={t.id} position={[t.x, 0, t.z]}>
        <Block w={big ? 5 : 3.6} h={0.3} d={big ? 5 : 3.6} mat={padMaterial(t.pad)} />
        <group ref={(g) => (spinners.current[i] = g)}>
          <Model />
        </group>
        <Label position={[0, big ? 7.6 : 5.6, 0]} height={big ? 4.4 : 3.4} lines={labelLines(t)} />
      </group>
    )
  })
}
