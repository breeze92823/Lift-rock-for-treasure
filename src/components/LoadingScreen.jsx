import { useEffect, useState } from 'react'
import { subscribeAuth } from '../systems/bloxity.js'
import { DEV_MODE } from '../data/bloxity.js'
import { useGameStore } from '../store/useGameStore.js'
import { retryNet } from '../systems/net.js'

// Opaque until the scene has resolved AND Bloxity auth has settled AND the
// character has loaded AND the saved progress has arrived, then fades out. VITE_DEV_MODE=true skips it.
const FADE_MS = 450

export default function LoadingScreen({ sceneReady }) {
  const [authReady, setAuthReady] = useState(false)
  const [hidden, setHidden] = useState(false)
  const avatarLoaded = useGameStore((s) => s.avatarLoaded)
  const progressLoaded = useGameStore((s) => s.progressLoaded)
  const netError = useGameStore((s) => s.netError)

  useEffect(() => subscribeAuth((s) => setAuthReady(s.ready)), [])

  const ready = sceneReady && authReady && avatarLoaded && (progressLoaded || DEV_MODE)

  useEffect(() => {
    if (!ready) return
    const id = setTimeout(() => setHidden(true), FADE_MS)
    return () => clearTimeout(id)
  }, [ready])

  if ((DEV_MODE && !netError) || hidden) return null

  return (
    <div className={`loading${ready ? ' is-done' : ''}`} style={{ transitionDuration: `${FADE_MS}ms` }}>
      <div className="loading-rock" aria-hidden>
        <span className="gem" /><span className="glint" /><span className="stone" />
      </div>
      <h1>LIFT ROCK FOR TREASURE</h1>
      {netError ? (
        <>
          <p className="loading-error">Failed to load your progress: {netError}</p>
          <button type="button" className="loading-retry" onClick={retryNet}>Try again</button>
        </>
      ) : (
        <>
          <div className="loading-track"><div className="loading-fill" /></div>
          <p>{!sceneReady ? 'Building the world…' : !authReady ? 'Signing in…' : !progressLoaded && !DEV_MODE ? 'Loading your progress…' : 'Getting ready…'}</p>
        </>
      )}
    </div>
  )
}
