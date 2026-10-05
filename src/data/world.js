// World layout, metres (+X east, +Z south, +Y up). North (-Z) is the Lift
// tower, the hub plaza sits in front of it, training is east, the pool and
// leaderboards west, and the player plots run south along the chevron path.

export const GROUND_Y = 0
export const GROUT = 0.05 // tile material grout width (materials/tile.js)

// Walkable interior of the walled arena.
export const ARENA = { minX: -56, maxX: 56, minZ: -72, maxZ: 48 }
export const WALL = { height: 5, thickness: 40 } // thick so the green rim runs to the fog

export const HUB = { x: 0, z: -45 } // spawn emblem at the plaza centre
export const SPAWN = { x: HUB.x, y: 0.3, z: HUB.z + 2 }
export const SPAWN_FACING = Math.PI // face -Z, toward the Lift tower

export const PLAYER_MOVE_SPEED = 10

export const COLORS = {
  grass: '#5fcf27',
  grass2: '#52c11f',
  wall: '#4467e2',
  wall2: '#3b5bd2',
  path: '#a9aab0',
  pathDark: '#8c8e95',
  chevronBase: '#7f838c',
  plot: '#a3a4a9',
  plot2: '#96979c',
  slot: '#55575e',
  carpet: '#c8161d',
  carpetEdge: '#f5d31c',
  liftDark: '#22252b',
  liftTop: '#9c9fa6',
  wood: '#8a4a22',
  wood2: '#6e3818',
  water: '#2fc4f2',
  curb: '#b9bcc4',
  glow: '#2de7ff',
}

// Hub stalls: counter faces `facing` (radians about +Y, 0 = facing +Z).
export const STALLS = [
  { id: 'sell', label: 'Sell', x: -11, z: -59, facing: Math.PI / 2, color: '#4ed82a', dark: '#2a9a12', counter: '#a5502a', npc: { shirt: '#111111', pants: '#2d2d2d', skin: '#f6d23a', shades: true } },
  { id: 'arms', label: 'Arms', x: 11, z: -59, facing: -Math.PI / 2, color: '#ff9a1a', dark: '#e0640a', counter: '#d4511a', npc: { shirt: '#17181c', pants: '#17181c', skin: '#f0f0f0' } },
  { id: 'aura', label: 'Aura', x: -15, z: -35, facing: Math.PI, color: '#b234e8', dark: '#7a17b0', counter: '#8a3b1e', npc: null },
  { id: 'upgrades', label: 'Upgrades', x: 15, z: -35, facing: Math.PI, color: '#35b6ff', dark: '#1679d9', counter: '#8a3b1e', npc: null },
]

// The Lift corridor: a walled channel running north from the plaza. It is a
// chain of zones (dark loot floor) separated by luck barriers, each barrier
// preceded by an orange LIFT stripe.
export const LIFT = {
  x: 0,
  width: 18, // inner width between the corridor walls
  wallW: 5, // thickness of the side walls
  zStart: ARENA.minZ, // corridor mouth: flush with the hub's north wall
  zoneLen: 20,
  stripeLen: 2,
  barrierLen: 5,
  barrierH: 5, // plinth + rock steps; matches the wall height
  barriers: [
    { luck: 2, req: '500', plinth: '#1f6b57', rock: '#2f8f78', rock2: '#3aa88c' },
    { luck: 3, req: '1.5K', plinth: '#6a3fb5', rock: '#8a5fd6', rock2: '#a583ea' },
    { luck: 4, req: '3K', plinth: '#b5611f', rock: '#d6812f', rock2: '#eca255' },
    { luck: 5, req: '5K', plinth: '#2a5fc4', rock: '#3f7fe8', rock2: '#68a0f8' },
  ],
}

// Lay the zones and barriers out north from zStart. Z values run decreasing.
let cursor = LIFT.zStart
export const LIFT_BARRIERS = LIFT.barriers.map((b) => {
  const stripe1 = cursor - LIFT.zoneLen
  const stripe0 = stripe1 - LIFT.stripeLen
  const zS = stripe0 // barrier south (front) face
  const zN = zS - LIFT.barrierLen
  cursor = zN
  return { ...b, stripeZ: (stripe1 + stripe0) / 2, zS, zN }
})
export const LIFT_END = cursor - LIFT.zoneLen // far end of the last zone

// Treasure display pedestals just south of the Lift corridor mouth.
export const TREASURES = [
  { id: 'robot', name: 'Robot Head', rarity: 'Secret', price: '$71.4M', x: -17, z: -66, pad: '#d8e6f0' },
  { id: 'cursed', name: 'Cursed Box', rarity: 'Celestial', price: '$580M', x: -11, z: -69, pad: '#7a3df0' },
  { id: 'jet', name: 'Jet', rarity: 'Secret', price: '$90M', x: -11, z: -63.5, pad: '#cfe9f7' },
  { id: 'skull', name: 'Infinity Skull', rarity: 'Exclusive', count: '983/1000', note: '150% of your BEST Treasure!', x: 11, z: -66, pad: '#ff9d1c' },
]

