import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, Quaternion, Vector3 } from 'three'
import { LOOT } from '../../data/loot.js'
import { useGameStore } from '../../store/useGameStore.js'
import { plastic } from '../../materials/world.js'
import { canvasTexture } from '../../utils/textures.js'
import { Label } from './parts.jsx'

// Loot lying on the first (dark grey) Lift zone. Each model rests on y=0 and
// is about 0.6-1.2 m across; the label floats above it.

const UP = new Vector3(0, 1, 0)

// Flattened blob stuck to the surface of a sphere of radius `r`, facing
// outward along `dir`. Used for coal patches and mushroom spots.
function Spot({ dir, r, size, mat, flat = 0.35, sx = 1 }) {
  const n = new Vector3(...dir).normalize()
  const q = new Quaternion().setFromUnitVectors(UP, n)
  const p = n.clone().multiplyScalar(r)
  return (
    <mesh position={p.toArray()} quaternion={q} scale={[sx, flat, 1]} material={mat}>
      <sphereGeometry args={[size, 12, 8]} />
    </mesh>
  )
}

const COAL_PATCHES = [
  { dir: [0.6, 0.55, 0.6], size: 0.2, sx: 1.2 },
  { dir: [-0.7, 0.4, 0.5], size: 0.17 },
  { dir: [0.1, 0.95, -0.2], size: 0.16 },
  { dir: [-0.3, 0.3, -0.9], size: 0.22, sx: 1.3 },
  { dir: [0.9, 0.25, -0.35], size: 0.14 },
  { dir: [-0.15, 0.1, 1], size: 0.13 },
  { dir: [0.35, 0.9, 0.35], size: 0.11 },
]

function Coal() {
  const rock = plastic('#b4b6c6', { flatShading: true })
  const rock2 = plastic('#a3a5b6', { flatShading: true })
  const black = plastic('#0d0d12', { roughness: 0.4 })
  const shine = plastic('#e8eaf4', { flatShading: true })
  return (
    <group position={[0, 0.42, 0]}>
      <mesh scale={[1.05, 0.82, 0.92]} material={rock}>
        <icosahedronGeometry args={[0.55, 1]} />
      </mesh>
      <mesh position={[-0.38, -0.12, 0.2]} scale={[1, 0.8, 1]} material={rock2}>
        <dodecahedronGeometry args={[0.3, 0]} />
      </mesh>
      <mesh position={[0.35, -0.15, 0.28]} material={rock2}>
        <dodecahedronGeometry args={[0.24, 0]} />
      </mesh>
      <mesh position={[0.05, 0.38, -0.15]} rotation={[0.4, 0.8, 0]} material={shine}>
        <dodecahedronGeometry args={[0.2, 0]} />
      </mesh>
      {COAL_PATCHES.map((p, i) => (
        <Spot key={i} r={0.5} mat={black} {...p} />
      ))}
    </group>
  )
}

