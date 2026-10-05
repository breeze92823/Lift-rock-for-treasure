import { useFrame, useThree } from '@react-three/fiber'
import { step as stepPlayer } from '../systems/playerMovement.js'
import { update as updateCamera } from '../systems/cameraOrbit.js'
import { inputState } from '../systems/input.js'
import { step as stepActionPopups } from '../systems/actionPopups.js'
import { stepTraining } from '../systems/strengthGain.js'
import { stepInteract } from '../systems/interact.js'
import '../systems/loot.js' // registers loot pickup + Sell stall interactions

// The single simulation tick. Rendered before the view components so its
// useFrame subscribes first and runs first each frame.
export default function GameLoop() {
  const camera = useThree((s) => s.camera)

  useFrame((_state, rawDelta) => {
    const dt = Math.min(rawDelta, 0.1) // clamp huge frames (tab switch, breakpoint)
    stepPlayer(dt)
    stepTraining(dt)
    stepInteract()
    inputState.interact = false // one-shot edge flag
    updateCamera(camera, dt)
    stepActionPopups(dt, camera)
  })

  return null
}
