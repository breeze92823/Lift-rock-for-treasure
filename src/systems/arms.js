// Buying / equipping arm skins from the Arms window.
import { useGameStore } from '../store/useGameStore.js'
import { ARMS, armById } from '../data/arms.js'

export const armMultiplier = () => armById(useGameStore.getState().equippedArm).mult

export function armAction(id) {
  const a = ARMS.find((x) => x.id === id)
  const st = useGameStore.getState()
  if (!a) return false
  if (st.ownedArms.includes(id)) {
    useGameStore.setState({ equippedArm: id })
    return true
  }
  if (a.price == null || st.cash < a.price) return false
  useGameStore.setState({ cash: st.cash - a.price, ownedArms: [...st.ownedArms, id], equippedArm: id })
  return true
}
