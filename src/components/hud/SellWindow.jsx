import { useState } from 'react'
import { useGameStore } from '../../store/useGameStore.js'
import { sellItems } from '../../systems/loot.js'
import { arrowAt } from '../../data/tutorial.js'
import { ITEM_ICON } from './itemIcons.js'
import './sell.css'

// Opened by E at the Sell stall (systems/loot.js). Lists the backpack, lets the
// player filter by rarity, sort by value, sell one item or everything.
export default function SellWindow() {
  const open = useGameStore((s) => s.sellOpen)
  const inventory = useGameStore((s) => s.inventory)
  const pointed = useGameStore((s) => arrowAt(s, 'sell-all'))
  const [filter, setFilter] = useState('ALL')
  const [asc, setAsc] = useState(true)
  if (!open) return null

  const close = () => useGameStore.setState({ sellOpen: false })
  const total = inventory.reduce((sum, it) => sum + it.value, 0)
  const shown = inventory
    .map((it, i) => ({ ...it, i }))
    .filter((it) => filter === 'ALL' || it.rarity === filter)
    .sort((a, b) => (asc ? a.value - b.value : b.value - a.value))
  const stop = (e) => e.stopPropagation()
  const fbtn = (f, cls) => (
    <button className={`rbx ${cls} ${filter === f ? 'is-on' : ''}`} onClick={() => setFilter(f)}>{f}</button>
  )

  return (
    <div className="sell-window" onPointerDown={stop}>
      <div className="sell-panel">
        <div className="sell-title rbx">Sell</div>
        <button className="sell-close rbx" onClick={close}>X</button>
        <div className="sell-bar">
          <span className="sell-total rbx">Total Value: <b>${total.toLocaleString('en-US')}</b></span>
          <button className="sell-all rbx" onClick={() => sellItems()}>
            {pointed && <span className="ui-arrow" aria-hidden="true" />}
            Sell All
          </button>
        </div>
        <div className="sell-list">
          {shown.map((it) => (
            <div key={it.i} className={`sell-card is-${it.rarity.toLowerCase()}`}>
              <span className="n rbx">{it.name}</span>
              <span className="lvl rbx">Lvl 1</span>
              <span className="ico">{ITEM_ICON[it.name]}</span>
              <span className="v rbx">${it.value}</span>
              <button className="sell-one rbx" onClick={() => sellItems([it.i])}>Sell</button>
            </div>
          ))}
        </div>
        {!shown.length && <div className="sell-empty rbx">Nothing to sell</div>}
        <div className="sell-side is-left">
          {fbtn('ALL', 'f-all')}
          <div className="cap rbx">Rarities</div>
          {fbtn('Common', 'f-common')}
          {fbtn('Uncommon', 'f-uncommon')}
          {fbtn('Rare', 'f-rare')}
        </div>
        <div className="sell-side is-right">
          <button className={`rbx ${asc ? 'is-on' : ''}`} onClick={() => setAsc(true)}>↑ASC</button>
          <button className={`rbx ${asc ? '' : 'is-on'}`} onClick={() => setAsc(false)}>↓DESC</button>
        </div>
      </div>
    </div>
  )
}
