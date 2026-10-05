import { Object3D } from 'three'
import { ARENA } from '../data/world.js'

// Sun offset from the arena centre. The whole arena fits in one shadow
// frustum, so the rig is fixed rather than following the player.
const CX = (ARENA.minX + ARENA.maxX) / 2
const CZ = (ARENA.minZ + ARENA.maxZ) / 2
const SUN = [CX + 45, 80, CZ + 35]
// The light aims at this; it must be in the scene for its matrix to update.
const TARGET = new Object3D()
TARGET.position.set(CX, 0, CZ)
const SHADOW_EXTENT = Math.max(ARENA.maxX - ARENA.minX, ARENA.maxZ - ARENA.minZ) * 0.62

// Bright, flat-ish daylight like a Roblox lobby: strong sky/ground bounce so
// colours stay saturated, and one shadow-casting sun.
export default function Lighting() {
  return (
    <>
      <hemisphereLight args={['#e6f7ff', '#6f7f4a', 1.1]} />
      <ambientLight intensity={0.35} />
      <primitive object={TARGET} />
      <directionalLight
        position={SUN}
        target={TARGET}
        color="#fffaf0"
        intensity={2.2}
        castShadow
        shadow-mapSize={[4096, 4096]}
        shadow-camera-left={-SHADOW_EXTENT}
        shadow-camera-right={SHADOW_EXTENT}
        shadow-camera-top={SHADOW_EXTENT}
        shadow-camera-bottom={-SHADOW_EXTENT}
        shadow-camera-near={1}
        shadow-camera-far={260}
        shadow-bias={-0.0004}
        shadow-normalBias={0.05}
      />
    </>
  )
}
