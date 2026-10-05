// World layout, metres (+X east, +Z south, +Y up). North (-Z) is the Lift
// tower, the hub plaza sits in front of it, training is east, the pool and
// leaderboards west, and the player plots run south along the chevron path.

export const GROUND_Y = 0
export const GROUT = 0.05 // tile material grout width (materials/tile.js)

// Walkable interior of the walled arena.
export const ARENA = { minX: -56, maxX: 56, minZ: -72, maxZ: 48 }
export const WALL = { height: 10, thickness: 40 } // thick so the green rim runs to the fog

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

// Hub stalls: one per plaza corner, counters angled toward the spawn emblem.
// `facing` is radians about +Y (0 = facing +Z).
const Q = Math.PI / 4
export const STALLS = [
  { id: 'aura', label: 'Aura', x: 12, z: -35, facing: -3 * Q, color: '#b234e8', dark: '#7a17b0', counter: '#8a3b1e', npc: { name: 'Mystic', shirt: '#2a1247', pants: '#17181c', skin: '#f6d23a', shades: true } },
  { id: 'sell', label: 'Sell', x: 12, z: -55, facing: -Q, color: '#4ed82a', dark: '#2a9a12', counter: '#a5502a', npc: { name: 'Cashy', shirt: '#111111', pants: '#2d2d2d', skin: '#f6d23a', shades: true } },
  { id: 'upgrades', label: 'Upgrades', x: -12, z: -35, facing: 3 * Q, color: '#35b6ff', dark: '#1679d9', counter: '#8a3b1e', npc: { name: 'Tinker', shirt: '#12324f', pants: '#2d2d2d', skin: '#f6d23a', shades: true } },
  { id: 'arms', label: 'Arms', x: -12, z: -55, facing: Q, color: '#ff9a1a', dark: '#e0640a', counter: '#d4511a', npc: { name: 'Brawn', shirt: '#17181c', pants: '#17181c', skin: '#f6d23a', shades: true } },
]

// Drainage channels sunk along both floor edges. Shallower than the player's
// step height so they can climb back out, but they do drop in.
export const DRAIN = { width: 1, depth: 0.5 }

// The Lift corridor: a walled channel running north from the plaza. It is a
// chain of identical zones. Each zone is an entry (Gateway or Lift Pad) followed
// by a Loot Floor that a rock gate covers completely.
export const LIFT = {
  x: 0,
  width: 18, // inner width between the corridor walls
  wallW: 5, // thickness of the side walls
  zStart: ARENA.minZ, // corridor mouth: flush with the hub's north wall
  entryLen: 4, // Gateway / Lift Pad at the south end of each zone
  lootLen: 16, // Loot Floor, fully covered by the zone's gate
  barrierH: 5, // plinth + rock steps; matches the wall height
  zones: [
    { luck: 1, req: '0', floor: '#3a3b40' },
    { luck: 2, req: '1.5K', floor: '#2f6fc0' },
    { luck: 5, req: '3K', floor: '#6a3fb5' },
    { luck: 10, req: '5K', floor: '#c026c8' },
    { luck: 20, req: '10K', floor: '#2f8f4a' },
    { luck: 30, req: '25K', floor: '#d98a1c' },
    { luck: 50, req: '75K', floor: '#c4272f' },
    { luck: 75, req: '200K', floor: '#1fb5b0' },
    { luck: 100, req: '500K', floor: '#8a5a2b' },
    { luck: 150, req: '1M', floor: '#e0e04a' },
    { luck: 200, req: '2.5M', floor: '#3b3fd1' },
    { luck: 300, req: '5M', floor: '#d1427a' },
    { luck: 500, req: '10M', floor: '#2fc27a' },
    { luck: 750, req: '25M', floor: '#7a2fd1' },
    { luck: 1000, req: '50M', floor: '#e8641c' },
    { luck: 1500, req: '100M', floor: '#17a0e0' },
    { luck: 2000, req: '250M', floor: '#b8123c' },
    { luck: 3000, req: '500M', floor: '#4a4f66' },
    { luck: 5000, req: '1B', floor: '#e6c14a' },
    { luck: 10000, req: '2.5B', floor: '#f2f4ff' },
  ],
}
const ZONE_LEN = LIFT.entryLen + LIFT.lootLen
// Gate health: 100, 500, 2.5K, 12.5K ... (x5 per zone). The gate is thrown once
// its bar is full; see systems/liftGate.js.
export const gateHealth = (i) => 100 * 5 ** i
const GATE_STYLE = { plinth: '#17191e', rock: '#eceef2', rock2: '#9ea1a8' }

