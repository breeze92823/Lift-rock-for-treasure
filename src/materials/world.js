import { MeshStandardMaterial } from 'three'
import { tileMaterial } from './tile.js'
import { COLORS } from '../data/world.js'

// Every surface in the lobby, built once. Floors/walls use the world-space
// tile shader with Roblox's rounded-square stud texture (0.5 m pitch);
// props get plain flat-shaded plastic.
const STUD = { studs: 0.5, studShape: 1, studAmt: 1, speckle: 0.4, roughness: 0.9 }

const studded = (top, extra = {}) => tileMaterial({ ...STUD, top, ...extra })

const cache = new Map()
export function plastic(color, extra = {}) {
  const key = color + JSON.stringify(extra)
  if (!cache.has(key)) cache.set(key, new MeshStandardMaterial({ color, roughness: 0.75, metalness: 0, ...extra }))
  return cache.get(key)
}

const liftFloors = new Map()
export function liftFloor(color) {
  if (!liftFloors.has(color)) liftFloors.set(color, studded(color, { studAmt: 0.5 }))
  return liftFloors.get(color)
}

export const MAT = {
  grass: studded(COLORS.grass, { top2: COLORS.grass2, checker: 4 }),
  // Arena walls: blue checkered faces, green rim on top.
  wall: studded(COLORS.grass, { top2: COLORS.grass2, side: COLORS.wall, side2: COLORS.wall2, checker: 4 }),
  path: studded(COLORS.path),
  pathDark: studded(COLORS.pathDark),
  plot: studded(COLORS.plot, { top2: COLORS.plot2, checker: 2, side: '#7d7e84' }),
  slot: studded(COLORS.slot, { studAmt: 0.6 }),
  carpet: studded(COLORS.carpet, { studAmt: 0.5, side: '#9e1015' }),
  carpetEdge: plastic(COLORS.carpetEdge),
  liftTier: studded(COLORS.liftTop, { side: COLORS.liftDark }),
  liftPad: studded('#2a2d34', { studAmt: 0.5 }),
  curb: studded(COLORS.curb),
  walkway: studded('#8f96a6', { side: '#3d63d6' }),
  trainPlatform: studded('#9aa6ea', { side: '#7a86d0' }),
  trainStep: studded('#8794dc', { side: '#6874bf' }),
  trainEntry: studded('#d6daf0', { side: '#b4b9dc' }),
  leaderStand: studded('#2f86e8', { side: '#1f5fb8' }),
  water: new MeshStandardMaterial({ color: COLORS.water, roughness: 0.15, metalness: 0.1, transparent: true, opacity: 0.88 }),
  glow: new MeshStandardMaterial({ color: COLORS.glow, emissive: COLORS.glow, emissiveIntensity: 1.6, transparent: true, opacity: 0.85, toneMapped: false }),
  wood: plastic(COLORS.wood),
  woodDark: plastic(COLORS.wood2),
  post: plastic('#3a3c44'),
  white: plastic('#f4f6f8'),
  black: plastic('#141416'),
  leaf: plastic('#2f9e2a'),
  leaf2: plastic('#3fb935'),
  bark: plastic('#7a4a24'),
}

export function padMaterial(color) {
  return studded(color, { studAmt: 0.7, side: color })
}
