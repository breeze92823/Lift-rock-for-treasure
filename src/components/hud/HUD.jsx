import { useEffect, useState } from 'react'
import './hud.css'
import { useGameStore } from '../../store/useGameStore.js'
import { player, resetPlayer } from '../../systems/playerState.js'
import { showMenu } from '../../systems/bloxity.js'
import { HOME_FACING, HOME_SPAWN, SPAWN, SPAWN_FACING } from '../../data/world.js'
import InteractPrompt from './InteractPrompt.jsx'
import ActionResult from './ActionResult.jsx'
import ActionPopups from './ActionPopups.jsx'
import SellWindow from './SellWindow.jsx'
import RebirthWindow from './RebirthWindow.jsx'
import IndexWindow from './IndexWindow.jsx'
import { levelForRebirth } from '../../data/levels.js'
import Hotbar from './Hotbar.jsx'
import { ArmIcon, BackpackIcon, BookIcon, CashIcon, FaceIcon, GearIcon, GiftIcon, RebirthIcon, RobuxIcon, UpgradeIcon } from './icons.jsx'

const SUFFIXES = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi']
function shortNumber(n) {
  if (n < 1000) return String(Math.floor(n))
  let i = 0
  while (n >= 1000 && i < SUFFIXES.length - 1) {
    n /= 1000
    i++
  }
  return `${n < 10 ? n.toFixed(2).replace(/\.?0+$/, '') : n < 100 ? n.toFixed(1).replace(/\.0$/, '') : Math.floor(n)}${SUFFIXES[i]}`
}
const cash = (n) => (n < 1e6 ? `$${Math.floor(n).toLocaleString('en-US')}` : `$${shortNumber(n)}`)

// Keeps a click on the HUD from also reaching the world input handlers.
const stop = (e) => e.stopPropagation()

function MenuButton({ label, children, badge, onClick }) {
  return (
    <button className="hud-menu-btn" onPointerDown={stop} onClick={onClick}>
      {badge && <span className="hud-menu-badge rbx">{badge}</span>}
      {children}
      <span className="hud-menu-label rbx">{label}</span>
    </button>
  )
}

function StrengthPack({ amount, price }) {
  return (
    <button className="hud-pack" onPointerDown={stop}>
      <span className="hud-pack-price rbx">
        <RobuxIcon className="hud-robux" />
        {price}
      </span>
      <ArmIcon className="hud-pack-icon" />
      <span className="hud-pack-amount rbx">+{amount}</span>
    </button>
  )
}

// Spawn / Home are disabled while the player is lifting a gate or training.
// `player` is mutated in place (no subscription), so poll it per frame and
// only re-render when the busy flag flips.
function TravelButtons() {
  const [busy, setBusy] = useState(false)
  useEffect(() => {
    let raf
    const tick = () => {
      setBusy(player.lifting != null || player.training != null)
      raf = requestAnimationFrame(tick)
    }
    tick()
    return () => cancelAnimationFrame(raf)
  }, [])
  const go = (spawn, facing) => () => {
    if (player.lifting == null && player.training == null) resetPlayer(spawn, facing)
  }
  return (
    <div className="hud-travel">
      <button className="hud-travel-btn is-spawn rbx" disabled={busy} onPointerDown={stop} onClick={go(SPAWN, SPAWN_FACING)}>
        Spawn
      </button>
      <button className="hud-travel-btn is-home rbx" disabled={busy} onPointerDown={stop} onClick={go(HOME_SPAWN, HOME_FACING)}>
        Home
      </button>
    </div>
  )
}

// Screen-space game UI laid out after the reference screenshots (1920x976).
// 1rem = 100 px of that reference, scaled to the viewport (see hud.css), so
// every value below reads straight off the screenshot.
export default function HUD() {
  const s = useGameStore()
  const pct = Math.min(1, s.xp / s.xpNeeded)

  return (
    <div className="hud">
      <InteractPrompt />
      <ActionResult />
      <ActionPopups />
      <SellWindow />
      <RebirthWindow />
      <IndexWindow />
      <Hotbar />

      <TravelButtons />

      <button className="hud-gear" onPointerDown={stop} onClick={() => showMenu()} aria-label="Settings">
        <GearIcon />
      </button>

      <div className="hud-stats">
        <div className="hud-stat-row">
          <RebirthIcon className="hud-stat-icon is-small" />
          <span className="hud-rebirths rbx">{shortNumber(s.rebirths)}</span>
        </div>
        <div className="hud-stat-row">
          <CashIcon className="hud-stat-icon" />
          <span className="hud-cash rbx">{cash(s.cash)}</span>
        </div>
      </div>

      <div className="hud-menu">
        <MenuButton label="Index" onClick={() => useGameStore.setState({ indexOpen: true })}>
          <BookIcon />
        </MenuButton>
        <MenuButton label="Arms">
          <ArmIcon />
        </MenuButton>
        <MenuButton label="Upgrades">
          <UpgradeIcon />
        </MenuButton>
        <MenuButton label="Rebirth" badge={`${Math.min(100, Math.floor((s.level / levelForRebirth(s.rebirths)) * 100))}%`} onClick={() => useGameStore.setState({ rebirthOpen: true })}>
          <RebirthIcon />
        </MenuButton>
      </div>

      <div className="hud-backpack">
        <BackpackIcon className="hud-backpack-icon" />
        <span className="rbx">
          {s.backpack}/{s.backpackMax}
        </span>
      </div>

      <div className="hud-corner">
        <div className="hud-boost">
          <FaceIcon />
          <span className="rbx">+{s.luckBoost}%</span>
        </div>
        <BackpackIcon className="hud-corner-pack" />
      </div>

      <div className="hud-right">
        <button className="hud-gamepass" onPointerDown={stop}>
          <span className="hud-permanent rbx">Permanent!</span>
          <span className="hud-gamepass-box">
            <span className="hud-gamepass-price rbx">
              <RobuxIcon className="hud-robux" />2
            </span>
            <span className="rbx">2X Strength</span>
          </span>
          <ArmIcon className="hud-gamepass-arm" />
        </button>
        <StrengthPack amount="100K" price="11" />
        <StrengthPack amount="1M" price="59" />
        <StrengthPack amount="10M" price="169" />
        <button className="hud-pack" onPointerDown={stop}>
          <GiftIcon className="hud-pack-icon" />
          <span className="hud-pack-amount rbx">Free</span>
        </button>
      </div>

      <div className="hud-progress">
        <div className="hud-strength rbx">{shortNumber(s.strength)} Strength</div>
        <div className="hud-level">
          <ArmIcon className="hud-level-arm" />
          <div className="hud-level-bar">
            <div className="hud-level-fill" style={{ width: `${pct * 100}%` }} />
            <span className="hud-level-text rbx">Level {s.level}</span>
            <span className="hud-level-xp rbx">
              {shortNumber(s.xp)}/{shortNumber(s.xpNeeded)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