// Lay the zones out north from zStart. Z values run decreasing.
export const LIFT_ZONES = LIFT.zones.map((zn, i) => {
  const zFrom = LIFT.zStart - i * ZONE_LEN
  const lootFrom = zFrom - LIFT.entryLen
  const zTo = zFrom - ZONE_LEN
  return {
    ...zn,
    hp: gateHealth(i),
    zFrom,
    zTo,
    entryZ: (zFrom + lootFrom) / 2,
    gate: {
      ...GATE_STYLE,
      luck: zn.luck,
      req: zn.req,
      hp: gateHealth(i),
      w: LIFT.width - 2 * DRAIN.width, // stops at the drainage channels
      zS: lootFrom,
      zN: zTo,
    },
  }
})
export const LIFT_END = LIFT.zStart - LIFT.zones.length * ZONE_LEN // far end of the last zone

export const LIFT_DRAINS = [-1, 1].map((s) => {
  const inner = LIFT.x + s * (LIFT.width / 2 - DRAIN.width)
  const outer = LIFT.x + s * (LIFT.width / 2)
  return { x0: Math.min(inner, outer), x1: Math.max(inner, outer), z0: LIFT_END, z1: LIFT.zStart, floor: -DRAIN.depth }
})

// Treasure display pedestals just south of the Lift corridor mouth.
export const TREASURES = [
  { id: 'robot', name: 'Robot Head', rarity: 'Secret', price: '$71.4M', x: -17, z: -66, pad: '#d8e6f0' },
  { id: 'cursed', name: 'Cursed Box', rarity: 'Celestial', price: '$580M', x: -11, z: -69, pad: '#7a3df0' },
  { id: 'jet', name: 'Jet', rarity: 'Secret', price: '$90M', x: -11, z: -63.5, pad: '#cfe9f7' },
  { id: 'skull', name: 'Infinity Skull', rarity: 'Exclusive', count: '983/1000', note: '150% of your BEST Treasure!', x: 11, z: -66, pad: '#ff9d1c' },
]

// Raised blue stand the three leaderboards stand on; the player walks up onto it.
export const POOL = { x0: -51, x1: -35, z0: -60, z1: -32, h: 0.4 }
// Shallow arc: side boards turn inward, the middle one stands slightly back.
// `rot` is the board's yaw (π/2 faces east, toward the hub).
// `stat` = the store key in useLeaderboardStore; Pool.jsx fills the rows from the server.
export const LEADERBOARDS = [
  { title: 'Top Cash', stat: 'cash', icon: 'cash', frame: '#2fbf3a', x: -46, z: -53.5, rot: Math.PI / 2 - 0.4 },
  { title: 'Top Power', stat: 'strength', icon: 'power', frame: '#2f86e8', x: -47.5, z: -46, rot: Math.PI / 2 },
  { title: 'Top Time', stat: 'playTime', icon: 'time', frame: '#e8302f', x: -46, z: -38.5, rot: Math.PI / 2 + 0.4 },
]
export const LEADERBOARD_ROWS = 7

