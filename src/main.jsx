import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { install as installInput } from './systems/input.js'
import { install as installAudio } from './systems/audio.js'
import { installButtonSounds } from './systems/sfx.js'
import { player, resetPlayer } from './systems/playerState.js'
import { setView, syncYawToPlayer } from './systems/cameraOrbit.js'
import { plotFacing, plotSpawn, SPAWN, SPAWN_FACING } from './data/world.js'
import { useGameStore } from './store/useGameStore.js'
import { startNet } from './systems/net.js'
import { FONT_FAMILY } from './utils/labels.js'
import { init as initBloxity } from './systems/bloxity.js'

initBloxity()
resetPlayer(SPAWN, SPAWN_FACING)
syncYawToPlayer()
installInput()
installAudio() // unlocks the AudioContext on the first gesture
installButtonSounds() // click + hover sounds on every HUD button
startNet() // Colyseus: saved progress + remote players

// Dev-only console hook, e.g. __game.teleport(0, 0, -5)
if (import.meta.env.DEV) {
  window.__game = {
    player,
    setView,
    teleport: (x, y, z, facing = player.facing) => resetPlayer({ x, y, z }, facing),
    home: () => resetPlayer(plotSpawn(useGameStore.getState().homePlot), plotFacing(useGameStore.getState().homePlot)),
  }
}

// World signs are painted to canvases once, so the UI font must be loaded
// first or they bake in the fallback. Don't hold the game hostage to it.
const fontReady = Promise.race([
  document.fonts?.load(`700 64px ${FONT_FAMILY}`),
  new Promise((resolve) => setTimeout(resolve, 2500)),
]).catch(() => {})

fontReady.then(() => {
  createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
})