export const POOL = { x0: -52, x1: -33, z0: -64, z1: -28 }
export const LEADERBOARDS = [
  { title: 'Top Cash', frame: '#2fbf3a', z: -56 },
  { title: 'Top Power', frame: '#2f86e8', z: -46 },
  { title: 'Top Time', frame: '#e8302f', z: -36 },
]

// Training pads: two columns either side of a stepped walkway.
export const TRAINING = {
  walkX: 39,
  colX: [32.5, 45.5],
  rowZ: [-64, -56, -48, -40, -32],
  pad: 5,
}
export const TRAINING_PADS = [
  { power: 'x1.5', rebirths: 0, pad: '#9f8de8', bell: '#5a6fd6', starter: true },
  { power: 'x2', rebirths: 1, pad: '#6fe0c4', bell: '#8a5a2b' },
  { power: 'x3', rebirths: 2, pad: '#ffcb2e', bell: '#ff9d00' },
  { power: 'x5', rebirths: 3, pad: '#37d4ff', bell: '#1d6fd8' },
  { power: 'x10', rebirths: 4, pad: '#ff9e3d', bell: '#ff3ea5', dotted: true },
  { power: 'x15', rebirths: 5, pad: '#d81e28', bell: '#2b1416', dotted: true },
  { power: 'x25', rebirths: 7, pad: '#ff4fd0', bell: '#ff7ae0', dotted: true },
  { power: 'x50', rebirths: 10, pad: '#e8f4ff', bell: '#7fd6ff' },
  { power: 'x100', rebirths: 15, pad: '#35d43a', bell: '#1f9a22' },
  { power: 'x250', rebirths: 25, pad: '#b7743e', bell: '#7a4320', cookie: true },
]

// Player plots: long axis along X, entrance on the chevron-path side.
export const PLOT = { width: 32, depth: 18, h: 0.3, inner: 7 } // inner = gap from path centre
export const PLOT_ROWS_Z = [-21, 3, 27]
export const PLOTS = PLOT_ROWS_Z.flatMap((z) => [
  { side: -1, z },
  { side: 1, z },
])
export const HOME_PLOT = 0 // index into PLOTS: the player's own (two storeys)
const home = PLOTS[HOME_PLOT]
export const HOME_SPAWN = { x: home.side * (PLOT.inner + 2.5), y: 0.3, z: home.z }
export const HOME_FACING = home.side < 0 ? -Math.PI / 2 : Math.PI / 2

export const WORLD_BOUNDS = { minX: ARENA.minX, maxX: ARENA.maxX, minZ: LIFT_END, maxZ: ARENA.maxZ }

// Solid boxes {x, z, w, d, h}; anything taller than the player's step height
// (playerMovement.js) acts as a wall. Collision only — the components draw
// their own meshes.
const T = WALL.thickness
const AW = ARENA.maxX - ARENA.minX
const AD = ARENA.maxZ - ARENA.minZ
const midX = (ARENA.minX + ARENA.maxX) / 2
const midZ = (ARENA.minZ + ARENA.maxZ) / 2

const LW = LIFT.width / 2 // corridor half width
const nz = ARENA.minZ // north arena wall line
const nd = nz - LIFT_END // corridor depth beyond the arena wall

export const WALLS = [
  // North wall, split so the corridor passes through, plus its end cap.
  { x: (ARENA.minX - T - LW) / 2, z: (nz + LIFT_END) / 2, w: -ARENA.minX + T - LW, d: nd, h: WALL.height },
  { x: (ARENA.maxX + T + LW) / 2, z: (nz + LIFT_END) / 2, w: ARENA.maxX + T - LW, d: nd, h: WALL.height },
  { x: midX, z: LIFT_END - T / 2, w: AW + 2 * T, d: T, h: WALL.height },
  { x: midX, z: ARENA.maxZ + T / 2, w: AW + 2 * T, d: T, h: WALL.height },
  { x: ARENA.minX - T / 2, z: midZ, w: T, d: AD, h: WALL.height },
  { x: ARENA.maxX + T / 2, z: midZ, w: T, d: AD, h: WALL.height },
]

export const BLOCKS = [
  ...WALLS,
  ...LIFT_BARRIERS.map((b) => ({ x: LIFT.x, z: (b.zS + b.zN) / 2, w: LIFT.width, d: LIFT.barrierLen, h: LIFT.barrierH })),
  ...STALLS.map((s) => ({ x: s.x, z: s.z, w: 3, d: 3, h: 1.2 })),
  ...PLOTS.map((p) => ({ x: p.side * (PLOT.inner + PLOT.width / 2), z: p.z, w: PLOT.width, d: PLOT.depth, h: PLOT.h })),
]

export const COLLIDERS = BLOCKS.map((b) => ({
  x0: b.x - b.w / 2, x1: b.x + b.w / 2, z0: b.z - b.d / 2, z1: b.z + b.d / 2, top: GROUND_Y + b.h,
}))
