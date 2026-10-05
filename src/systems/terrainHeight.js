import { COLLIDERS, HALL_COLLIDERS, GROUND_Y, LIFT_DRAINS, WORLD_BOUNDS } from '../data/world.js'
import { clearedGates } from './liftGate.js'
import { useGameStore } from '../store/useGameStore.js'

// Floor height under (x, z): the highest collider covering the point, else
// the bare ground (sunk inside a drainage channel). playerMovement and the
// camera boom clamp both use this.
export function terrainHeightAt(x, z) {
  let h = GROUND_Y
  for (let i = 0; i < LIFT_DRAINS.length; i++) {
    const d = LIFT_DRAINS[i]
    if (x >= d.x0 && x <= d.x1 && z >= d.z0 && z <= d.z1) h = d.floor
  }
  for (let i = 0; i < COLLIDERS.length; i++) {
    const c = COLLIDERS[i]
    if (c.gate !== undefined && clearedGates.has(c.gate)) continue
    if (c.top > h && x >= c.x0 && x <= c.x1 && z >= c.z0 && z <= c.z1) h = c.top
  }
  const hall = HALL_COLLIDERS[useGameStore.getState().homePlot]
  if (hall) {
    for (let i = 0; i < hall.length; i++) {
      const c = hall[i]
      if (c.top > h && x >= c.x0 && x <= c.x1 && z >= c.z0 && z <= c.z1) h = c.top
    }
  }
  return h
}

export function isOutsideBounds(x, z) {
  const b = WORLD_BOUNDS
  return x < b.minX || x > b.maxX || z < b.minZ || z > b.maxZ
}
