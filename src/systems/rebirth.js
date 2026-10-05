// Rebirth: once the player reaches levelForRebirth(rebirths), resets strength and level
// and bumps `rebirths` (permanent cash/strength multiplier). Cash and loot are kept.
import { useGameStore } from '../store/useGameStore.js'
import { levelForRebirth } from '../data/levels.js'

export function canRebirth(st = useGameStore.getState()) {
  return st.level >= levelForRebirth(st.rebirths)
}

export function doRebirth() {
  const st = useGameStore.getState()
  if (!canRebirth(st)) return
  useGameStore.setState({ rebirths: st.rebirths + 1, strength: 1, level: 1, xp: 1, xpNeeded: 10, rebirthOpen: false })
}

// Training pads gated by `req: { type: 'rebirth', n }` (data/world.js) unlock at that rebirth count.
// Starter pads and the not-yet-implemented hex gates stay open.
export function padUnlocked(req, rebirths = useGameStore.getState().rebirths) {
  return req.type !== 'rebirth' || rebirths >= req.n
}