function Bone() {
  const bone = plastic('#f4f1e4')
  const shade = plastic('#d9d4bf')
  return (
    <group position={[0, 0.17, 0]} rotation-y={0.6}>
      <mesh rotation-z={Math.PI / 2} material={bone}>
        <cylinderGeometry args={[0.09, 0.09, 1.1, 12]} />
      </mesh>
      {/* Thicker middle ridge, darker flared necks and the paired knobs. */}
      <mesh rotation-z={Math.PI / 2} material={shade}>
        <cylinderGeometry args={[0.1, 0.1, 0.5, 12]} />
      </mesh>
      {[-1, 1].map((s) => (
        <group key={s} position={[s * 0.58, 0, 0]}>
          <mesh position={[-s * 0.1, 0, 0]} rotation-z={(s * Math.PI) / 2} material={bone}>
            <coneGeometry args={[0.16, 0.22, 12]} />
          </mesh>
          {[-1, 1].map((t) => (
            <mesh key={t} position={[s * 0.04, 0.02, t * 0.13]} material={bone}>
              <sphereGeometry args={[0.15, 14, 10]} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  )
}

function Skull() {
  const bone = plastic('#e4f1cb')
  const shade = plastic('#c4d3a8')
  const dark = plastic('#101216', { roughness: 0.5 })
  return (
    <group position={[0, 0.02, 0]} rotation-y={0.2}>
      <mesh position={[0, 0.62, 0]} scale={[1, 0.95, 1.08]} material={bone}>
        <sphereGeometry args={[0.45, 22, 16]} />
      </mesh>
      {/* Cheekbones and upper jaw */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 0.3, 0.42, 0.25]} material={bone}>
          <sphereGeometry args={[0.14, 12, 10]} />
        </mesh>
      ))}
      <mesh position={[0, 0.33, 0.2]} material={bone}>
        <boxGeometry args={[0.48, 0.2, 0.36]} />
      </mesh>
      {/* Eye sockets with a shaded rim */}
      {[-1, 1].map((s) => (
        <group key={s} position={[s * 0.19, 0.58, 0.38]}>
          <mesh material={shade}>
            <sphereGeometry args={[0.15, 14, 10]} />
          </mesh>
          <mesh position={[0, 0, 0.04]} material={dark}>
            <sphereGeometry args={[0.12, 14, 10]} />
          </mesh>
        </group>
      ))}
      {/* Nose cavity */}
      <mesh position={[0, 0.42, 0.44]} rotation-x={Math.PI / 2 + 0.2} material={dark}>
        <coneGeometry args={[0.07, 0.14, 3]} />
      </mesh>
      {/* Upper teeth */}
      {[-0.17, -0.085, 0, 0.085, 0.17].map((x) => (
        <mesh key={x} position={[x, 0.2, 0.36]} material={plastic('#fbfff0')}>
          <boxGeometry args={[0.07, 0.1, 0.06]} />
        </mesh>
      ))}
      {/* Lower jaw */}
      <mesh position={[0, 0.1, 0.17]} material={bone}>
        <boxGeometry args={[0.4, 0.16, 0.3]} />
      </mesh>
      {[-0.14, -0.07, 0, 0.07, 0.14].map((x) => (
        <mesh key={x} position={[x, 0.2, 0.3]} material={plastic('#fbfff0')}>
          <boxGeometry args={[0.06, 0.08, 0.05]} />
        </mesh>
      ))}
    </group>
  )
}

const MUSHROOM_SPOTS = [
  { dir: [0, 1, 0], size: 0.15 },
  { dir: [0.75, 0.65, 0.25], size: 0.12 },
  { dir: [-0.7, 0.6, 0.45], size: 0.13 },
  { dir: [0.15, 0.6, -0.85], size: 0.12 },
  { dir: [0.55, 0.45, -0.7], size: 0.09 },
  { dir: [-0.5, 0.5, -0.7], size: 0.1 },
  { dir: [0.35, 0.8, 0.5], size: 0.08 },
]

function Mushroom() {
  const cap = plastic('#e51c28', { roughness: 0.55 })
  const white = plastic('#fffdf5')
  const cream = plastic('#f1dfbf')
  return (
    <group scale={1.1}>
      {/* Stem: flared foot, tapered neck, ring skirt */}
      <mesh position={[0, 0.07, 0]} material={cream}>
        <cylinderGeometry args={[0.2, 0.3, 0.14, 16]} />
      </mesh>
      <mesh position={[0, 0.3, 0]} material={cream}>
        <cylinderGeometry args={[0.15, 0.2, 0.34, 16]} />
      </mesh>
      <mesh position={[0, 0.34, 0]} material={white}>
        <cylinderGeometry args={[0.24, 0.17, 0.07, 16]} />
      </mesh>
      {/* Gills under the cap */}
      <mesh position={[0, 0.47, 0]} rotation-x={Math.PI} material={plastic('#d9c298')}>
        <circleGeometry args={[0.5, 24]} />
      </mesh>
      {/* Cap dome */}
      <group position={[0, 0.47, 0]}>
        <mesh scale={[1, 0.85, 1]} material={cap}>
          <sphereGeometry args={[0.52, 28, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        </mesh>
        <mesh position={[0, 0.02, 0]} rotation-x={Math.PI / 2} material={cap}>
          <torusGeometry args={[0.5, 0.03, 8, 28]} />
        </mesh>
        <group scale={[1, 0.85, 1]}>
          {MUSHROOM_SPOTS.map((s, i) => (
            <Spot key={i} r={0.525} mat={white} flat={0.3} {...s} />
          ))}
        </group>
      </group>
    </group>
  )
}

function Anchor() {
  const steel = plastic('#7f95ab', { roughness: 0.35, metalness: 0.45 })
  const dark = plastic('#566b80', { roughness: 0.4, metalness: 0.45 })
  const rope = plastic('#c9a15a')
  return (
    <group position={[0, 0.1, 0]} rotation-y={0.4}>
      {/* Shank */}
      <mesh position={[0, 0.78, 0]} material={steel}>
        <cylinderGeometry args={[0.065, 0.085, 1.3, 10]} />
      </mesh>
      {/* Ring at the top with a rope loop through it */}
      <mesh position={[0, 1.55, 0]} material={steel}>
        <torusGeometry args={[0.13, 0.04, 8, 16]} />
      </mesh>
      <mesh position={[0.02, 1.7, 0]} rotation-y={Math.PI / 2} material={rope}>
        <torusGeometry args={[0.1, 0.03, 8, 14]} />
      </mesh>
      {/* Stock: crossbar with ball ends and a collar */}
      <mesh position={[0, 1.2, 0]} rotation-z={Math.PI / 2} material={dark}>
        <cylinderGeometry args={[0.05, 0.05, 0.75, 10]} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 0.38, 1.2, 0]} material={dark}>
          <sphereGeometry args={[0.08, 10, 8]} />
        </mesh>
      ))}
      <mesh position={[0, 1.2, 0]} material={steel}>
        <sphereGeometry args={[0.11, 12, 10]} />
      </mesh>
      {/* Crown arc */}
      <mesh position={[0, 0.5, 0]} rotation-z={Math.PI} material={steel}>
        <torusGeometry args={[0.5, 0.07, 10, 28, Math.PI]} />
      </mesh>
      {/* Flukes: pointed palms at each arm tip */}
      {[-1, 1].map((s) => (
        <group key={s} position={[s * 0.5, 0.52, 0]} rotation-z={-s * 0.55}>
          <mesh position={[0, 0.02, 0]} scale={[1, 1, 0.45]} material={dark}>
            <coneGeometry args={[0.2, 0.36, 3]} />
          </mesh>
        </group>
      ))}
      {/* Ground contact: crown bulge */}
      <mesh position={[0, 0.0, 0]} material={steel}>
        <sphereGeometry args={[0.09, 10, 8]} />
      </mesh>
    </group>
  )
}

