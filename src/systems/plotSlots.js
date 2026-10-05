// Place / pick up the held item on the home plot's ground-floor slots (E near a
// slot). Slot contents live in useGameStore.plotSlots, keyed by HOME_SLOTS index.
// Empty hand + filled slot picks the item up; held item + empty slot places it;
// held item + filled slot swaps.
import { PLOT_SLOT, plotSlotsAt } from '../data/world.js'
import { useGameStore } from '../store/useGameStore.js'
import { addZone } from './interact.js'
import { showActionResult } from './actionResult.js'

// Each item can sit on the plot only once: true if another slot already holds it.
function placedElsewhere(s, item, i) {
  return Object.entries(s.plotSlots).some(([k, it]) => Number(k) !== i && it.name === item.name)
}

function interact(i) {
  const s = useGameStore.getState()
  const held = s.heldItem
  const here = s.plotSlots[i]
  if (!held && !here) {
    showActionResult('Hold an item to place it here', false)
    return
  }
  if (held && placedElsewhere(s, held, i)) {
    showActionResult(`${held.name} is already placed on your plot`, false)
    return
  }
  let inventory = s.inventory
  // Picking up returns the looted copy that placing took out of the backpack.
  const { bag, ...hand } = here ?? {}
  if (bag) {
    if (inventory.length >= s.backpackMax) {
      showActionResult('Backpack full', false)
      return
    }
    inventory = [...inventory, bag]
  }
  const plotSlots = { ...s.plotSlots }
  if (held) {
    // A looted copy placed on the plot leaves the backpack, so it can't be sold while placed.
    const at = inventory.findIndex((it) => it.name === held.name)
    const taken = at >= 0 ? inventory[at] : null
    if (taken) inventory = inventory.filter((_, k) => k !== at)
    plotSlots[i] = taken ? { ...held, bag: taken } : held
  } else delete plotSlots[i]
  useGameStore.setState({
    plotSlots,
    heldItem: here ? hand : null,
    inventory,
    backpack: inventory.length,
  })
  showActionResult(held ? `Placed ${held.name}` : `Picked up ${here.name}`, true)
}

// The zones follow the server-assigned home plot (store.homePlot), so re-register when it changes.
let removers = []
function registerZones(plot) {
  removers.forEach((r) => r())
  removers = plotSlotsAt(plot).map((p, i) =>
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
        if (held && placedElsewhere(s, held, i)) return `${held.name} already placed`
        if (held) return here ? `Swap with ${here.name}` : `Place ${held.name}`
        return here ? `Pick up ${here.name}` : 'Hold an item to place it'
      },
      onConfirm: () => interact(i),
    }),
  )
}
registerZones(useGameStore.getState().homePlot)
useGameStore.subscribe((s, prev) => {
  if (s.homePlot !== prev.homePlot) registerZones(s.homePlot)
})
