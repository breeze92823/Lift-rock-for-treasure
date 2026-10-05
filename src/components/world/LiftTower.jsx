import { useEffect, useMemo } from 'react'
import { LIFT, LIFT_BARRIERS, LIFT_END } from '../../data/world.js'
import { MAT, plastic } from '../../materials/world.js'
import { liftStripeTexture, makeTimerBoard, tierTexture, zoneMarkerTexture } from '../../utils/labels.js'
import { getDisplayName } from '../../systems/bloxity.js'
import { Block } from './parts.jsx'

const PANEL_W = 12
const PANEL_H = 3
const PLINTH_H = 3.2 // dark front block carrying the label
const STEP_H = (LIFT.barrierH - PLINTH_H) / 2 // two rock steps on top
const BOARD_Z = LIFT.zStart - 12
const BOARD_BOTTOM = 6

// Rarity spawn cycles, seconds. Every client agrees on the countdown because
// it is derived from wall-clock time.
const TIMERS = [
  { label: 'Legendary', period: 120, bg: '#ffb21a', border: '#7a3a00' },
  { label: 'Mythic', period: 900, bg: 'rainbow', border: '#000000' },
  { label: 'Secret', period: 900, bg: '#151515', border: '#ffffff' },
]

const mmss = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

// Spans the corridor on posts planted in the two side walls.
function TimerBoard({ z, width, bottom }) {
  const board = useMemo(() => makeTimerBoard(), [])
  useEffect(() => {
    const draw = () => {
      const now = Math.floor(Date.now() / 1000)
      board.draw(TIMERS.map((t) => ({ ...t, time: mmss(t.period - (now % t.period)) })))
    }
    draw()
    const id = setInterval(draw, 1000)
    return () => {
      clearInterval(id)
      board.map.dispose()
    }
  }, [board])
  const h = width / board.aspect
  const postX = LIFT.width / 2 + 0.5
  return (
    <group position={[LIFT.x, 0, z]}>
      {[-1, 1].map((s) => (
        <Block key={s} x={s * postX} w={0.4} h={bottom + h} d={0.4} mat={MAT.post} />
      ))}
      <mesh position={[0, bottom + h / 2, 0]} castShadow>
        <boxGeometry args={[width, h, 0.3]} />
        <meshStandardMaterial attach="material-0" color="#f26b0f" />
        <meshStandardMaterial attach="material-1" color="#f26b0f" />
        <meshStandardMaterial attach="material-2" color="#f26b0f" />
        <meshStandardMaterial attach="material-3" color="#f26b0f" />
        <meshBasicMaterial attach="material-4" map={board.map} toneMapped={false} />
        <meshStandardMaterial attach="material-5" color="#f26b0f" />
      </mesh>
    </group>
  )
}

// A luck barrier: dark plinth with its label on the south face, two rock
// steps on top. Stands in the corridor until lifted.
function Barrier({ b, name }) {
  const map = useMemo(() => tierTexture(b.luck, b.req, name, b.plinth), [b.luck, b.req, name, b.plinth])
  const z = (b.zS + b.zN) / 2
  const w = LIFT.width
  return (
    <group>
      <Block x={LIFT.x} z={z} w={w} h={PLINTH_H} d={LIFT.barrierLen} mat={plastic(b.plinth)} />
      <mesh position={[LIFT.x, PLINTH_H / 2, b.zS + 0.02]}>
        <planeGeometry args={[PANEL_W, PANEL_H]} />
        <meshBasicMaterial map={map} toneMapped={false} />
      </mesh>
      <Block x={LIFT.x} y={PLINTH_H} z={z} w={w - 2} h={STEP_H} d={LIFT.barrierLen - 1} mat={plastic(b.rock)} />
      <Block x={LIFT.x} y={PLINTH_H + STEP_H} z={z} w={w - 7} h={STEP_H} d={LIFT.barrierLen - 2} mat={plastic(b.rock2)} />
    </group>
  )
}

// The Lift corridor: dark loot floor from the plaza to the far wall, an x1
// zone marker at the mouth, and luck barriers each fronted by a LIFT stripe.
export default function LiftTower() {
  const stripe = useMemo(() => liftStripeTexture(), [])
  const marker = useMemo(() => zoneMarkerTexture(1), [])
  const name = getDisplayName()
  const half = LIFT.width / 2
  const len = LIFT.zStart - LIFT_END
  return (
    <group>
      <Block x={LIFT.x} y={-2} z={(LIFT.zStart + LIFT_END) / 2} w={LIFT.width} h={2.04} d={len} mat={MAT.liftPad} shadow={false} />
      <mesh position={[LIFT.x, 0.07, LIFT.zStart - 2]} rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[LIFT.width, 4]} />
        <meshStandardMaterial map={marker} roughness={0.8} />
      </mesh>
      {/* Cyan glow trims along both floor edges. */}
      {[-1, 1].map((s) => (
        <Block key={s} x={LIFT.x + s * (half - 0.25)} z={(LIFT.zStart + LIFT_END) / 2} w={0.5} h={0.3} d={len} mat={MAT.glow} shadow={false} />
      ))}
      {LIFT_BARRIERS.map((b) => (
        <group key={b.luck}>
          <mesh position={[LIFT.x, 0.06, b.stripeZ]} rotation-x={-Math.PI / 2} receiveShadow>
            <planeGeometry args={[LIFT.width, LIFT.stripeLen]} />
            <meshStandardMaterial map={stripe} roughness={0.8} />
          </mesh>
          <Barrier b={b} name={name} />
        </group>
      ))}
      <TimerBoard z={BOARD_Z} width={LIFT.width} bottom={BOARD_BOTTOM} />
    </group>
  )
}
