import { PLAYER_MOVE_SPEED } from './world.js'

// Upgrade tracks shown in the Upgrades window. `level` is 1-based; the value
// shown at level n is value(n), the next purchase costs cost(n) cash.
export const UPGRADES = {
  backpack: {
    title: 'Backpack Capacity',
    key: 'backpackLevel',
    max: 8,
    gems: (lvl) => 10 * lvl,
    value: (lvl) => 2 + lvl,
    cost: (lvl) => Math.round(10000 * 2.5 ** (lvl - 1)),
  },
  speed: {
    title: 'Move Speed',
    key: 'speedLevel',
    max: 17,
    gems: (lvl) => 5 * lvl,
    value: (lvl) => 23 + lvl,
    cost: (lvl) => Math.round(1000 * 1.6 ** (lvl - 1)),
  },
}

// World move speed for a Move Speed level (level 1 = the base speed).
export const moveSpeedFor = (lvl) => PLAYER_MOVE_SPEED + (lvl - 1) * 0.5
