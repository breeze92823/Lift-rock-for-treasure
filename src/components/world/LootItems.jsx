import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, DoubleSide, Quaternion, Vector2, Vector3 } from 'three'
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

function Coin() {
  const gold = plastic('#ffc61a', { roughness: 0.3, metalness: 0.5 })
  const deep = plastic('#e29a0b', { roughness: 0.35, metalness: 0.5 })
  return (
    <group position={[0, 0.5, 0]} rotation-x={Math.PI / 2}>
      <mesh material={gold}>
        <cylinderGeometry args={[0.46, 0.46, 0.09, 28]} />
      </mesh>
      {/* Raised rim, recessed face and a star on each side */}
      <mesh material={deep}>
        <torusGeometry args={[0.46, 0.04, 8, 28]} />
      </mesh>
      {[-1, 1].map((s) => (
        <group key={s} position={[0, s * 0.047, 0]} rotation-x={s * Math.PI / 2}>
          <mesh material={deep}>
            <circleGeometry args={[0.36, 24]} />
          </mesh>
          <mesh position={[0, 0, 0.005]} rotation-z={Math.PI / 2} material={gold}>
            <cylinderGeometry args={[0.2, 0.2, 0.01, 5]} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

const BELL_PROFILE = [
  [0, 0.78], [0.1, 0.77], [0.18, 0.7], [0.24, 0.56], [0.29, 0.4], [0.34, 0.26], [0.42, 0.14], [0.52, 0.02],
].map(([r, y]) => new Vector2(r, y))

function BrassBell() {
  const brass = plastic('#f2b81c', { roughness: 0.28, metalness: 0.6, side: DoubleSide })
  const dark = plastic('#b9810f', { roughness: 0.35, metalness: 0.6 })
  return (
    <group position={[0, 0.05, 0]}>
      <mesh material={brass}>
        <latheGeometry args={[BELL_PROFILE, 28]} />
      </mesh>
      {/* Flared lip, shoulder band, crown loop and clapper */}
      <mesh position={[0, 0.03, 0]} rotation-x={Math.PI / 2} material={dark}>
        <torusGeometry args={[0.51, 0.04, 8, 28]} />
      </mesh>
      <mesh position={[0, 0.5, 0]} rotation-x={Math.PI / 2} material={dark}>
        <torusGeometry args={[0.26, 0.025, 8, 24]} />
      </mesh>
      <mesh position={[0, 0.9, 0]} material={dark}>
        <torusGeometry args={[0.09, 0.03, 8, 16]} />
      </mesh>
      <mesh position={[0, 0.0, 0]} material={dark}>
        <sphereGeometry args={[0.11, 12, 10]} />
      </mesh>
    </group>
  )
}

function Binoculars() {
  const body = plastic('#324f9a', { roughness: 0.5 })
  const dark = plastic('#17254a', { roughness: 0.45 })
  const lens = plastic('#7fd6ff', { emissive: '#2a8fd0', emissiveIntensity: 0.5, roughness: 0.1, metalness: 0.2 })
  return (
    <group position={[0, 0.32, 0]} rotation-y={0.3}>
      {[-1, 1].map((s) => (
        <group key={s} position={[s * 0.24, 0, 0]}>
          {/* Barrel along Z: objective bell at the front, eyepiece at the back */}
          <mesh rotation-x={Math.PI / 2} material={body}>
            <cylinderGeometry args={[0.15, 0.17, 0.8, 16]} />
          </mesh>
          <mesh position={[0, 0, 0.5]} rotation-x={Math.PI / 2} material={body}>
            <cylinderGeometry args={[0.24, 0.17, 0.26, 16]} />
          </mesh>
          <mesh position={[0, 0, 0.64]} rotation-x={Math.PI / 2} material={dark}>
            <cylinderGeometry args={[0.25, 0.25, 0.04, 16]} />
          </mesh>
          <mesh position={[0, 0, 0.665]} rotation-x={Math.PI / 2} material={lens}>
            <cylinderGeometry args={[0.2, 0.2, 0.02, 16]} />
          </mesh>
          <mesh position={[0, 0, -0.48]} rotation-x={Math.PI / 2} material={dark}>
            <cylinderGeometry args={[0.13, 0.15, 0.18, 14]} />
          </mesh>
          <mesh position={[0, 0.17, 0.1]} material={dark}>
            <boxGeometry args={[0.12, 0.05, 0.2]} />
          </mesh>
        </group>
      ))}
      {/* Hinge bridge and focus wheel */}
      <mesh position={[0, 0, 0.05]} material={dark}>
        <boxGeometry args={[0.3, 0.1, 0.34]} />
      </mesh>
      <mesh position={[0, 0.07, 0.05]} rotation-z={Math.PI / 2} material={body}>
        <cylinderGeometry args={[0.07, 0.07, 0.16, 12]} />
      </mesh>
    </group>
  )
}

function IronBar() {
  const iron = plastic('#eceff5', { roughness: 0.4, metalness: 0.35 })
  const shade = plastic('#c7ccd8', { roughness: 0.45, metalness: 0.35 })
  return (
    <group position={[0, 0.2, 0]} rotation-y={0.5}>
      <mesh material={iron}>
        <boxGeometry args={[0.46, 0.3, 1.2]} />
      </mesh>
      {/* Bevelled top and end caps, stamped groove along the top */}
      <mesh position={[0, 0.17, 0]} material={shade}>
        <boxGeometry args={[0.34, 0.06, 1.08]} />
      </mesh>
      <mesh position={[0, 0.205, 0]} material={iron}>
        <boxGeometry args={[0.1, 0.02, 0.8]} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[0, 0, s * 0.61]} material={shade}>
          <boxGeometry args={[0.4, 0.24, 0.04]} />
        </mesh>
      ))}
    </group>
  )
}

function PirateHat() {
  const felt = plastic('#14151a', { roughness: 0.8 })
  const trim = plastic('#d7a62b', { roughness: 0.35, metalness: 0.5 })
  const white = plastic('#f6f4ea')
  return (
    <group position={[0, 0.3, 0]} rotation-x={-0.15}>
      {/* Wide brim and domed crown */}
      <mesh scale={[1.15, 0.2, 0.8]} material={felt}>
        <sphereGeometry args={[0.55, 24, 12]} />
      </mesh>
      <mesh position={[0, 0.12, 0]} scale={[1, 0.8, 0.8]} material={felt}>
        <sphereGeometry args={[0.4, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
      </mesh>
      {/* Brim turned up on both sides */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 0.5, 0.1, 0]} rotation-z={-s * 0.6} scale={[0.5, 0.14, 0.72]} material={felt}>
          <sphereGeometry args={[0.4, 16, 10]} />
        </mesh>
      ))}
      {/* Gold edge trim */}
      <mesh position={[0, 0.02, 0]} rotation-x={Math.PI / 2} scale={[1.1, 0.78, 1]} material={trim}>
        <torusGeometry args={[0.56, 0.018, 6, 40]} />
      </mesh>
      {/* Skull and crossbones on the front */}
      <group position={[0, 0.14, 0.34]} rotation-x={0.35}>
        <mesh material={white}>
          <sphereGeometry args={[0.1, 12, 10]} />
        </mesh>
        <mesh position={[0, -0.09, 0]} material={white}>
          <boxGeometry args={[0.09, 0.06, 0.07]} />
        </mesh>
        {[-1, 1].map((s) => (
          <mesh key={s} position={[0, -0.14, -0.01]} rotation-z={s * 0.7} material={white}>
            <boxGeometry args={[0.3, 0.035, 0.03]} />
          </mesh>
        ))}
        {[-1, 1].map((s) => (
          <mesh key={s} position={[s * 0.04, 0.01, 0.085]} material={felt}>
            <sphereGeometry args={[0.025, 8, 6]} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

function Anvil() {
  const iron = plastic('#7d8593', { roughness: 0.4, metalness: 0.6 })
  const dark = plastic('#565c68', { roughness: 0.45, metalness: 0.6 })
  const face = plastic('#a9b0bd', { roughness: 0.3, metalness: 0.6 })
  return (
    <group position={[0, 0, 0]} rotation-y={0.4}>
      {/* Foot, waist, hardy block, working face, horn */}
      <mesh position={[0, 0.1, 0]} material={dark}>
        <boxGeometry args={[0.75, 0.2, 0.45]} />
      </mesh>
      <mesh position={[0, 0.33, 0]} scale={[1, 1, 1]} material={iron}>
        <cylinderGeometry args={[0.2, 0.3, 0.3, 4]} />
      </mesh>
      <mesh position={[0, 0.58, 0]} material={iron}>
        <boxGeometry args={[0.8, 0.22, 0.42]} />
      </mesh>
      <mesh position={[0, 0.7, 0]} material={face}>
        <boxGeometry args={[0.8, 0.04, 0.42]} />
      </mesh>
      <mesh position={[0.6, 0.6, 0]} rotation-z={-Math.PI / 2} material={iron}>
        <coneGeometry args={[0.2, 0.46, 12]} />
      </mesh>
      <mesh position={[-0.45, 0.55, 0]} material={dark}>
        <boxGeometry args={[0.12, 0.2, 0.32]} />
      </mesh>
      <mesh position={[-0.2, 0.74, 0.12]} material={dark}>
        <cylinderGeometry args={[0.04, 0.04, 0.06, 8]} />
      </mesh>
    </group>
  )
}

function Dagger() {
  const blade = plastic('#eef3fa', { roughness: 0.18, metalness: 0.75 })
  const edge = plastic('#b8c3d3', { roughness: 0.2, metalness: 0.75 })
  const grip = plastic('#c7222c', { roughness: 0.55 })
  const gold = plastic('#e3ac22', { roughness: 0.3, metalness: 0.6 })
  return (
    <group rotation-z={0.55} position={[0, 0.5, 0]}>
      {/* Tapered blade with a fuller down the middle */}
      <mesh position={[0, 0.55, 0]} scale={[1, 1, 0.22]} material={blade}>
        <coneGeometry args={[0.13, 0.9, 4]} />
      </mesh>
      <mesh position={[0, 0.5, 0]} scale={[0.22, 1, 0.26]} material={edge}>
        <coneGeometry args={[0.13, 0.7, 4]} />
      </mesh>
      {/* Crossguard, wrapped grip, pommel */}
      <mesh position={[0, 0.08, 0]} material={gold}>
        <boxGeometry args={[0.42, 0.06, 0.1]} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 0.21, 0.08, 0]} material={gold}>
          <sphereGeometry args={[0.05, 8, 6]} />
        </mesh>
      ))}
      <mesh position={[0, -0.1, 0]} material={grip}>
        <cylinderGeometry args={[0.04, 0.045, 0.3, 10]} />
      </mesh>
      {[-0.16, -0.1, -0.04].map((y) => (
        <mesh key={y} position={[0, y, 0]} material={gold}>
          <torusGeometry args={[0.046, 0.008, 6, 12]} />
        </mesh>
      ))}
      <mesh position={[0, -0.28, 0]} material={gold}>
        <sphereGeometry args={[0.07, 12, 10]} />
      </mesh>
    </group>
  )
}

