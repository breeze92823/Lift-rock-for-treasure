import { COLLIDERS, DECK_COLLIDERS, HALL_COLLIDERS, LADDER_COLLIDERS, UPPER_COLLIDERS, GROUND_Y, LIFT_DRAINS, WORLD_BOUNDS } from '../data/world.js'
import { clearedGates } from './liftGate.js'
import { useGameStore } from '../store/useGameStore.js'
import { useRemoteStore } from '../store/useRemoteStore.js'
import { plotStyled } from './plotStyle.js'

// Floor height under (x, z): the highest collider covering the point, else
// the bare ground (sunk inside a drainage channel). playerMovement and the
// camera boom clamp both use this.
// `y` (the querying body's height) lets the second-storey decks count, but only when
// it is already up there, so the ground-floor halls stay walkable underneath.
export function terrainHeightAt(x, z, y = -Infinity) {
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
  // Halls, decks and ladders exist (and are solid) only on plots with the home build:
  // each player's once upgraded (systems/plotStyle.js).
  const game = useGameStore.getState()
  const remotePlots = useRemoteStore.getState().plots
  for (let p = 0; p < HALL_COLLIDERS.length; p++) {
    if (!plotStyled(p, game, remotePlots)) continue
    const ld = LADDER_COLLIDERS[p] // solid unless being climbed (the climb ignores terrain)
    if (ld.top > h && x >= ld.x0 && x <= ld.x1 && z >= ld.z0 && z <= ld.z1) h = ld.top
    const dk = DECK_COLLIDERS[p]
    if (y >= dk.min && dk.top > h && x >= dk.x0 && x <= dk.x1 && z >= dk.z0 && z <= dk.z1) {
      h = dk.top
      const up = UPPER_COLLIDERS[p]
      for (let i = 0; i < up.length; i++) {
        const c = up[i]
        if (c.top > h && x >= c.x0 && x <= c.x1 && z >= c.z0 && z <= c.z1) h = c.top
      }
    }
    const hall = HALL_COLLIDERS[p]
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