// Training: one raised platform, two rows of five slots. The front row
// (nearest the hub plaza) has its middle slot left open as the entrance.
// Seen from the plaza looking east, slots run north to south.
export const TRAINING = {
  rowX: { front: 34, back: 43 },
  slotZ: [-64, -56, -48, -40, -32],
  pad: 5,
  platform: { x0: 30, x1: 48, z0: -68, z1: -28, h: 0.4 },
  // The back (higher-power) row stands on a raised tier reached by four steps.
  tier: { x0: 40.1, h: 2.4 },
  steps: [
    { x0: 36.5, x1: 37.4, h: 0.9 },
    { x0: 37.4, x1: 38.3, h: 1.4 },
    { x0: 38.3, x1: 39.2, h: 1.9 },
    { x0: 39.2, x1: 40.1, h: 2.4 },
  ],
  bannerX: 55,
}
// Floor height a pad row stands on.
export const rowBaseY = (row) => (row === 'back' ? TRAINING.tier.h : TRAINING.platform.h)
// req: { type: 'starter' } | { type: 'rebirth', n }.
// The powers of the x15, x100 and x250 pads are placeholders: the reference
// screenshots hide their label text.
export const TRAINING_PADS = [
  { row: 'front', slot: 0, power: 'x2', req: { type: 'rebirth', n: 1 }, pad: '#6fe0c4', rim: '#ff9e3d', bell: '#8a5a2b', bar: '#5ec9b4' },
  { row: 'front', slot: 1, power: 'x1.5', req: { type: 'starter' }, pad: '#9f8de8', rim: '#5b4aa8', bell: '#4a4f8a', bar: '#8d8fb5' },
  { row: 'front', slot: 3, power: 'x5', req: { type: 'rebirth', n: 2 }, pad: '#ffcb2e', rim: '#c98a00', bell: '#ff9d00', bar: '#4a4f58' },
  { row: 'front', slot: 4, power: 'x25', req: { type: 'rebirth', n: 7 }, pad: '#37d4ff', rim: '#1d7fd8', bell: '#1d6fd8', bar: '#37d4ff' },
  { row: 'back', slot: 0, power: 'x15', req: { type: 'rebirth', n: 5 }, pad: '#d81e28', rim: '#7a0f16', bell: '#c8202a', bar: '#2b2b30', pattern: 'splatter' },
  { row: 'back', slot: 1, power: 'x10', req: { type: 'rebirth', n: 4 }, pad: '#e8f4ff', rim: '#2fa0a8', bell: '#7fd6ff', bar: '#2fa0a8' },
  { row: 'back', slot: 2, power: 'x100', req: { type: 'rebirth', n: 15 }, pad: '#ff4fd0', rim: '#a02a86', bell: '#ff7ae0', bar: '#ffe94a', pattern: 'leopard', cycle: true },
  { row: 'back', slot: 3, power: 'x50', req: { type: 'rebirth', n: 10 }, pad: '#35d43a', rim: '#1f9a22', bell: '#1f9a22', bar: '#0f5f14' },
  { row: 'back', slot: 4, power: 'x250', req: { type: 'rebirth', n: 20 }, pad: '#b7743e', rim: '#7a4320', bell: '#c98a4b', bar: '#7a4320', pattern: 'cookie', cookie: true },
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
// Ground-floor treasure slots on the home plot: 2 rows x 6, world-space centres.
export const PLOT_SLOT = { count: 6, size: 2.6 }
export const PLOT_ROW_Z = PLOT.depth / 2 - 2.4 // slot-row offset from the plot's centre line
export const plotSlotXs = (cx) => {
  const span = PLOT.width - 6
  return Array.from({ length: PLOT_SLOT.count }, (_, i) => cx - span / 2 + (span / (PLOT_SLOT.count - 1)) * i)
}
export const HOME_SLOTS = [-1, 1].flatMap((s) =>
  plotSlotXs(home.side * (PLOT.inner + PLOT.width / 2)).map((x) => ({ x, z: home.z + s * PLOT_ROW_Z })),
)
export const HOME_FACING = home.side < 0 ? -Math.PI / 2 : Math.PI / 2

// Per-plot versions of the HOME_* constants above: the server assigns each player a plot index
// (backend `homePlot`), so these take it instead of assuming HOME_PLOT.
export const plotSpawn = (i) => ({ x: PLOTS[i].side * (PLOT.inner + 2.5), y: 0.3, z: PLOTS[i].z })
export const plotFacing = (i) => (PLOTS[i].side < 0 ? -Math.PI / 2 : Math.PI / 2)
export const plotSlotsAt = (i) =>
  [-1, 1].flatMap((s) =>
    plotSlotXs(PLOTS[i].side * (PLOT.inner + PLOT.width / 2)).map((x) => ({ x, z: PLOTS[i].z + s * PLOT_ROW_Z })),
  )

// Base Upgrade (board at the carpet entrance, systems/plotSlots.js): needs a rebirth, costs cash, and
// turns the player's own plot into the two-storey home build. Slots 0-11 are the ground floor, 12-23
// the upper deck (same x/z as the ground ones).
export const BASE_UPGRADE = { minRebirths: 1, cost: 5000, slots: 12, upgradedSlots: 24 }
export const isUpperSlot = (i) => i >= PLOT_SLOT.count * 2

// Solid parts of the home plot's ground-floor hall (components/world/Plots.jsx):
// treasure pedestals, orange pillars, corner posts and the back wall. Taller than
// the step height so the player can't climb onto them.
const HALL_H = PLOT.h + 1.6
// Per plot index, because the server assigns the player's plot (store.homePlot).
// The long sides are solid walls; the entrance on the path side stays open.
export const hallBlocksFor = (i) => {
  const pl = PLOTS[i]
  const cx = pl.side * (PLOT.inner + PLOT.width / 2)
  return [
    ...plotSlotsAt(i).map((p) => ({ x: p.x, z: p.z, w: 2.6, d: 2.6, h: HALL_H })),
    ...[-1, 1].map((s) => ({ x: cx + pl.side * (PLOT.width / 2 - 1.2), z: pl.z + s * 5.5, w: 1, d: 1, h: HALL_H })),
    ...[-1, 1].map((s) => ({ x: cx, z: pl.z + s * (PLOT.depth / 2 - 0.45), w: PLOT.width, d: 0.9, h: HALL_H })),
    { x: cx + pl.side * (PLOT.width / 2 - 0.15), z: pl.z, w: 0.3, d: PLOT.depth, h: HALL_H },
  ]
}

// Second storey (components/world/Plots.jsx UpperStorey): the deck is walkable only for a player
// already up there (collider.min), and is reached by a ladder on the path-side front of the plot.
export const UPPER_Y = 6
export const DECK_TOP = UPPER_Y + PLOT.h
export const LADDER_Z_OFF = PLOT.depth / 2 - 3.5 // along the plot's front edge, from its centre line
export const ladderAt = (i) => {
  const pl = PLOTS[i]
  const edgeX = pl.side * PLOT.inner // plot edge facing the path
  return { x: edgeX - pl.side * 0.35, z: pl.z + LADDER_Z_OFF, side: pl.side, edgeX, top: DECK_TOP }
}
export const LADDERS = PLOTS.map((_, i) => ladderAt(i))
export const LADDER_H = UPPER_Y + 1.2 // matches the Ladder mesh in Plots.jsx
export const LADDER_COLLIDERS = LADDERS.map((l) => ({
  x0: l.x - 0.15, x1: l.x + 0.15, z0: l.z - 0.55, z1: l.z + 0.55, top: GROUND_Y + LADDER_H,
}))
export const DECK_COLLIDERS = PLOTS.map((p) => {
  const cx = p.side * (PLOT.inner + PLOT.width / 2)
  return {
    x0: cx - PLOT.width / 2, x1: cx + PLOT.width / 2, z0: p.z - PLOT.depth / 2, z1: p.z + PLOT.depth / 2,
    top: DECK_TOP, min: UPPER_Y - 0.5,
  }
})

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

// Training collision: the platform and pad rims are walkable steps; each
// barbell is a solid wall, built from small boxes along its bar.
const TP = TRAINING.platform
const TRAINING_BLOCKS = [
  { x: (TP.x0 + TP.x1) / 2, z: (TP.z0 + TP.z1) / 2, w: TP.x1 - TP.x0, d: TP.z1 - TP.z0, h: TP.h },
  ...[...TRAINING.steps, { x0: TRAINING.tier.x0, x1: TP.x1, h: TRAINING.tier.h }].map((s) => ({
    x: (s.x0 + s.x1) / 2, z: (TP.z0 + TP.z1) / 2, w: s.x1 - s.x0, d: TP.z1 - TP.z0, h: s.h,
  })),
  ...TRAINING_PADS.flatMap((p) => {
    const px = TRAINING.rowX[p.row]
    const pz = TRAINING.slotZ[p.slot]
    const base = rowBaseY(p.row)
    const bells = [-1.6, -0.8, 0, 0.8, 1.6].map((o) => ({
      x: px + 1, z: pz + o, w: 1.1, d: 1.1, h: base + 1.4, // tall enough to block, not step onto
    }))
    return [{ x: px, z: pz, w: TRAINING.pad, d: TRAINING.pad, h: base + 0.3 }, ...bells]
  }),
]

// Where the player stands to work out: one spot per pad, on top of its rim.
export const TRAINING_SPOTS = TRAINING_PADS.map((p) => ({
  key: `${p.row}${p.slot}`,
  x: TRAINING.rowX[p.row],
  z: TRAINING.slotZ[p.slot],
  top: rowBaseY(p.row) + 0.3,
  bell: p.bell,
  power: parseFloat(p.power.slice(1)), // 'x1.5' -> 1.5
  req: p.req,
}))

export const BLOCKS = [
  ...WALLS,
  ...TRAINING_BLOCKS,
  { x: (POOL.x0 + POOL.x1) / 2, z: (POOL.z0 + POOL.z1) / 2, w: POOL.x1 - POOL.x0, d: POOL.z1 - POOL.z0, h: POOL.h },
  ...LIFT_ZONES.map(({ gate: b }) => ({ x: LIFT.x, z: (b.zS + b.zN) / 2, w: b.w, d: b.zS - b.zN, h: LIFT.barrierH, gate: b.luck })),
  // counter run as three small boxes along its (rotated) axis; AABBs can't turn
  ...STALLS.flatMap((s) => [-1.2, 0, 1.2].map((lx) => ({
    x: s.x + lx * Math.cos(s.facing) + 0.5 * Math.sin(s.facing),
    z: s.z - lx * Math.sin(s.facing) + 0.5 * Math.cos(s.facing),
    w: 1.4, d: 1.4, h: 1.2,
  }))),
  ...PLOTS.map((p) => ({ x: p.side * (PLOT.inner + PLOT.width / 2), z: p.z, w: PLOT.width, d: PLOT.depth, h: PLOT.h })),
]

const toCollider = (b) => ({
  x0: b.x - b.w / 2, x1: b.x + b.w / 2, z0: b.z - b.d / 2, z1: b.z + b.d / 2, top: GROUND_Y + b.h, gate: b.gate, // gate: luck of a Lift gate, which stops colliding once lifted
})
export const COLLIDERS = BLOCKS.map(toCollider)
// Solid things on the second-storey deck (railings on three sides, the front stays open at the
// ladder, and the treasure slots). Like the deck, they only count for a body already up there.
const UPPER_RAIL_H = 2.2 // taller than the railing looks so a jump can not clear it
const UPPER_SLOT_H = 0.8 // above the step height, so they can't be walked over
export const UPPER_COLLIDERS = PLOTS.map((p, i) => {
  const cx = p.side * (PLOT.inner + PLOT.width / 2)
  const outerX = cx + p.side * (PLOT.width / 2)
  const rail = (b, h) => ({ ...toCollider({ ...b, h: 0 }), top: DECK_TOP + h, min: DECK_COLLIDERS[i].min })
  return [
    ...[-1, 1].map((s) => rail({ x: cx, z: p.z + s * (PLOT.depth / 2 - 0.1), w: PLOT.width, d: 0.3 }, UPPER_RAIL_H)),
    rail({ x: outerX - p.side * 0.1, z: p.z, w: 0.3, d: PLOT.depth }, UPPER_RAIL_H),
    ...[-1, 1].flatMap((s) =>
      plotSlotXs(cx).map((x) => rail({ x, z: p.z + s * PLOT_ROW_Z, w: PLOT_SLOT.size, d: PLOT_SLOT.size }, UPPER_SLOT_H)),
    ),
  ]
})
export const HALL_COLLIDERS = PLOTS.map((_, i) => hallBlocksFor(i).map(toCollider)) // all plots while store.homeStyleAll, else only the player's own (systems/terrainHeight.js)