function tntLabel() {
  return canvasTexture('loot-tnt-label', 128, 64, (ctx, w, h) => {
    ctx.fillStyle = '#f4efe0'
    ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = '#b3141b'
    ctx.font = '900 44px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('TNT', w / 2, h / 2 + 2)
  })
}

function TNT() {
  const red = plastic('#d42a2a', { roughness: 0.55 })
  const band = plastic('#d9c28a')
  const fuse = plastic('#3a2a1c')
  const spark = plastic('#ffb020', { emissive: '#ff7a00', emissiveIntensity: 1.2 })
  return (
    <group position={[0, 0.02, 0]} rotation-z={0.1}>
      {[[-0.17, 0.06], [0.17, 0.06], [0, -0.14]].map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          <mesh position={[0, 0.5, 0]} material={red}>
            <cylinderGeometry args={[0.15, 0.15, 1, 14]} />
          </mesh>
          <mesh position={[0, 1.0, 0]} material={band}>
            <cylinderGeometry args={[0.1, 0.1, 0.03, 12]} />
          </mesh>
        </group>
      ))}
      {/* Twine bands and the label */}
      {[0.25, 0.75].map((y) => (
        <mesh key={y} position={[0, y, 0]} material={band}>
          <cylinderGeometry args={[0.34, 0.34, 0.07, 18]} />
        </mesh>
      ))}
      <mesh position={[0, 0.5, 0.34]}>
        <planeGeometry args={[0.36, 0.2]} />
        <meshStandardMaterial map={tntLabel()} roughness={0.7} />
      </mesh>
      {/* Curled fuse with a spark */}
      <mesh position={[0, 1.14, -0.02]} material={fuse}>
        <cylinderGeometry args={[0.018, 0.018, 0.24, 6]} />
      </mesh>
      <mesh position={[0.08, 1.3, -0.02]} rotation-z={-0.9} material={fuse}>
        <cylinderGeometry args={[0.018, 0.018, 0.2, 6]} />
      </mesh>
      <mesh position={[0.17, 1.38, -0.02]} material={spark}>
        <icosahedronGeometry args={[0.07, 0]} />
      </mesh>
    </group>
  )
}

