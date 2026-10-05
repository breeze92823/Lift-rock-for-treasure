import { useMemo } from 'react'
import { billboardTexture } from '../../utils/labels.js'
import { MAT, plastic } from '../../materials/world.js'

// Axis-aligned box sitting on y0 (default ground), centred on x/z.
export function Block({ x = 0, y = 0, z = 0, w, h, d, mat, rot = 0, shadow = true }) {
  return (
    <mesh position={[x, y + h / 2, z]} rotation-y={rot} material={mat} castShadow={shadow} receiveShadow>
      <boxGeometry args={[w, h, d]} />
    </mesh>
  )
}

// Thin flat decal-ish slab just above the floor (paths, carpets, pads).
export function Flat({ x0, x1, z0, z1, y = 0, h = 0.04, mat }) {
  return (
    <mesh position={[(x0 + x1) / 2, y + h / 2, (z0 + z1) / 2]} material={mat} receiveShadow>
      <boxGeometry args={[x1 - x0, h, z1 - z0]} />
    </mesh>
  )
}

// Camera-facing billboard label (Roblox BillboardGui); `height` in metres.
export function Label({ lines, position, height = 1 }) {
  const { map, aspect } = useMemo(() => billboardTexture(lines), [JSON.stringify(lines)]) // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <sprite position={position} scale={[height * aspect, height, 1]} renderOrder={2}>
      <spriteMaterial map={map} transparent depthWrite={false} toneMapped={false} />
    </sprite>
  )
}

// Blocky R6-style shopkeeper: legs, torso, arms, head (+ optional shades).
export function Npc({ shirt, pants, skin, shades, position, rot = 0 }) {
  return (
    <group position={position} rotation-y={rot}>
      <Block x={-0.25} w={0.48} h={0.95} d={0.48} mat={plastic(pants)} />
      <Block x={0.25} w={0.48} h={0.95} d={0.48} mat={plastic(pants)} />
      <Block y={0.95} w={1} h={0.95} d={0.5} mat={plastic(shirt)} />
      <Block x={-0.75} y={0.95} w={0.48} h={0.95} d={0.48} mat={plastic(skin)} />
      <Block x={0.75} y={0.95} w={0.48} h={0.95} d={0.48} mat={plastic(skin)} />
      <mesh position={[0, 2.2, 0]} material={plastic(skin)} castShadow>
        <cylinderGeometry args={[0.32, 0.32, 0.55, 20]} />
      </mesh>
      {shades && <Block y={2.22} z={0.3} w={0.66} h={0.14} d={0.06} mat={MAT.black} />}
    </group>
  )
}
