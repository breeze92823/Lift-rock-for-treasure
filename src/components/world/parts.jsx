import { useMemo } from 'react'
import { billboardTexture } from '../../utils/labels.js'
import { MAT, plastic } from '../../materials/world.js'

// Axis-aligned box sitting on y0 (default ground), centred on x/z.
export function Block({ x = 0, y = 0, z = 0, w, h, d, mat, rot = 0, shadow = true, name }) {
  return (
    <mesh name={name} position={[x, y + h / 2, z]} rotation-y={rot} material={mat} castShadow={shadow} receiveShadow>
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

// Blocky R6-style shopkeeper with an emoji head: round face, shades, grin,
// gold chain, one arm waving, and a name tag.
export function Npc({ shirt, pants, skin, shades, name, position, rot = 0, rootRef, armRef }) {
  const skinM = plastic(skin)
  return (
    <group ref={rootRef} position={position} rotation-y={rot}>
      <Block x={-0.25} w={0.48} h={0.95} d={0.48} mat={plastic(pants)} />
      <Block x={0.25} w={0.48} h={0.95} d={0.48} mat={plastic(pants)} />
      <Block y={0.95} w={1} h={0.95} d={0.5} mat={plastic(shirt)} />
      <Block x={-0.75} y={0.95} w={0.48} h={0.95} d={0.48} mat={skinM} />
      {/* right arm: hangs down, swings up to wave (driven by Stalls.jsx when armRef is set) */}
      <group ref={armRef} position={[0.75, 1.85, 0]} rotation-z={armRef ? -0.05 : -2.5}>
        <Block y={-0.95} w={0.48} h={0.95} d={0.48} mat={skinM} />
      </group>
      {/* gold chain */}
      <mesh position={[0, 1.78, 0.2]} rotation-x={0.35} material={plastic('#f2c230')}>
        <torusGeometry args={[0.3, 0.035, 8, 24]} />
      </mesh>
      {/* emoji head */}
      <mesh position={[0, 2.4, 0]} material={skinM} castShadow>
        <sphereGeometry args={[0.52, 28, 20]} />
      </mesh>
      {shades && (
        <group position={[0, 2.46, 0.44]}>
          <Block x={-0.19} y={-0.09} z={0.04} w={0.3} h={0.18} d={0.08} mat={MAT.black} />
          <Block x={0.19} y={-0.09} z={0.04} w={0.3} h={0.18} d={0.08} mat={MAT.black} />
          <Block y={-0.03} z={0.03} w={0.14} h={0.04} d={0.06} mat={MAT.black} />
        </group>
      )}
      {/* big grin: dark mouth with a teeth strip */}
      <group position={[0, 2.12, 0.46]}>
        <Block x={0} y={0} z={0} w={0.5} h={0.14} d={0.06} mat={MAT.black} />
        <Block x={0} y={0.02} z={0.03} w={0.44} h={0.07} d={0.04} mat={MAT.white} />
      </group>
      {name && <Label position={[0, 3.3, 0]} height={0.4} lines={[{ text: name, size: 70, fill: '#ffffff', stroke: '#000000', line: 10 }]} />}
    </group>
  )
}