function Gem() {
  const glass = { emissive: '#00b8d9', emissiveIntensity: 0.45, roughness: 0.15, metalness: 0.1, flatShading: true }
  const body = plastic('#19e0ff', glass)
  const light = plastic('#8ff3ff', { ...glass, emissiveIntensity: 0.7 })
  return (
    <group position={[0, 0.02, 0]} rotation-y={0.5}>
      {/* Pavilion (point down), girdle, crown and flat table */}
      <mesh position={[0, 0.3, 0]} rotation-x={Math.PI} material={body}>
        <cylinderGeometry args={[0.55, 0.04, 0.6, 8]} />
      </mesh>
      <mesh position={[0, 0.66, 0]} material={body}>
        <cylinderGeometry args={[0.55, 0.55, 0.12, 8]} />
      </mesh>
      <mesh position={[0, 0.86, 0]} material={light}>
        <cylinderGeometry args={[0.3, 0.55, 0.28, 8]} />
      </mesh>
      <mesh position={[0, 1.0, 0]} rotation-x={-Math.PI / 2} material={plastic('#d5fbff', { emissive: '#7fe9ff', emissiveIntensity: 0.8 })}>
        <circleGeometry args={[0.3, 8]} />
      </mesh>
      {/* Small loose shards */}
      {[
        [0.75, 0.12, 0.3, 0.8],
        [-0.7, 0.1, -0.35, -0.6],
        [0.55, 0.09, -0.6, 0.3],
      ].map(([x, y, z, r], i) => (
        <mesh key={i} position={[x, y, z]} rotation={[0.5, r, 0.4]} material={body}>
          <octahedronGeometry args={[0.11 - i * 0.015, 0]} />
        </mesh>
      ))}
    </group>
  )
}

