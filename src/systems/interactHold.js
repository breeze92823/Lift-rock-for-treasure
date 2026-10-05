// Shared "hold E to confirm" gate. One timer no matter which zone is near,
// since only one prompt is ever visible at once. Stepped once per frame from
// systems/interact.js; polled by components/hud/HUD.jsx at ~10Hz to draw the
// fill ring.
import { HOLD_MS } from '../data/interact.js'

export const interactHoldState = {
  active: false, // a hold is in progress against some zone this frame
  progress: 0, // 0..1 toward the zone's holdMs
}

let ownerKey = null
let startedAt = 0
let spent = false // a hold already fired and E hasn't been released since

function reset() {
  ownerKey = null
  startedAt = 0
  interactHoldState.active = false
  interactHoldState.progress = 0
}

// zoneKey identifies the interactable in range (null when none). keyDown is
// whether the interact key is physically held. Returns true on the exact frame
// a continuous hold against the SAME zoneKey completes: the caller's cue to
// fire that zone's action, once. Releasing, or the zone changing mid-hold,
// resets the timer; partial progress never carries between actions.
export function step(zoneKey, keyDown, holdMs = HOLD_MS) {
  if (!keyDown) spent = false
  if (!zoneKey || !keyDown || spent) {
    reset()
    return false
  }
  if (ownerKey !== zoneKey) {
    ownerKey = zoneKey
    startedAt = performance.now()
  }
  interactHoldState.active = true
  const elapsed = performance.now() - startedAt
  interactHoldState.progress = holdMs > 0 ? Math.min(1, elapsed / holdMs) : 1
  if (elapsed >= holdMs) {
    reset()
    spent = true // one fire per key press: must release E before the next
    return true
  }
  return false
}
