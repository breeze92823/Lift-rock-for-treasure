// Buying Upgrades-window levels with cash; applies the effect to the store / player.
import { useGameStore } from '../store/useGameStore.js'
import { player } from './playerState.js'
import { UPGRADES, moveSpeedFor } from '../data/upgrades.js'

// `currency` is 'cash' or 'gems'; each has its own price per level.
export function buyUpgrade(id, currency = 'cash') {
  const u = UPGRADES[id]
  const st = useGameStore.getState()
  const lvl = st[u.key]
  if (lvl >= u.max) return false
  const cost = currency === 'gems' ? u.gems(lvl) : u.cost(lvl)
  if (st[currency] < cost) return false
  const patch = { [currency]: st[currency] - cost, [u.key]: lvl + 1 }
  if (id === 'backpack') patch.backpackMax = u.value(lvl + 1)
  if (id === 'speed') player.moveSpeed = moveSpeedFor(lvl + 1)
  useGameStore.setState(patch)
  return true
}