function Bomb() {
  const iron = plastic('#4b52b8', { roughness: 0.3, metalness: 0.35 })
  const cap = plastic('#2b2f6e', { roughness: 0.4, metalness: 0.4 })
  const shine = plastic('#c8ccff', { roughness: 0.2, emissive: '#8a90ff', emissiveIntensity: 0.4 })
  const fuse = plastic('#3a2a1c')
  const spark = plastic('#ffb020', { emissive: '#ff7a00', emissiveIntensity: 1.2 })
  return (
    <group position={[0, 0.55, 0]}>
      <mesh material={iron}>
        <sphereGeometry args={[0.52, 24, 18]} />
      </mesh>
      <mesh position={[0, 0.52, 0]} material={cap}>
        <cylinderGeometry args={[0.15, 0.19, 0.16, 14]} />
      </mesh>
      <mesh position={[0, 0.62, 0]} rotation-x={Math.PI / 2} material={cap}>
        <torusGeometry args={[0.15, 0.025, 8, 16]} />
      </mesh>
      <mesh position={[0.04, 0.8, 0]} rotation-z={-0.25} material={fuse}>
        <cylinderGeometry args={[0.02, 0.02, 0.3, 6]} />
      </mesh>
      <mesh position={[0.14, 0.98, 0]} material={spark}>
        <icosahedronGeometry args={[0.08, 0]} />
      </mesh>
      {/* Glossy highlight and a band around the middle */}
      <mesh position={[-0.2, 0.25, 0.37]} scale={[1, 0.6, 0.4]} material={shine}>
        <sphereGeometry args={[0.1, 10, 8]} />
      </mesh>
      <mesh rotation-x={Math.PI / 2} material={cap}>
        <torusGeometry args={[0.52, 0.02, 6, 30]} />
      </mesh>
    </group>
  )
}

