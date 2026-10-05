import { useGameStore } from '../../store/useGameStore.js'
import { claimOffline } from '../../systems/net.js'
import { shortMoney } from '../../utils/shortMoney.js'
import { shortNum } from '../../data/arms.js'
import { ArmIcon, CashIcon } from './icons.jsx'
import './offline.css'

// Away time as "3h 20m" / "45m".
function away(seconds) {
  const m = Math.floor(seconds / 60)
  const h = Math.floor(m / 60)
  return h ? `${h}h ${m % 60}m` : `${m}m`
}

// Shown on join when the server reports unclaimed offline earnings (systems/net.js
// `offlineEarnings`); Claim asks the server to pay out (`claimOffline`).
export default function OfflineWindow() {
  const offer = useGameStore((s) => s.offlineEarnings)
  const claiming = useGameStore((s) => s.offlineClaiming)
  if (!offer) return null

  return (
    <div className="off-window" onPointerDown={(e) => e.stopPropagation()}>
      <div className="off-panel">
        <div className="off-title rbx"><span className="off-clock">⏰</span>Offline Earnings</div>
        <div className="off-away rbx">Away for {away(offer.seconds)}</div>
        <div className="off-row is-cash"><CashIcon /><b className="rbx">{shortMoney(offer.cash)}</b></div>
        <div className="off-row is-arm"><ArmIcon /><b className="rbx">+{shortNum(offer.strength)}</b></div>
        <button className="off-claim rbx" disabled={claiming} onClick={claimOffline}>Claim</button>
      </div>
    </div>
  )
}
