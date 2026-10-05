import { useGameStore } from '../../store/useGameStore.js'
import { levelForRebirth, rebirthMultiplier } from '../../data/levels.js'
import { canRebirth, doRebirth } from '../../systems/rebirth.js'
import { arrowAt } from '../../data/tutorial.js'
import { ArmIcon, CashIcon, RebirthIcon } from './icons.jsx'
import './rebirth.css'

const fmt = (m) => `${m}X`

function Row({ icon, from, to, cls }) {
  return (
    <div className="rb-row">
      <span className={`rb-chip ${cls}`}>{icon}<b className="rbx">{fmt(from)}</b></span>
      <span className="rb-arrow rbx">➜</span>
      <span className={`rb-chip ${cls}`}>{icon}<b className="rbx">{fmt(to)}</b></span>
    </div>
  )
}

// Opened by the HUD Rebirth button. Rebirth needs level 20, then 40, 80, ... (data/levels.js).
export default function RebirthWindow() {
  const open = useGameStore((s) => s.rebirthOpen)
  const level = useGameStore((s) => s.level)
  const rebirths = useGameStore((s) => s.rebirths)
  const ready = useGameStore((s) => canRebirth(s))
  const pointed = useGameStore((s) => arrowAt(s, 'rebirth-go'))
  if (!open) return null

  const need = levelForRebirth(rebirths)
  const close = () => useGameStore.setState({ rebirthOpen: false })
  const from = rebirthMultiplier(rebirths)
  const to = rebirthMultiplier(rebirths + 1)

  return (
    <div className="rb-window" onPointerDown={(e) => e.stopPropagation()}>
      <div className="rb-panel">
        <div className="rb-title rbx"><RebirthIcon className="rb-title-icon" />Rebirth</div>
        <button className="rb-close rbx" onClick={close}>X</button>
        <Row icon={<CashIcon />} from={from} to={to} cls="is-cash" />
        <Row icon={<ArmIcon />} from={from} to={to} cls="is-arm" />
        <div className="rb-warn rbx">Rebirth resets Power and Level to 1!</div>
        <div className="rb-level">
          <div className="rb-level-fill" style={{ width: `${Math.min(1, level / need) * 100}%` }} />
          <span className="rbx">Level {Math.min(level, need)}/{need}</span>
        </div>
        <button className={`rb-go rbx ${ready ? '' : 'is-locked'}`} disabled={!ready} onClick={doRebirth}>
          {pointed && <span className="ui-arrow is-left" aria-hidden="true" />}
          {ready ? 'Rebirth' : `Reach Level ${need}`}
        </button>
      </div>
    </div>
  )
}