function Helmet() {
  const copper = plastic('#c9631b', { roughness: 0.35, metalness: 0.55 })
  const dark = plastic('#8f410f', { roughness: 0.4, metalness: 0.55 })
  const gold = plastic('#ffc736', { roughness: 0.3, metalness: 0.6 })
  return (
    <group position={[0, 0.04, 0]} rotation-y={0.5}>
      {/* Dome, rim band and the crest running front to back */}
      <mesh position={[0, 0.12, 0]} scale={[1, 0.95, 1.1]} material={copper}>
        <sphereGeometry args={[0.5, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
      </mesh>
      <mesh position={[0, 0.14, 0]} rotation-x={Math.PI / 2} scale={[1, 1.1, 1]} material={gold}>
        <torusGeometry args={[0.5, 0.045, 8, 28]} />
      </mesh>
      <mesh position={[0, 0.52, 0]} scale={[0.1, 0.34, 1.1]} material={dark}>
        <sphereGeometry args={[0.5, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
      </mesh>
      {/* Neck guard, nose guard and cheek plates */}
      <mesh position={[0, 0.07, -0.5]} rotation-x={-0.35} scale={[1, 0.25, 0.5]} material={copper}>
        <cylinderGeometry args={[0.5, 0.45, 0.4, 20]} />
      </mesh>
      <mesh position={[0, 0.2, 0.55]} material={dark}>
        <boxGeometry args={[0.07, 0.3, 0.05]} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 0.46, 0.0, 0.1]} rotation-y={s * 0.2} material={dark}>
          <boxGeometry args={[0.06, 0.3, 0.4]} />
        </mesh>
      ))}
      {/* Rivets */}
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2
        return (
          <mesh key={i} position={[Math.cos(a) * 0.5, 0.14, Math.sin(a) * 0.55]} material={gold}>
            <sphereGeometry args={[0.03, 8, 6]} />
          </mesh>
        )
      })}
    </group>
  )
}

