import { useEffect, useRef } from 'react'
import { actionResultState } from '../../systems/actionResult.js'

// Top-center popup reporting the result of a held-E attempt: green on success,
// red on a blocked action. Pops in with an overshoot, holds, then shrinks out
// (hud.css action-result-pop). Polled at ~10Hz against actionResultState.id so
// a repeat of the same message still re-triggers it.
export default function ActionResult() {
  const rootRef = useRef(null)
  const textRef = useRef(null)

  useEffect(() => {
    let lastId = actionResultState.id
    const timer = setInterval(() => {
      if (actionResultState.id === lastId) return
      lastId = actionResultState.id
      const root = rootRef.current
      const text = textRef.current
      if (!root || !text) return
      text.textContent = actionResultState.text
      root.classList.toggle('is-fail', !actionResultState.success)
      // Restart the one-shot animation even if one is mid-run.
      root.classList.remove('is-playing')
      void root.offsetWidth
      root.classList.add('is-playing')
    }, 100)
    return () => clearInterval(timer)
  }, [])

  return (
    <div ref={rootRef} className="action-result" onAnimationEnd={() => rootRef.current?.classList.remove('is-playing')}>
      <span ref={textRef} className="rbx action-result-text" />
    </div>
  )
}
