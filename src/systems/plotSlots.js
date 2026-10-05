// Place / pick up the held item on the home plot's ground-floor slots (E near a
// slot). Slot contents live in useGameStore.plotSlots, keyed by HOME_SLOTS index.
// Empty hand + filled slot picks the item up; held item + empty slot places it;
// held item + filled slot swaps.
import { HOME_SLOTS, PLOT_SLOT } from '../data/world.js'
import { useGameStore } from '../store/useGameStore.js'
import { addZone } from './interact.js'
import { showActionResult } from './actionResult.js'

function interact(i) {
  const s = useGameStore.getState()
  const held = s.heldItem
  const here = s.plotSlots[i]
  if (!held && !here) {
    showActionResult('Hold an item to place it here', false)
    return
  }
  const plotSlots = { ...s.plotSlots }
  if (held) plotSlots[i] = held
  else delete plotSlots[i]
  useGameStore.setState({ plotSlots, heldItem: here ?? null })
  showActionResult(held ? `Placed ${held.name}` : `Picked up ${here.name}`, true)
}

HOME_SLOTS.forEach((p, i) =>
  addZone({
    id: `plotSlot:${i}`,
    x: p.x,
    z: p.z,
    range: PLOT_SLOT.size / 2 + 0.4,
    holdMs: 0,
    prompt: () => {
      const s = useGameStore.getState()
      const held = s.heldItem
      const here = s.plotSlots[i]
      if (held) return here ? `Swap with ${here.name}` : `Place ${held.name}`
      return here ? `Pick up ${here.name}` : 'Hold an item to place it'
    },
    onConfirm: () => interact(i),
  }),
)
