import { DoubleSide } from 'three'
import { STALLS } from '../../data/world.js'
import { MAT, plastic } from '../../materials/world.js'
import { Block, Label, Npc } from './parts.jsx'

const STRIPES = 7
const ROOF_W = 4
const ROOF_D = 3.4

// Striped market awning, tilted down toward the front.
function Awning({ color, dark }) {
  const sw = ROOF_W / STRIPES
  return (
    <group position={[0, 3.35, 0.1]} rotation-x={0.28}>
      {Array.from({ length: STRIPES }, (_, i) => (
        <group key={i}>
          <Block x={-ROOF_W / 2 + sw * (i + 0.5)} y={0} w={sw} h={0.14} d={ROOF_D} mat={i % 2 ? MAT.white : plastic(color)} />
          {/* front valance */}
          <Block x={-ROOF_W / 2 + sw * (i + 0.5)} y={-0.45} z={ROOF_D / 2 - 0.05} w={sw} h={0.5} d={0.1} mat={i % 2 ? MAT.white : plastic(dark)} />
        </group>
      ))}
    </group>
  )
}

function Ring({ color }) {
  return (
    <group position={[0, 0.08, 3.4]} rotation-x={-Math.PI / 2}>
      <mesh>
        <torusGeometry args={[1.7, 0.1, 8, 48]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.7} toneMapped={false} />
      </mesh>
      <mesh>
        <circleGeometry args={[1.7, 48]} />
        <meshBasicMaterial color={color} transparent opacity={0.22} depthWrite={false} side={DoubleSide} />
      </mesh>
    </group>
  )
}

function Stall({ s }) {
  const counter = plastic(s.counter)
  return (
    <group position={[s.x, 0, s.z]} rotation-y={s.facing}>
      {/* counter + darker top */}
      <Block z={0.5} w={3.4} h={1.05} d={1.1} mat={counter} />
      <Block z={0.5} y={1.05} w={3.6} h={0.15} d={1.3} mat={MAT.woodDark} />
      {[[-1.7, -1.1], [1.7, -1.1], [-1.7, 1.05], [1.7, 1.05]].map(([x, z], i) => (
        <Block key={i} x={x} z={z} w={0.25} h={3.3} d={0.25} mat={MAT.wood} />
      ))}
      <Block z={-1.1} y={0} w={3.4} h={0.12} d={0.25} mat={MAT.wood} />
      <Awning color={s.color} dark={s.dark} />
      {s.npc && <Npc {...s.npc} position={[0, 0, -0.5]} />}
      <Label position={[0, 5, 0]} height={2.2} lines={[{ text: s.label, size: 110, fill: s.color, stroke: '#0e1a05', line: 20 }]} />
      <Ring color={s.color} />
    </group>
  )
}

export default function Stalls() {
  return STALLS.map((s) => <Stall key={s.id} s={s} />)
}
