import Arena from './world/Arena.jsx'
import LiftTower from './world/LiftTower.jsx'
import Stalls from './world/Stalls.jsx'
import Treasures from './world/Treasures.jsx'
import Pool from './world/Pool.jsx'
import Training from './world/Training.jsx'
import Plots from './world/Plots.jsx'

// The whole lobby. Layout lives in data/world.js (which also feeds the
// collision lookup); each piece below just draws its part of it.
export default function World() {
  return (
    <group>
      <Arena />
      <LiftTower />
      <Stalls />
      <Treasures />
      <Pool />
      <Training />
      <Plots />
    </group>
  )
}
