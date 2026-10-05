import { useGameStore } from '../../store/useGameStore.js'
import { ARMS, RARITY_COLORS, shortNum } from '../../data/arms.js'
import { armAction } from '../../systems/arms.js'
import { ArmIcon } from './icons.jsx'
import { armTexture } from './armTextures.js'
import './arms.css'

function Row({ arm }) {
  const owned = useGameStore((s) => s.ownedArms.includes(arm.id))
  const equipped = useGameStore((s) => s.equippedArm === arm.id)
  const cash = useGameStore((s) => s.cash)
  const state = equipped ? 'is-equipped' : owned ? 'is-owned' : 'is-locked'
  return (
    <div className={`arms-row ${state}`}>
      <div className="arms-blocks">
        <span style={{ backgroundImage: `url(${armTexture(arm)})` }} />
        <span style={{ backgroundImage: `url(${armTexture(arm)})` }} />
      </div>
      <div className="arms-info">
        <div className="arms-name rbx">{arm.name}</div>
        <div className="arms-rarity rbx" style={{ color: RARITY_COLORS[arm.rarity] }}>{arm.rarity}</div>
        <div className="arms-mult rbx">
          <ArmIcon className="arms-mult-icon" />x{shortNum(arm.mult)}
        </div>
      </div>
      <button
        className={`arms-btn rbx ${!owned && (arm.price == null || cash < arm.price) ? 'is-poor' : ''}`}
        disabled={equipped || (!owned && arm.price == null)}
        onClick={() => armAction(arm.id)}
      >
        {equipped ? 'Equipped' : owned ? 'Equip' : arm.price == null ? 'N/A' : `$${shortNum(arm.price)}`}
      </button>
    </div>
  )
}

// Opened by the HUD Arms button. Buy and equip arm skins that multiply strength gains.
export default function ArmsWindow() {
  const open = useGameStore((s) => s.armsOpen)
  if (!open) return null
  const close = () => useGameStore.setState({ armsOpen: false })
  return (
    <div className="arms-window" onPointerDown={(e) => e.stopPropagation()}>
      <div className="arms-panel">
        <div className="arms-title rbx">
          <ArmIcon className="arms-title-icon" />
          Arms
        </div>
        <button className="arms-close rbx" onClick={close}>X</button>
        <div className="arms-list">
          {ARMS.map((a) => (
            <Row key={a.id} arm={a} />
          ))}
        </div>
      </div>
    </div>
  )
}
