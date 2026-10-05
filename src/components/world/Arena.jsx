import { useMemo } from 'react'
import { ARENA, HUB, WALL, WALLS } from '../../data/world.js'
import { MAT } from '../../materials/world.js'
import { chevronTexture, emblemTexture } from '../../utils/labels.js'
import { Block, Flat } from './parts.jsx'

const FLOOR_DEPTH = 2

// Pine trees standing on the green rim beside the Lift corridor.
const TREES = [
  [-18, -104, 1.1], [18, -104, 1.1], [-31, -107, 1.3], [31, -107, 1.3], [-14, -128, 1.5], [16, -140, 1.2],
  [-22, -165, 1.3], [24, -180, 1.1], [-12, -192, 1.2], [38, -120, 1.2], [-40, -150, 1.4],
  [-46, -103, 1], [46, -103, 1], [-62, -80, 1.2], [62, -70, 1.2],
]

function Tree({ x, z, s }) {
  return (
    <group position={[x, WALL.height, z]} scale={s}>
      <mesh position={[0, 1, 0]} material={MAT.bark} castShadow>
        <cylinderGeometry args={[0.45, 0.55, 2, 8]} />
      </mesh>
      {[[2.2, 3.2, 3], [4.2, 2.6, 2.6], [6, 1.9, 2.2]].map(([y, r, h], i) => (
        <mesh key={i} position={[0, y + h / 2, 0]} material={i % 2 ? MAT.leaf2 : MAT.leaf} castShadow>
          <coneGeometry args={[r, h, 8]} />
        </mesh>
      ))}
    </group>
  )
}

// The walled grass field, the hub plaza cross with its spawn emblem, and the
// chevron path running south between the plots.
export default function Arena() {
  const chevron = useMemo(() => {
    const t = chevronTexture()
    t.repeat.set(2, (ARENA.maxZ - (HUB.z + 8)) / 4)
    return t
  }, [])
  const emblem = useMemo(() => emblemTexture(), [])

  const w = ARENA.maxX - ARENA.minX
  const d = ARENA.maxZ - ARENA.minZ
  return (
    <group>
      <mesh position={[(ARENA.minX + ARENA.maxX) / 2, -FLOOR_DEPTH / 2, (ARENA.minZ + ARENA.maxZ) / 2]} material={MAT.grass} receiveShadow>
        <boxGeometry args={[w, FLOOR_DEPTH, d]} />
      </mesh>
      {WALLS.map((b, i) => (
        <Block key={i} {...b} y={0} mat={MAT.wall} shadow={false} />
      ))}

      {/* Hub plaza: north path to the Lift, cross arms west/east. */}
      <Flat x0={-5} x1={5} z0={ARENA.minZ} z1={HUB.z - 8} mat={MAT.path} />
      <Flat x0={-9} x1={9} z0={HUB.z - 8} z1={HUB.z + 8} mat={MAT.path} />
      <Flat x0={-32} x1={-9} z0={HUB.z - 4} z1={HUB.z + 4} mat={MAT.path} />
      <Flat x0={9} x1={30} z0={HUB.z - 4} z1={HUB.z + 4} mat={MAT.path} />
      <Flat x0={-4} x1={4} z0={HUB.z - 4} z1={HUB.z + 4} h={0.06} mat={MAT.pathDark} />
      <mesh position={[HUB.x, 0.065, HUB.z]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[7.6, 7.6]} />
        <meshStandardMaterial map={emblem} transparent roughness={0.9} polygonOffset polygonOffsetFactor={-1} />
      </mesh>

      {/* Chevron path south to the plots. */}
      <mesh position={[0, 0.045, (HUB.z + 8 + ARENA.maxZ) / 2]} rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[8, ARENA.maxZ - (HUB.z + 8)]} />
        <meshStandardMaterial map={chevron} roughness={0.9} />
      </mesh>

      {TREES.map(([x, z, s], i) => (
        <Tree key={i} x={x} z={z} s={s} />
      ))}
    </group>
  )
}
