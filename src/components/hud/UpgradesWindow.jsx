import { useGameStore } from '../../store/useGameStore.js'
import { UPGRADES } from '../../data/upgrades.js'
import { buyUpgrade } from '../../systems/upgrades.js'
import { BackpackIcon, SpeedIcon, UpgradeIcon } from './icons.jsx'
import './upgrades.css'

const money = (n) => (n >= 1e6 ? `$${+(n / 1e6).toFixed(2)}M` : n >= 1e3 ? `$${+(n / 1e3).toFixed(1)}K` : `$${n}`)

function Row({ id, icon, cls }) {
  const u = UPGRADES[id]
  const lvl = useGameStore((s) => s[u.key])
  const cash = useGameStore((s) => s.cash)
  const maxed = lvl >= u.max
  const cost = u.cost(lvl)
  return (
    <div className={`up-row ${cls}`}>
      <div className="up-icon">{icon}</div>
      <div className="up-name rbx">{u.title}</div>
      <div className="up-lvl rbx">{maxed ? 'MAX' : `Lvl. ${lvl}/${u.max}`}</div>
      <div className="up-values rbx">{maxed ? u.value(lvl) : `${u.value(lvl)} ➜ ${u.value(lvl + 1)}`}</div>
      {!maxed && (
        <button className={`up-buy rbx ${cash >= cost ? '' : 'is-poor'}`} onClick={() => buyUpgrade(id)}>
          {money(cost)}
        </button>
      )}
    </div>
  )
}

// Opened by the HUD Upgrades button. Cash upgrades for backpack size and move speed.
export default function UpgradesWindow() {
  const open = useGameStore((s) => s.upgradesOpen)
  if (!open) return null
  const close = () => useGameStore.setState({ upgradesOpen: false })
  return (
    <div className="up-window" onPointerDown={(e) => e.stopPropagation()}>
      <div className="up-panel">
        <div className="up-title rbx">
          <UpgradeIcon className="up-title-icon" />
          Upgrades
        </div>
        <button className="up-close rbx" onClick={close}>X</button>
        <Row id="backpack" icon={<BackpackIcon />} cls="is-backpack" />
        <Row id="speed" icon={<SpeedIcon />} cls="is-speed" />
      </div>
    </div>
  )
}