// Hexagonal crystal: prism plus a pointed tip, standing on its base at `pos`.
function Crystal({ pos, rot, r, h, mat }) {
  return (
    <group position={pos} rotation={rot}>
      <mesh position={[0, h / 2, 0]} material={mat}>
        <cylinderGeometry args={[r, r * 1.08, h, 6]} />
      </mesh>
      <mesh position={[0, h + r * 0.7, 0]} material={mat}>
        <coneGeometry args={[r, r * 1.4, 6]} />
      </mesh>
    </group>
  )
}

const QUARTZ_SHARDS = [
  { pos: [0, 0, 0], rot: [0, 0, 0], r: 0.2, h: 0.55 },
  { pos: [0.25, 0, 0.05], rot: [0.1, 0.4, -0.5], r: 0.15, h: 0.4 },
  { pos: [-0.25, 0, 0.1], rot: [0.2, 0.9, 0.55], r: 0.16, h: 0.38 },
  { pos: [0.05, 0, -0.25], rot: [-0.5, 0.2, 0.1], r: 0.14, h: 0.34 },
  { pos: [-0.1, 0, 0.28], rot: [0.55, 0.6, -0.1], r: 0.12, h: 0.28 },
  { pos: [0.4, 0, -0.15], rot: [-0.3, 1.2, -0.95], r: 0.1, h: 0.2 },
]

function Quartz() {
  const glass = { emissive: '#4aa8ff', emissiveIntensity: 0.55, roughness: 0.12, metalness: 0.1, flatShading: true }
  const ice = plastic('#b8e6ff', glass)
  const pale = plastic('#e6f6ff', { ...glass, emissiveIntensity: 0.8 })
  return (
    <group position={[0, 0.02, 0]} rotation-y={0.3}>
      {QUARTZ_SHARDS.map((s, i) => (
        <Crystal key={i} {...s} mat={i % 2 ? pale : ice} />
      ))}
      <mesh position={[0, 0.03, 0]} scale={[1, 0.3, 1]} material={ice}>
        <dodecahedronGeometry args={[0.38, 0]} />
      </mesh>
    </group>
  )
}

function Emerald() {
  const mat = plastic('#2fe66a', { emissive: '#18c04a', emissiveIntensity: 0.5, roughness: 0.1, metalness: 0.1, flatShading: true })
  return (
    <group rotation={[0.5, 0, 0.2]} scale={[1, 0.75, 0.8]}>
      <mesh material={mat}>
        <octahedronGeometry args={[0.5, 0]} />
      </mesh>
    </group>
  )
}

const AMETHYST_SHARDS = [
  { pos: [0, 0, 0], rot: [0, 0, 0], r: 0.18, h: 0.5 },
  { pos: [0.28, 0, 0.05], rot: [0.1, 0.4, -0.55], r: 0.14, h: 0.38 },
  { pos: [-0.28, 0, 0.1], rot: [0.2, 0.9, 0.6], r: 0.15, h: 0.4 },
  { pos: [0.05, 0, -0.26], rot: [-0.5, 0.2, 0.1], r: 0.12, h: 0.3 },
  { pos: [-0.1, 0, 0.3], rot: [0.55, 0.6, -0.1], r: 0.11, h: 0.26 },
]

