// Buying / equipping auras from the Aura window.
import { useGameStore } from '../store/useGameStore.js'
import { playCash } from './sfx.js'
import { AURAS, auraById } from '../data/auras.js'

export const auraMultiplier = () => auraById(useGameStore.getState().equippedAura).mult

export function auraAction(id) {
  const a = AURAS.find((x) => x.id === id)
  const st = useGameStore.getState()
  if (!a) return false
  if (st.ownedAuras.includes(id)) {
    useGameStore.setState({ equippedAura: id })
    return true
  }
  if (a.price == null || st.cash < a.price) return false
  playCash()
  useGameStore.setState({ cash: st.cash - a.price, ownedAuras: [...st.ownedAuras, id], equippedAura: id })
  return true
}
