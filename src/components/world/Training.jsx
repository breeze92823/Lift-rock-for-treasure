import { useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Color, MeshStandardMaterial } from 'three'
import { useGameStore } from '../../store/useGameStore.js'
import { padUnlocked } from '../../systems/rebirth.js'
import { TRAINING, TRAINING_PADS, rowBaseY } from '../../data/world.js'
import { MAT, padMaterial, plastic } from '../../materials/world.js'
import { weightTexture } from '../../utils/textures.js'
import { armIconTexture, trainingBannerTexture, trainingLabelTexture } from '../../utils/labels.js'
import { Block, Flat } from './parts.jsx'

const { pad: PAD, platform: PLAT, rowX, slotZ } = TRAINING
const RIM = 0.3 // pad frame height above the platform
const TOP = RIM + 0.04 // top of the pad's studded inside

// One long barbell resting beside the pad's centre, bar running north-south.
// Chunky glossy plates with a hub, a colour-matched metallic bar and end caps;
// patterned sets (splatter / leopard / cookie) get a painted plate texture.
function Barbell({ color, bar, pattern, x }) {
  const plate = useMemo(
    () => (pattern ? plastic(color, { map: weightTexture(pattern, color), roughness: 0.45 }) : plastic(color, { roughness: 0.45 })),
    [color, pattern],
  )
  const rim = useMemo(() => plastic(color, { roughness: 0.45, metalness: 0.05 }), [color])
  const barMat = useMemo(() => plastic(bar, { roughness: 0.3, metalness: 0.6 }), [bar])
  const hub = useMemo(() => plastic('#22242a', { roughness: 0.4, metalness: 0.4 }), [])
  return (
    <group position={[x, TOP + 0.6, 0]}>
      <mesh rotation-x={Math.PI / 2} material={barMat} castShadow>
        <cylinderGeometry args={[0.1, 0.1, 4.6, 12]} />
      </mesh>
      {[-1, 1].map((s) => (
        <group key={s}>
          <mesh position={[0, 0, s * 1.45]} rotation-x={Math.PI / 2} material={plate} castShadow>
            <cylinderGeometry args={[0.6, 0.6, 0.5, 24]} />
          </mesh>
          <mesh position={[0, 0, s * 1.85]} rotation-x={Math.PI / 2} material={plate} castShadow>
            <cylinderGeometry args={[0.46, 0.46, 0.34, 24]} />
          </mesh>
          <mesh position={[0, 0, s * 1.2]} rotation-x={Math.PI / 2} material={rim}>
            <cylinderGeometry args={[0.66, 0.66, 0.06, 24]} />
          </mesh>
          <mesh position={[0, 0, s * 2.04]} rotation-x={Math.PI / 2} material={hub}>
            <cylinderGeometry args={[0.2, 0.2, 0.06, 14]} />
          </mesh>
          <mesh position={[0, 0, s * 2.28]} rotation-x={Math.PI / 2} material={barMat}>
            <cylinderGeometry args={[0.16, 0.16, 0.2, 12]} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

// One big chocolate-chip cookie instead of a plain pad.
const CHIPS = [[-0.9, -0.7], [0.6, -1], [1.1, 0.3], [-0.3, 0.5], [0.2, 1.2], [-1.2, 0.9], [0.1, -0.2]]
function Cookie() {
  return (
    <group position={[0, TOP, 0]}>
      <mesh material={plastic('#c98a4b')} castShadow>
        <cylinderGeometry args={[1.9, 1.9, 0.14, 28]} />
      </mesh>
      {CHIPS.map(([cx, cz], k) => (
        <mesh key={k} position={[cx, 0.09, cz]} material={plastic('#4a2510')}>
          <cylinderGeometry args={[0.22, 0.22, 0.06, 8]} />
        </mesh>
      ))}
    </group>
  )
}

// Pad whose face cycles through the rainbow.
function CyclingFace() {
  const mat = useMemo(() => new MeshStandardMaterial({ roughness: 0.6 }), [])
  const tmp = useMemo(() => new Color(), [])
  useFrame(({ clock }) => mat.color.copy(tmp.setHSL((clock.elapsedTime * 0.12) % 1, 0.85, 0.6)))
  return <Block y={RIM} w={PAD - 0.8} h={0.04} d={PAD - 0.8} mat={mat} shadow={false} />
}

function Pad({ p }) {
  const locked = useGameStore((st) => !padUnlocked(p.req, st.rebirths))
  const label = useMemo(() => trainingLabelTexture(p), [p])
  return (
    <group position={[rowX[p.row], rowBaseY(p.row), slotZ[p.slot]]}>
      <Block w={PAD} h={RIM} d={PAD} mat={padMaterial(p.rim)} />
      {p.cycle ? (
        <CyclingFace />
      ) : (
        <Block y={RIM} w={PAD - 0.8} h={0.04} d={PAD - 0.8} mat={padMaterial(p.pad)} shadow={false} />
      )}
      {p.cookie && <Cookie />}
      {locked && (
        <mesh position={[0, RIM + 0.08, 0]} renderOrder={1}>
          <boxGeometry args={[PAD + 0.1, 0.2, PAD + 0.1]} />
          <meshBasicMaterial color="#101018" transparent opacity={0.72} />
        </mesh>
      )}
      {/* stays on the pad; the player lifts a copy */}
      <Barbell color={p.bell} bar={p.bar} pattern={p.pattern} x={1} />
      <sprite position={[2.4, TOP + 2, 0]} scale={[3.4, 1.7, 1]} renderOrder={2}>
        <spriteMaterial map={label} transparent depthWrite={false} toneMapped={false} />
      </sprite>
    </group>
  )
}

// East-side training platform: weight pads in two rows of five slots (the
// middle front slot is the entrance from the plaza), under the big slanted
// TRAINING banner on the east wall.
export default function Training() {
  const banner = useMemo(() => trainingBannerTexture(), [])
  const arm = useMemo(() => armIconTexture(), [])
  const { x0, x1, z0, z1, h } = PLAT
  const cx = (x0 + x1) / 2
  const cz = (z0 + z1) / 2
  return (
    <group>
      <Block x={cx} z={cz} w={x1 - x0 + 1.2} h={0.2} d={z1 - z0 + 1.2} mat={MAT.trainStep} />
      <Block x={cx} z={cz} w={x1 - x0} h={h} d={z1 - z0} mat={MAT.trainPlatform} />
      {[...TRAINING.steps, { x0: TRAINING.tier.x0, x1, h: TRAINING.tier.h }].map((s, i) => (
        <Block key={i} x={(s.x0 + s.x1) / 2} z={cz} w={s.x1 - s.x0} h={s.h} d={z1 - z0} mat={i === TRAINING.steps.length ? MAT.trainPlatform : MAT.trainStep} />
      ))}
      <Flat x0={x0} x1={rowX.front + PAD / 2} z0={slotZ[2] - PAD / 2} z1={slotZ[2] + PAD / 2} y={h} h={0.02} mat={MAT.trainEntry} />
      {TRAINING_PADS.map((p) => (
        <Pad key={`${p.row}${p.slot}`} p={p} />
      ))}

      <group position={[TRAINING.bannerX, 7.5, cz]} rotation-y={-Math.PI / 2}>
        <group rotation-x={-0.35}>
          <mesh castShadow>
            <boxGeometry args={[24, 24 / 5.12, 0.5]} />
            <meshStandardMaterial attach="material-0" color="#ff8a1a" />
            <meshStandardMaterial attach="material-1" color="#ff8a1a" />
            <meshStandardMaterial attach="material-2" color="#ff8a1a" />
            <meshStandardMaterial attach="material-3" color="#ff8a1a" />
            <meshBasicMaterial attach="material-4" map={banner} toneMapped={false} />
            <meshStandardMaterial attach="material-5" color="#ff8a1a" />
          </mesh>
          <sprite position={[-11.5, 3.6, 0.4]} scale={[4.5, 4.5, 1]}>
            <spriteMaterial map={arm} transparent depthWrite={false} toneMapped={false} />
          </sprite>
        </group>
      </group>
    </group>
  )
}