const BEAD_COLORS = ['#e8941f', '#7a3d12', '#d9b050', '#b5561c', '#4a2a14']
const BEADS = 22
function Bracelet() {
  return (
    <group position={[0, 0.1, 0]}>
      <mesh rotation-x={Math.PI / 2} material={plastic('#2a1a10')}>
        <torusGeometry args={[0.5, 0.025, 6, 32]} />
      </mesh>
      {Array.from({ length: BEADS }, (_, i) => {
        const a = (i / BEADS) * Math.PI * 2
        const big = i % 5 === 0
        const r = big ? 0.13 : 0.085 + 0.02 * Math.sin(i * 2.3)
        return (
          <mesh key={i} position={[Math.cos(a) * 0.5, big ? 0.03 : 0, Math.sin(a) * 0.5]} scale={[1, 0.9, 1]} material={plastic(big ? '#d83a2a' : BEAD_COLORS[i % BEAD_COLORS.length], { roughness: 0.45 })}>
            <sphereGeometry args={[r, 14, 10]} />
          </mesh>
        )
      })}
    </group>
  )
}

const MODELS = { Coal, Bone, Skull, Mushroom, Anchor, Gem, 'Beaded Bracelet': Bracelet }

const RARITY = {
  Common: { fill: '#c9c9c9', glow: '#ffffff' },
  Uncommon: { fill: '#4dff3a', glow: '#7dffd0' },
}


// White starburst: soft core plus long thin rays, tinted per rarity via the
// material colour. Lies on the floor under each floating item.
function starburstTexture() {
  return canvasTexture('loot-starburst', 256, 256, (ctx, w, h) => {
    ctx.translate(w / 2, h / 2)
    const core = ctx.createRadialGradient(0, 0, 0, 0, 0, w / 2)
    core.addColorStop(0, 'rgba(255,255,255,0.95)')
    core.addColorStop(0.25, 'rgba(255,255,255,0.45)')
    core.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = core
    ctx.fillRect(-w / 2, -h / 2, w, h)
    const rays = 14
    for (let i = 0; i < rays; i++) {
      const a = (i / rays) * Math.PI * 2 + (i % 2) * 0.1
      const len = w / 2 - (i % 2 ? 22 : 4)
      const g = ctx.createLinearGradient(0, 0, Math.cos(a) * len, Math.sin(a) * len)
      g.addColorStop(0, 'rgba(255,255,255,0.85)')
      g.addColorStop(1, 'rgba(255,255,255,0)')
      ctx.fillStyle = g
      ctx.save()
      ctx.rotate(a)
      ctx.beginPath()
      ctx.moveTo(0, -3)
      ctx.lineTo(len, 0)
      ctx.lineTo(0, 3)
      ctx.closePath()
      ctx.fill()
      ctx.restore()
    }
  })
}

const FLOAT_Y = 0.55

function LootItem({ item: [name, rarity, value, x, z], i }) {
  const price = `$${value}`
  const Model = MODELS[name]
  const { fill, glow } = RARITY[rarity]
  const float = useRef()
  const halo = useRef()
  const uncommon = rarity === 'Uncommon'
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    if (float.current) {
      float.current.position.y = FLOAT_Y + Math.sin(t * 1.8 + i) * 0.15
      float.current.rotation.y = t * 0.8 + i * 1.3
    }
    if (halo.current) halo.current.material.opacity = (uncommon ? 0.75 : 0.5) + Math.sin(t * 2.4 + i) * 0.12
  })
  return (
    <group position={[x, 0.04, z]}>
      <group ref={float} position={[0, FLOAT_Y, 0]}>
        <Model />
      </group>
      {/* Halo sprite glowing around the floating item */}
      <sprite ref={halo} position={[0, FLOAT_Y + 0.5, 0]} scale={[2.2, 2.2, 1]} renderOrder={2}>
        <spriteMaterial map={starburstTexture()} color={glow} transparent opacity={0.6} blending={AdditiveBlending} depthWrite={false} toneMapped={false} />
      </sprite>
      <Label
        position={[0, FLOAT_Y + 1.7, 0]}
        height={1.1}
        lines={[
          { text: name, size: 64 },
          { text: rarity, size: 34, fill, line: 5 },
          { text: price, size: 58, fill: '#4dff3a', stroke: '#0b3a00' },
        ]}
      />
    </group>
  )
}

export default function LootItems() {
  const collected = useGameStore((s) => s.collectedLoot)
  return LOOT.map((item, i) => (collected.includes(i) ? null : <LootItem key={i} item={item} i={i} />))
}
