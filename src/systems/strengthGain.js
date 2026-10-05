// Strength gain shared by mouse clicks and pad training. Clicks give
// STRENGTH_PER_CLICK; while standing on a training pad the same gain is
// multiplied by the pad's power (x1.5, x2, ...) once per TRAINING_TICK seconds.
import { useGameStore } from '../store/useGameStore.js'
import { STRENGTH_PER_CLICK, TRAINING_TICK } from '../data/actionPopups.js'
import { rebirthMultiplier, strengthForNextLevel } from '../data/levels.js'
import { spawnActionPopup } from './actionPopups.js'
import { player } from './playerState.js'
import { armMultiplier } from './arms.js'
import { auraMultiplier } from './auras.js'

export function gainStrength(base) {
  const amount = Math.floor(base * rebirthMultiplier(useGameStore.getState().rebirths) * armMultiplier() * auraMultiplier())
  useGameStore.setState((st) => {
    let { level, xp, xpNeeded } = st
    xp += amount
    while (xp >= xpNeeded) {
      xp -= xpNeeded
      level += 1
      xpNeeded = strengthForNextLevel(level)
    }
    return { strength: st.strength + amount, level, xp, xpNeeded }
  })
  spawnActionPopup(amount)
}

let acc = 0
let lastSpot = null

export function stepTraining(dt) {
  const spot = player.training
  if (!spot) {
    acc = 0
    lastSpot = null
    return
  }
  if (spot !== lastSpot) {
    acc = 0
    lastSpot = spot
  }
  acc += dt
  while (acc >= TRAINING_TICK) {
    acc -= TRAINING_TICK
    gainStrength(Math.floor(STRENGTH_PER_CLICK * spot.power)) // whole numbers only: x1.5 -> +1
  }
}