function Amethyst() {
  const glass = { emissive: '#9a3aff', emissiveIntensity: 0.6, roughness: 0.12, metalness: 0.1, flatShading: true }
  const deep = plastic('#a35cff', glass)
  const pale = plastic('#d2a8ff', { ...glass, emissiveIntensity: 0.85 })
  return (
    <group position={[0, -0.1, 0]} rotation-y={0.3}>
      {AMETHYST_SHARDS.map((s, i) => (
        <Crystal key={i} {...s} mat={i % 2 ? pale : deep} />
      ))}
    </group>
  )
}

function PorcelainVase() {
  const white = plastic('#f4f8ff', { roughness: 0.2, metalness: 0.05 })
  const blue = plastic('#2f5fc4', { roughness: 0.3 })
  return (
    <group position={[0, -0.3, 0]}>
      <mesh position={[0, 0.06, 0]} material={blue}>
        <cylinderGeometry args={[0.2, 0.24, 0.12, 20]} />
      </mesh>
      <mesh position={[0, 0.42, 0]} scale={[1, 1.15, 1]} material={white}>
        <sphereGeometry args={[0.38, 20, 16]} />
      </mesh>
      <mesh position={[0, 0.42, 0]} scale={[1.01, 0.18, 1.01]} material={blue}>
        <sphereGeometry args={[0.38, 20, 16]} />
      </mesh>
      <mesh position={[0, 0.88, 0]} material={white}>
        <cylinderGeometry args={[0.15, 0.2, 0.3, 20]} />
      </mesh>
      <mesh position={[0, 1.04, 0]} material={blue}>
        <cylinderGeometry args={[0.22, 0.17, 0.06, 20]} />
      </mesh>
    </group>
  )
}

// Stand-in for items that don't have a dedicated 3D model yet.
function GenericItem() {
  return (
    <mesh position={[0, 0.5, 0]}>
      <octahedronGeometry args={[0.4]} />
      <meshStandardMaterial color="#c9c9c9" roughness={0.35} metalness={0.4} />
    </mesh>
  )
}

const MODELS = {
  Coal, Bone, Skull, Mushroom, Anchor, Gem, 'Beaded Bracelet': Bracelet,
  Coin, 'Brass Bell': BrassBell, Binoculars, 'Iron Bar': IronBar, 'Pirate Hat': PirateHat,
  Anvil, Dagger, TNT, Bomb, Helmet, Quartz, Emerald, Amethyst, 'Porcelain Vase': PorcelainVase,
}

const RARITY = {
  Common: { fill: '#c9c9c9', glow: '#ffffff' },
  Uncommon: { fill: '#4dff3a', glow: '#7dffd0' },
  Rare: { fill: '#2fa8ff', glow: '#7fd0ff' },
  Epic: { fill: '#e43bff', glow: '#d84aff' },
  Legendary: { fill: '#ffb020', glow: '#ffd36a' },
  Mythic: { fill: '#ff4a6a', glow: '#ff8aa0' },
  Secret: { fill: '#9fe8ff', glow: '#d0f4ff' },
  Celestial: { fill: '#7a3df0', glow: '#b48aff' },
  Divine: { fill: '#fff2a0', glow: '#fff8d0' },
}
const RARITY_FALLBACK = RARITY.Common


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
  const Model = MODELS[name] || GenericItem
  const { fill, glow } = RARITY[rarity] || RARITY_FALLBACK
  const float = useRef()
  const halo = useRef()
  const uncommon = rarity !== 'Common'
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

// Items lying on `zone`'s Loot Floor (all items when no zone is given).
export default function LootItems({ zone }) {
  const collected = useGameStore((s) => s.collectedLoot)
  return LOOT.map((item, i) => {
    const z = item[4]
    if (collected.includes(i) || (zone && (z > zone.gate.zS || z < zone.gate.zN))) return null
    return <LootItem key={i} item={item} i={i} />
  })
}
