import { LIFT, LIFT_ZONES, PLOT, PLOTS, STALLS, TRAINING, plotSlotsAt, plotSpawn } from './world.js'
import { LOOT, lootAt, luckBonus } from './loot.js'

// Tutorial steps (store.tutorialStep, driven by components/hud/Tutorial.jsx):
// 0 train to 5 strength, 1 throw the first gate, 2 grab loot, 3 sell it, 4 buy the Dirt arm, 5 train on the starter pad to 100 strength, 6 go to the home plot,
// 7 rebirth (allowed at any level, this once), 8 train to 50 strength, 9 throw the first gate again,
// 10 pick up an Uncommon item, 11 go to the home plot's first treasure slot, 12 open the Index, 13 scroll it,
// 14 equip the Uncommon item, 15 close the Index, 16 press E to place it, 17 luck explanation, 18 done.
export const TUTORIAL_HOME_STEP = 6
export const TUTORIAL_REBIRTH_STEP = 7
export const TUTORIAL_DONE = 18
export const TUTORIAL_TRAIN_STEPS = { 5: 100, 8: 50 } // step -> strength to reach on the starter pad
export const TUTORIAL_LUCK_MS = 9000 // how long the final luck message stays
export const TUTORIAL_STRENGTH = 5 // strength to reach on the starter training pad
export const TUTORIAL_TRAIN_STRENGTH = 100 // strength to reach on the last step
export const VETERAN_STRENGTH = LIFT_ZONES[0].hp // more than this at first sight of the save: skip the tutorial

const first = LIFT_ZONES[0]
const sell = STALLS.find((s) => s.id === 'sell')
const arms = STALLS.find((s) => s.id === 'arms')

// Arm bought on the Arms step. Its price is cut to whatever cash the player has (never raised).
export const TUTORIAL_ARM = 'dirt'
export const TUTORIAL_ARM_STEP = 4

// Where the 3D guide trail leads on each step (null = no trail). Matches the step index.
export const GUIDE_TARGETS = [
  null, // step 0: no trail
  { x: LIFT.x, z: first.entryZ }, // first Lift Pad
  { x: LIFT.x, z: (first.zFrom - LIFT.entryLen + first.zTo) / 2 }, // middle of the first Loot Floor
  { x: sell.x, z: sell.z },
  { x: arms.x, z: arms.z }, // Arms stall
  { x: TRAINING.rowX.front, z: TRAINING.slotZ[1] }, // starter (x1.5) training pad
  (st) => plotSpawn(st.homePlot), // the player's own plot (assigned by the server)
  null, // 7 rebirth
  { x: TRAINING.rowX.front, z: TRAINING.slotZ[1] }, // 8 starter training pad again
  { x: LIFT.x, z: first.entryZ }, // 9 first Lift Pad again
  uncommonLootTarget, // 10
  slotTarget, // 11
  null, // 12 Index
  null, // 13 scroll
  null, // 14 equip
  null, // 15 close
  slotTarget, // 16 press E
  null, // 17 luck message
  null,
]

// First Uncommon item still lying on the first Loot Floor (its rarity shifts with the plot's Luck Bonus).
function uncommonLootTarget(st) {
  for (let i = 0; i < LOOT.length; i++) {
    if (LOOT[i][5] !== 0 || st.collectedLoot.includes(i)) continue
    const [, rarity, , x, z] = lootAt(i, luckBonus(st.plotSlots))
    if (rarity === 'Uncommon') return { x, z }
  }
  return null
}

// The home plot's first ground-floor treasure slot.
function slotTarget(st) {
  return plotSlotsAt(st.homePlot)[0]
}

// True while (x, z) is on the given plot's floor.
export function onPlot(i, x, z) {
  const pl = PLOTS[i]
  const cx = pl.side * (PLOT.inner + PLOT.width / 2)
  return Math.abs(x - cx) <= PLOT.width / 2 && Math.abs(z - pl.z) <= PLOT.depth / 2
}

// HUD menu button that gets the bouncing UI arrow on each step (null = none).
export const UI_ARROW_TARGETS = [null, null, null, 'sell-all', `arm-${TUTORIAL_ARM}`, null, null, ['rebirth', 'rebirth-go'],
  null, null, null, null, 'index', 'index-scroll', 'index-item', 'index-close', null, null, null]

// Does the UI arrow of the current step point at HUD element `id`? (store state `s`)
export const arrowAt = (s, id) => s.tutorialActive && [UI_ARROW_TARGETS[s.tutorialStep]].flat().includes(id)
