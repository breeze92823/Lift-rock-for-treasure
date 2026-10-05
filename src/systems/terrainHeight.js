import { COLLIDERS, GROUND_Y, WORLD_BOUNDS } from '../data/world.js'

// Floor height under (x, z): the highest collider covering the point, else
// the bare ground. playerMovement and the camera boom clamp both use this.
export function terrainHeightAt(x, z) {
  let h = GROUND_Y
  for (let i = 0; i < COLLIDERS.length; i++) {
    const c = COLLIDERS[i]
    if (c.top > h && x >= c.x0 && x <= c.x1 && z >= c.z0 && z <= c.z1) h = c.top
  }
  return h
}

export function isOutsideBounds(x, z) {
  const b = WORLD_BOUNDS
  return x < b.minX || x > b.maxX || z < b.minZ || z > b.maxZ
}
