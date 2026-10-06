import { ITEM_INFO, LOOT, lootAt, luckBonus, rerollLoot } from '../data/loot.js'
import { LIFT_ZONES, TREASURES } from '../data/world.js'
import { clearedGates, hubResetListeners } from './liftGate.js'
import { useGameStore, openWindow } from '../store/useGameStore.js'
import { addZone, zones } from './interact.js'
import { showActionResult } from './actionResult.js'
import { rebirthMultiplier } from '../data/levels.js'
import { playCash } from './sfx.js'
import { shortMoney } from '../utils/shortMoney.js'

// Collect loot into the backpack (E near an item) and sell the whole backpack
// in the Sell window (E at the Sell stall ring opens it; `sellOpen`). Inventory lives in useGameStore: `inventory`
// is the carried items, `collectedLoot` the LOOT indices already picked up, and
// `backpack` mirrors inventory.length for the HUD.
const money = (n) => `$${n.toLocaleString('en-US')}`

function collect(i) {
  const s = useGameStore.getState()
  if (s.inventory.length >= s.backpackMax) {
    showActionResult('Backpack full! Sell your loot', false)
    return false
  }
  const [name, rarity, value] = lootAt(i, luckBonus(s.plotSlots))
  useGameStore.setState({
    inventory: [...s.inventory, { name, rarity, value }],
    collectedLoot: [...s.collectedLoot, i],
    backpack: s.inventory.length + 1,
    discovered: s.discovered.includes(name) ? s.discovered : [...s.discovered, name],
  })
  showActionResult(`Collected ${name}`, true)
  return true
}

// Sell the carried items at the given inventory indices (all when omitted).
export function sellItems(indices) {
  const s = useGameStore.getState()
  const idx = indices ?? s.inventory.map((_, i) => i)
  const sold = s.inventory.filter((_, i) => idx.includes(i))
  if (!sold.length) {
    showActionResult('Nothing to sell', false)
    return
  }
  const total = Math.floor(sold.reduce((sum, it) => sum + it.value, 0) * rebirthMultiplier(s.rebirths))
  const inventory = s.inventory.filter((_, i) => !idx.includes(i))
  // Selling the last copy of the equipped item unequips it, so a sold item can't be placed on the plot.
  const heldSold = s.heldItem && sold.some((it) => it.name === s.heldItem.name) && !inventory.some((it) => it.name === s.heldItem.name)
  useGameStore.setState({ cash: s.cash + total, inventory, backpack: inventory.length, ...(heldSold && { heldItem: null }) })
  playCash()
  showActionResult(`Sold ${sold.length} item${sold.length > 1 ? 's' : ''} for ${money(total)}`, true)
}

// Treasure pedestals (components/world/Treasures.jsx): E buys the displayed item into the backpack.
function buyTreasure(t) {
  const s = useGameStore.getState()
  if (s.inventory.length >= s.backpackMax) {
    showActionResult('Backpack full! Sell your loot', false)
    return
  }
  if (s.cash < t.cost) {
    showActionResult(`Not enough cash! Need ${shortMoney(t.cost)}`, false)
    return
  }
  const { rarity, value } = ITEM_INFO[t.item]
  playCash()
  useGameStore.setState({
    cash: s.cash - t.cost,
    inventory: [...s.inventory, { name: t.item, rarity, value }],
    backpack: s.inventory.length + 1,
    discovered: s.discovered.includes(t.item) ? s.discovered : [...s.discovered, t.item],
  })
  showActionResult(`Bought ${t.item} for ${shortMoney(t.cost)}`, true)
}

TREASURES.forEach((t) =>
  addZone({
    id: `treasure:${t.id}`,
    x: t.x,
    z: t.z,
    range: 2.6,
    holdMs: 500,
    prompt: `Buy ${t.item} - ${shortMoney(t.cost)}`,
    onConfirm: () => buyTreasure(t),
  }),
)

const removers = new Map() // loot index -> unregister fn for its pickup zone

function registerLoot(i) {
  const [, , , x, z] = LOOT[i]
  // Loot sits under its zone's gate; it can't be collected until that gate is thrown.
  const gate = LIFT_ZONES.find((zn) => z <= zn.gate.zS && z >= zn.gate.zN)
  const remove = addZone({
    id: `loot:${i}`,
    x,
    z,
    range: 1.6,
    holdMs: 0,
    prompt: () => `Collect ${lootAt(i, luckBonus(useGameStore.getState().plotSlots))[0]}`,
    enabled: () => !gate || clearedGates.has(gate.luck),
    onConfirm: () => {
      if (collect(i)) {
        remove()
        removers.delete(i)
      }
    },
  })
  removers.set(i, remove)
}

LOOT.forEach((_, i) => registerLoot(i))

// Back in the hub: every item reappears under its gate (what's already in the
// backpack stays there).
hubResetListeners.push(() => {
  rerollLoot()
  useGameStore.setState({ collectedLoot: [] })
  LOOT.forEach((_, i) => {
    if (!removers.has(i)) registerLoot(i)
  })
})

const sell = zones.find((z) => z.id === 'stall:sell')
if (sell) {
  sell.prompt = 'Open Sell'
  sell.holdMs = 500
  sell.onConfirm = () => openWindow('sell')
}
