import { useGameStore } from '../../store/useGameStore.js'
import { ITEM_ICON } from './itemIcons.js'

// Carried loot along the bottom of the screen, one slot per item.
export default function Hotbar() {
  const inventory = useGameStore((s) => s.inventory)
  if (!inventory.length) return null
  return (
    <div className="hud-hotbar">
      {inventory.map((it, i) => (
        <div key={i} className="hud-slot">
          <span className="k rbx">{i + 1}</span>
          <span className="p rbx">${it.value}</span>
          <span>{ITEM_ICON[it.name]}</span>
        </div>
      ))}
    </div>
  )
}
