import { useGameStore } from '../../store/useGameStore.js'
import { ITEM_CATALOG } from '../../data/loot.js'
import './index-window.css'

const REWARD_COUNT = 60 // treasures needed for the cash multiplier bonus

// Opened by the Index menu button. A grid of every collectable; ones the player
// hasn't picked up yet show as a "???" silhouette.
export default function IndexWindow() {
  const open = useGameStore((s) => s.indexOpen)
  const discovered = useGameStore((s) => s.discovered)
  const held = useGameStore((s) => s.heldItem)
  if (!open) return null

  const close = () => useGameStore.setState({ indexOpen: false })
  const total = ITEM_CATALOG.length
  const found = ITEM_CATALOG.filter(([name]) => discovered.includes(name)).length
  const pct = Math.floor((found / total) * 100)
  const stop = (e) => e.stopPropagation()

  return (
    <div className="idx-window" onPointerDown={stop}>
      <div className="idx-panel">
        <div className="idx-title rbx"><span className="idx-book">📘</span>Index</div>
        <div className="idx-stats rbx">
          {found}/{total} Discovered <b>{pct}% Complete</b>
        </div>
        <button className="idx-close rbx" onClick={close}>X</button>
        <div className="idx-grid">
          {ITEM_CATALOG.map(([name, rarity, glyph]) => {
            const known = discovered.includes(name)
            // Common items can't be held; everything above Common can once discovered.
            const holdable = known && rarity !== 'Common'
            const isHeld = held?.name === name
            const toggleHold = () =>
              useGameStore.setState({ heldItem: isHeld ? null : { name, rarity, glyph } })
            return (
              <div
                key={name}
                className={`idx-cell ${holdable ? 'is-holdable' : ''} ${isHeld ? 'is-held' : ''}`}
                onClick={holdable ? toggleHold : undefined}
                title={holdable ? (isHeld ? 'Click to unequip' : 'Click to hold') : known && rarity === 'Common' ? 'Common items cannot be held' : undefined}
              >
                <span className="n rbx">{known ? name : '???'}</span>
                <span className={`ico ${known ? '' : 'is-unknown'}`}>{glyph}</span>
                <span className={`r rbx is-${rarity.toLowerCase()}`}>{rarity}</span>
                {holdable && <span className={`eq rbx ${isHeld ? 'is-on' : ''}`}>{isHeld ? 'Equipped' : 'Equipable'}</span>}
              </div>
            )
          })}
        </div>
        <div className="idx-reward rbx">Collect {REWARD_COUNT} Normal Treasures for +0.5x Cash Multiplier!</div>
        <div className="idx-bar">
          <div className="idx-fill" style={{ width: `${Math.min(1, found / REWARD_COUNT) * 100}%` }} />
          <span className="rbx">{found}/{REWARD_COUNT}</span>
        </div>
      </div>
    </div>
  )
}
