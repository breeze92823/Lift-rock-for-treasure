import { useGameStore } from '../../store/useGameStore.js'
import { AURAS } from '../../data/auras.js'
import { RARITY_COLORS, shortNum } from '../../data/arms.js'
import { auraAction } from '../../systems/auras.js'
import { ArmIcon } from './icons.jsx'
import AuraIcon from './AuraIcon.jsx'
import './aura.css'

function Row({ aura }) {
  const owned = useGameStore((s) => s.ownedAuras.includes(aura.id))
  const equipped = useGameStore((s) => s.equippedAura === aura.id)
  const cash = useGameStore((s) => s.cash)
  const state = equipped ? 'is-equipped' : owned ? 'is-owned' : 'is-locked'
  return (
    <div className={`aura-row ${state}`}>
      <AuraIcon aura={aura} className="aura-orb" />
      <div className="aura-info">
        <div className="aura-name rbx">{aura.name}</div>
        <div className="aura-rarity rbx" style={{ color: RARITY_COLORS[aura.rarity] }}>{aura.rarity}</div>
        <div className="aura-mult rbx">
          <ArmIcon className="aura-mult-icon" />x{shortNum(aura.mult)}
        </div>
      </div>
      <button
        className={`aura-btn rbx ${!owned && (aura.price == null || cash < aura.price) ? 'is-poor' : ''}`}
        disabled={equipped || (!owned && aura.price == null)}
        onClick={() => auraAction(aura.id)}
      >
        {equipped ? 'Equipped' : owned ? 'Equip' : aura.price == null ? 'N/A' : `$${shortNum(aura.price)}`}
      </button>
    </div>
  )
}

// Opened by holding E at the Aura stall. Buy and equip auras that multiply strength gains.
export default function AuraWindow() {
  const open = useGameStore((s) => s.auraOpen)
  if (!open) return null
  const close = () => useGameStore.setState({ auraOpen: false })
  return (
    <div className="aura-window" onPointerDown={(e) => e.stopPropagation()}>
      <div className="aura-panel">
        <div className="aura-title rbx">Auras</div>
        <button className="aura-close rbx" onClick={close}>X</button>
        <div className="aura-list">
          {AURAS.filter((a) => !a.hidden).map((a) => (
            <Row key={a.id} aura={a} />
          ))}
        </div>
      </div>
    </div>
  )
}
