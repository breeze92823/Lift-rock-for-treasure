import { useEffect, useRef } from 'react'
import { interactState } from '../../systems/interact.js'
import { interactHoldState } from '../../systems/interactHold.js'

// Circumference of the r=15 ring (viewBox 36): stroke-dashoffset runs from this
// (empty) down to 0 (full) as the hold approaches the zone's holdMs.
const RING_R = 15
const RING_C = 2 * Math.PI * RING_R

// "E" keycap ringed by the hold-to-confirm progress, plus the zone's label.
// While E is held the card strips down to just the enlarged ring + keycap
// (class is-held) and restores the instant the hold is released. Written
// imperatively on a ~10Hz poll of the singletons so it never re-renders per
// frame.
export default function InteractPrompt() {
  const rootRef = useRef(null)
  const ringRef = useRef(null)
  const textRef = useRef(null)

  useEffect(() => {
    let shown = null
    const id = setInterval(() => {
      const root = rootRef.current
      const ring = ringRef.current
      const text = textRef.current
      if (!root || !ring || !text) return
      const near = interactState.near
      const key = near ? near.id : null
      if (key !== shown) {
        shown = key
        if (near) text.textContent = near.prompt
        root.classList.toggle('is-visible', !!near)
      }
      const p = near ? interactHoldState.progress : 0
      ring.style.strokeDashoffset = String(RING_C * (1 - p))
      root.classList.toggle('is-held', p > 0)
    }, 100)
    return () => clearInterval(id)
  }, [])

  return (
    <div ref={rootRef} className="interact-prompt">
      <span className="interact-key">
        <svg viewBox="0 0 36 36">
          <circle cx="18" cy="18" r={RING_R} className="interact-ring-bg" />
          <circle
            ref={ringRef}
            cx="18"
            cy="18"
            r={RING_R}
            className="interact-ring"
            style={{ strokeDasharray: RING_C, strokeDashoffset: RING_C }}
          />
        </svg>
        <span className="interact-keycap">E</span>
      </span>
      <span ref={textRef} className="interact-label" />
    </div>
  )
}
