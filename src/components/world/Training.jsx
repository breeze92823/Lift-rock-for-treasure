import { useMemo } from 'react'
import { TRAINING, TRAINING_PADS } from '../../data/world.js'
import { MAT, padMaterial, plastic } from '../../materials/world.js'
import { armIconTexture, trainingBannerTexture, trainingLabelTexture } from '../../utils/labels.js'
import { Block } from './parts.jsx'

function Dumbbell({ color, dotted, rot }) {
  const plate = plastic(color)
  const accent = dotted ? plastic('#1a1a1a') : plate
  return (
    <group position={[0, 0.8, 0]} rotation-y={rot}>
      <mesh rotation-z={Math.PI / 2} material={MAT.post} castShadow>
        <cylinderGeometry args={[0.1, 0.1, 2.6, 10]} />
      </mesh>
      {[-1, 1].map((s) =>
        [0.85, 1.12].map((o, j) => (
          <mesh key={`${s}${j}`} position={[s * o, 0, 0]} rotation-z={Math.PI / 2} material={j ? accent : plate} castShadow>
            <cylinderGeometry args={[j ? 0.48 : 0.55, j ? 0.48 : 0.55, 0.24, 20]} />
          </mesh>
        )),
      )}
    </group>
  )
}

function Pad({ p, x, z, i }) {
  const label = useMemo(() => trainingLabelTexture(p), [p])
  return (
    <group position={[x, 0, z]}>
      <Block w={TRAINING.pad} h={0.25} d={TRAINING.pad} mat={padMaterial(p.pad)} />
      {p.cookie &&
        [[-1.2, -0.8], [0.9, 1.1], [1.4, -1.3], [-0.6, 1.5], [0.2, -0.2]].map(([cx, cz], k) => (
          <Block key={k} x={cx} z={cz} y={0.25} w={0.4} h={0.05} d={0.4} mat={plastic('#4a2510')} shadow={false} />
        ))}
      <group position={[0, 0.25, 0]}>
        <Dumbbell color={p.bell} dotted={p.dotted} rot={0.4 + i * 0.7} />
      </group>
      <sprite position={[0, 3.6, 0]} scale={[4.4, 2.2, 1]}>
        <spriteMaterial map={label} transparent depthWrite={false} toneMapped={false} />
      </sprite>
    </group>
  )
}

// East-side training strip: weight pads in two columns either side of a
// raised blue-edged walkway, under the big slanted TRAINING banner.
export default function Training() {
  const banner = useMemo(() => trainingBannerTexture(), [])
  const arm = useMemo(() => armIconTexture(), [])
  const { walkX, colX, rowZ } = TRAINING
  const z0 = rowZ[0] - 3
  const z1 = rowZ[rowZ.length - 1] + 3
  return (
    <group>
      <Block x={walkX} z={(z0 + z1) / 2} w={4} h={0.45} d={z1 - z0} mat={MAT.walkway} />
      {[-1, 1].map((s) => (
        <Block key={s} x={walkX + s * 2.1} z={(z0 + z1) / 2} w={0.3} h={0.7} d={z1 - z0} mat={plastic('#3d63d6')} />
      ))}
      {TRAINING_PADS.map((p, i) => (
        <Pad key={p.power} p={p} i={i} x={colX[i % 2]} z={rowZ[Math.floor(i / 2)]} />
      ))}

      <group position={[55, 7.5, (z0 + z1) / 2]} rotation-y={-Math.PI / 2}>
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
