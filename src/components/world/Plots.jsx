import { useMemo } from 'react'
import { HOME_PLOT, PLOT, PLOTS } from '../../data/world.js'
import { MAT, plastic } from '../../materials/world.js'
import { homeIconTexture } from '../../utils/labels.js'
import { Block } from './parts.jsx'

const SLOTS = 6
const SLOT = 2.6
const UPPER_Y = 6
const CARPET_D = 5

// Grey studded deck with the red carpet runner and two rows of dark
// treasure slots, at height y. Returns slot centres for placing treasures.
function slotXs(cx) {
  const span = PLOT.width - 6
  return Array.from({ length: SLOTS }, (_, i) => cx - span / 2 + (span / (SLOTS - 1)) * i)
}

function Deck({ cx, z, y }) {
  const rowZ = PLOT.depth / 2 - 2.4
  return (
    <group>
      <Block x={cx} z={z} y={y + PLOT.h} w={PLOT.width - 1} h={0.05} d={CARPET_D} mat={MAT.carpet} />
      {[-1, 1].map((s) => (
        <Block key={s} x={cx} z={z + s * (CARPET_D / 2 + 0.15)} y={y + PLOT.h} w={PLOT.width - 1} h={0.07} d={0.3} mat={MAT.carpetEdge} shadow={false} />
      ))}
      {[-1, 1].map((s) =>
        slotXs(cx).map((x) => <Block key={`${s}${x}`} x={x} z={z + s * rowZ} y={y + PLOT.h} w={SLOT} h={0.45} d={SLOT} mat={MAT.slot} />),
      )}
    </group>
  )
}

// Small trophies displayed on the home plot's ground-floor slots.
const TROPHIES = [
  (m) => (
    <mesh material={plastic('#e8c07a', { metalness: 0.4, roughness: 0.35 })} rotation-x={Math.PI / 2} position-y={0.6} {...m}>
      <torusGeometry args={[0.5, 0.14, 10, 24]} />
    </mesh>
  ),
  (m) => (
    <mesh material={plastic('#ffffff', { emissive: '#bfe8ff', emissiveIntensity: 0.4 })} position-y={0.55} {...m}>
      <sphereGeometry args={[0.55, 20, 14]} />
    </mesh>
  ),
  () => (
    <group>
      <Block w={1.3} h={0.8} d={0.9} mat={plastic('#a0612a')} />
      <Block y={0.8} w={1.35} h={0.3} d={0.95} mat={plastic('#7a4318')} />
      <Block y={0.55} z={0.46} w={0.25} h={0.3} d={0.05} mat={plastic('#ffd23a', { metalness: 0.5 })} />
    </group>
  ),
  () => (
    <group>
      <mesh position-y={0.35} material={plastic('#f4e3c4')}>
        <cylinderGeometry args={[0.22, 0.28, 0.7, 12]} />
      </mesh>
      <mesh position-y={0.8} material={plastic('#ff8a2a')} scale={[1, 0.6, 1]}>
        <sphereGeometry args={[0.6, 18, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
      </mesh>
    </group>
  ),
  (m) => (
    <mesh material={plastic('#ff9ad8')} position-y={0.5} scale={[1, 0.8, 0.7]} {...m}>
      <sphereGeometry args={[0.6, 16, 12]} />
    </mesh>
  ),
]

function Ladder({ x, z, h, rot }) {
  const rungs = Math.floor(h / 0.5)
  return (
    <group position={[x, 0, z]} rotation-y={rot}>
      {[-0.45, 0.45].map((s) => (
        <Block key={s} x={s} w={0.15} h={h} d={0.15} mat={MAT.wood} />
      ))}
      {Array.from({ length: rungs }, (_, i) => (
        <Block key={i} y={0.3 + i * 0.5} w={0.9} h={0.1} d={0.12} mat={MAT.woodDark} shadow={false} />
      ))}
    </group>
  )
}

// The player's own plot gets a second storey on posts, a ladder, a railing
// and trophies on the ground-floor slots.
function UpperStorey({ cx, z, side }) {
  const w = PLOT.width
  const d = PLOT.depth
  const icon = useMemo(() => homeIconTexture(), [])
  const posts = [-w / 2 + 0.2, -w / 6, w / 6, w / 2 - 0.2]
  const outerX = cx + side * (w / 2)
  return (
    <group>
      <Block x={cx} z={z} y={UPPER_Y} w={w} h={PLOT.h} d={d} mat={MAT.plot} />
      <Deck cx={cx} z={z} y={UPPER_Y} />
      {[-1, 1].map((s) =>
        posts.map((px) => <Block key={`${s}${px}`} x={cx + px} z={z + s * (d / 2 - 0.2)} y={PLOT.h} w={0.3} h={UPPER_Y - PLOT.h} d={0.3} mat={MAT.post} />),
      )}
      {/* railing */}
      {[-1, 1].map((s) => (
        <Block key={`r${s}`} x={cx} z={z + s * (d / 2 - 0.1)} y={UPPER_Y + 1.3} w={w} h={0.15} d={0.15} mat={MAT.post} shadow={false} />
      ))}
      <Block x={outerX - side * 0.1} z={z} y={UPPER_Y + 1.3} w={0.15} h={0.15} d={d} mat={MAT.post} shadow={false} />
      {[-1, 1].map((s) =>
        posts.map((px) => <Block key={`rp${s}${px}`} x={cx + px} z={z + s * (d / 2 - 0.1)} y={UPPER_Y + PLOT.h} w={0.15} h={1.1} d={0.15} mat={MAT.post} shadow={false} />),
      )}
      <Ladder x={outerX + side * 0.2} z={z + d / 2 - 3.5} h={UPPER_Y + 1.2} rot={Math.PI / 2} />
      {slotXs(cx).slice(0, TROPHIES.length).map((x, i) => {
        const T = TROPHIES[i]
        return (
          <group key={i} position={[x, PLOT.h + 0.45, z + (d / 2 - 2.4)]}>
            <T />
          </group>
        )
      })}
      <sprite position={[cx - side * (w / 2 - 1), UPPER_Y + 3.4, z]} scale={[2.4, 2.4, 1]}>
        <spriteMaterial map={icon} transparent depthWrite={false} toneMapped={false} />
      </sprite>
    </group>
  )
}

// South plots either side of the chevron path.
export default function Plots() {
  return PLOTS.map((p, i) => {
    const cx = p.side * (PLOT.inner + PLOT.width / 2)
    return (
      <group key={i}>
        <Block x={cx} z={p.z} w={PLOT.width} h={PLOT.h} d={PLOT.depth} mat={MAT.plot} />
        <Deck cx={cx} z={p.z} y={0} />
        {i === HOME_PLOT && <UpperStorey cx={cx} z={p.z} side={p.side} />}
      </group>
    )
  })
}
