import { useGameStore } from '../../store/useGameStore.js'
import { ITEM_CATALOG } from '../../data/loot.js'
import { arrowAt } from '../../data/tutorial.js'
import './index-window.css'

const REWARD_COUNT = 60 // treasures needed for the cash multiplier bonus

// Opened by the Index menu button. A grid of every collectable; ones the player
// hasn't picked up yet show as a "???" silhouette.
export default function IndexWindow() {
  const open = useGameStore((s) => s.indexOpen)
  const discovered = useGameStore((s) => s.discovered)
  const held = useGameStore((s) => s.heldItem)
  const plotSlots = useGameStore((s) => s.plotSlots)
  const pointItem = useGameStore((s) => arrowAt(s, 'index-item') && s.tutorialItem)
  const pointScroll = useGameStore((s) => arrowAt(s, 'index-scroll'))
  const pointClose = useGameStore((s) => arrowAt(s, 'index-close'))
  if (!open) return null

  const close = () => useGameStore.setState({ indexOpen: false })
  const total = ITEM_CATALOG.length
  const found = ITEM_CATALOG.filter(([name]) => discovered.includes(name)).length
  const pct = Math.floor((found / total) * 100)
  const stop = (e) => e.stopPropagation()
  // Tutorial: scrolling the grid ends the "scroll down" step.
  const onScroll = (e) => {
    const st = useGameStore.getState()
    if (st.tutorialActive && st.tutorialStep === 13 && e.currentTarget.scrollTop > 0) useGameStore.setState({ tutorialStep: 14 })
  }

  return (
    <div className="idx-window" onPointerDown={stop}>
      <div className="idx-panel">
        <div className="idx-title rbx"><span className="idx-book">📘</span>Index</div>
        <div className="idx-stats rbx">
          {found}/{total} Discovered <b>{pct}% Complete</b>
        </div>
        <button className="idx-close rbx" onClick={close}>
          {pointClose && <span className="ui-arrow is-left" aria-hidden="true" />}X
        </button>
        <div className="idx-grid" onScroll={onScroll}>
          {ITEM_CATALOG.map(([name, rarity, glyph]) => {
            const known = discovered.includes(name)
            // Common items can't be held; everything above Common can once discovered.
            const placed = Object.values(plotSlots).some((it) => it.name === name)
            const holdable = known && rarity !== 'Common' && !placed
            const isHeld = held?.name === name
            const pointed = pointItem === name
            const toggleHold = () =>
              useGameStore.setState({ heldItem: isHeld ? null : { name, rarity, glyph } })
            return (
              <div
                key={name}
                className={`idx-cell ${holdable ? 'is-holdable' : ''} ${isHeld ? 'is-held' : ''}`}
                ref={pointed ? (el) => el?.scrollIntoView({ block: 'center' }) : undefined}
                onClick={holdable ? toggleHold : undefined}
                title={holdable ? (isHeld ? 'Click to unequip' : 'Click to hold') : placed ? 'Placed on your plot - pick it up first' : known && rarity === 'Common' ? 'Common items cannot be held' : undefined}
              >
                {pointed && <span className="ui-arrow is-down" aria-hidden="true" />}
                <span className="n rbx">{known ? name : '???'}</span>
                <span className={`ico ${known ? '' : 'is-unknown'}`}>{glyph}</span>
                <span className={`r rbx is-${rarity.toLowerCase()}`}>{rarity}</span>
                {holdable && <span className={`eq rbx ${isHeld ? 'is-on' : ''}`}>{isHeld ? 'Equipped' : 'Equipable'}</span>}
                {placed && <span className="eq rbx">Placed</span>}
              </div>
            )
          })}
        </div>
        {pointScroll && <span className="ui-arrow is-down is-scroll" aria-hidden="true" />}
        <div className="idx-reward rbx">Collect {REWARD_COUNT} Normal Treasures for +0.5x Cash Multiplier!</div>
        <div className="idx-bar">
          <div className="idx-fill" style={{ width: `${Math.min(1, found / REWARD_COUNT) * 100}%` }} />
          <span className="rbx">{found}/{REWARD_COUNT}</span>
        </div>
      </div>
    </div>
  )
}
