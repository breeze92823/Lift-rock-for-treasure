// Buying / equipping arm skins from the Arms window.
import { useGameStore } from '../store/useGameStore.js'
import { ARMS, armById } from '../data/arms.js'
import { TUTORIAL_ARM, TUTORIAL_ARM_STEP } from '../data/tutorial.js'

export const armMultiplier = () => {
  const id = useGameStore.getState().equippedArm
  return id ? armById(id).mult : 1 // no arm equipped = x1
}

// What the arm costs right now. On the tutorial's Arms step the Dirt arm costs all the cash
// the player has when that is less than its normal price (shown as a discount in the window).
export function armPrice(a, st = useGameStore.getState()) {
  if (a.price == null) return null
  if (st.tutorialActive && st.tutorialStep === TUTORIAL_ARM_STEP && a.id === TUTORIAL_ARM) return Math.min(a.price, Math.floor(st.cash))
  return a.price
}

export function armAction(id) {
  const a = ARMS.find((x) => x.id === id)
  const st = useGameStore.getState()
  if (!a) return false
  if (st.ownedArms.includes(id)) {
    useGameStore.setState({ equippedArm: id })
    return true
  }
  const price = armPrice(a, st)
  if (price == null || st.cash < price) return false
  useGameStore.setState({ cash: st.cash - price, ownedArms: [...st.ownedArms, id], equippedArm: id })
  return true
}
