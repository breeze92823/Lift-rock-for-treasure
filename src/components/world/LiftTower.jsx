import { useEffect, useMemo, useRef } from 'react'
import { CanvasTexture, SRGBColorSpace } from 'three'
import { useFrame } from '@react-three/fiber'
import { DRAIN, LIFT, LIFT_END, LIFT_ZONES } from '../../data/world.js'
import { MAT, liftFloor, plastic } from '../../materials/world.js'
import { liftStripeTexture, makeTimerBoard, tierTexture, zoneMarkerTexture } from '../../utils/labels.js'
import { THROW_TIME, clearedGates, liftState } from '../../systems/liftGate.js'
import { getDisplayName } from '../../systems/bloxity.js'
import { useGameStore } from '../../store/useGameStore.js'
import { finalLuck, luckBonus } from '../../data/loot.js'
import { Block } from './parts.jsx'
import LootItems from './LootItems.jsx'

const PANEL_W = 8.8
const PANEL_H = 2.2
const PLINTH_H = 2.2 // dark base block carrying the label
const SLAB_H = 1.7 // big white rock slab
const BLOCK_H = LIFT.barrierH - PLINTH_H - SLAB_H // gray blocks on top
const SHOW_RARITY_BOARD = false // hidden for now; will be used later
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
    <group name="Rarity Board" position={[LIFT.x, 0, z]}>
      {[-1, 1].map((s) => (
        <Block key={s} name={`Rarity Board Post ${s < 0 ? 'West' : 'East'}`} x={s * postX} w={0.4} h={bottom + h} d={0.4} mat={MAT.post} />
      ))}
      <mesh name="Rarity Board Panel" position={[0, bottom + h / 2, 0]} castShadow>
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

const BAR_W = 7
const BAR_H = 0.7
const BAR_Y = PLINTH_H + 0.9

const KFMT_UNITS = [[1e15, 'Qa'], [1e12, 'T'], [1e9, 'B'], [1e6, 'M'], [1e3, 'K']]
const kfmt = (n) => {
  const u = KFMT_UNITS.find(([v]) => n >= v)
  return u ? `${+(n / u[0]).toFixed(1)}${u[1]}` : String(Math.floor(n))
}

// Health bar painted on the gate's south face; fills as the player lifts.
function HealthBar({ b, z }) {
  const { canvas, map } = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 512
    c.height = Math.round((512 * BAR_H) / BAR_W)
    const t = new CanvasTexture(c)
    t.colorSpace = SRGBColorSpace
    return { canvas: c, map: t }
  }, [])
  const shown = useRef(-1)
  useEffect(() => () => map.dispose(), [map])
  useFrame(() => {
    const g = liftState.gates[b.luck]
    const hp = g ? g.hp : 0
    if (hp === shown.current) return
    shown.current = hp
    const ctx = canvas.getContext('2d')
    const { width: w, height: h } = canvas
    ctx.clearRect(0, 0, w, h)
    ctx.fillStyle = '#111'
    ctx.beginPath()
    ctx.roundRect(0, 0, w, h, h / 2)
    ctx.fill()
    const pad = h * 0.12
    const fill = (w - 2 * pad) * Math.min(1, hp / b.hp)
    if (fill > 0) {
      ctx.fillStyle = '#2ecc40'
      ctx.beginPath()
      ctx.roundRect(pad, pad, Math.max(fill, h - 2 * pad), h - 2 * pad, (h - 2 * pad) / 2)
      ctx.fill()
    }
    ctx.font = `bold ${h * 0.58}px sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.lineWidth = h * 0.12
    ctx.strokeStyle = '#000'
    ctx.fillStyle = '#fff'
    const label = `${kfmt(hp)} / ${kfmt(b.hp)}`
    ctx.strokeText(label, w / 2, h / 2 + 2)
    ctx.fillText(label, w / 2, h / 2 + 2)
    map.needsUpdate = true
  })
  return (
    <mesh name={`Gate x${b.luck} Health Bar`} position={[LIFT.x, BAR_Y, b.zS + 0.03]}>
      <planeGeometry args={[BAR_W, BAR_H]} />
      <meshBasicMaterial map={map} transparent toneMapped={false} />
    </mesh>
  )
}

// A luck barrier: dark plinth with its label on the south face, two rock
// steps on top. Stands in the corridor until lifted.
function Barrier({ b, name }) {
  const bonus = useGameStore((s) => luckBonus(s.plotSlots))
  const shown = finalLuck(b.luck, bonus)
  const map = useMemo(() => tierTexture(shown, b.req, name, b.plinth), [shown, b.req, name, b.plinth])
  const z = (b.zS + b.zN) / 2
  const w = b.w
  const len = b.zS - b.zN
  const lift = useRef()

  // Heaved up and shaking while the player lifts, then thrown skyward (tumbling
  // and shrinking) until it is gone.
  useFrame(() => {
    const o = lift.current
    const g = liftState.gates[b.luck]
    if (!o) return
    if (!g) {
      // Gate was reset (player returned to the hub): put it back in place.
      if (!o.visible || o.position.y !== 0) {
        o.visible = true
        o.position.set(0, 0, z)
        o.rotation.set(0, 0, 0)
        o.scale.setScalar(1)
      }
      return
    }
    if (g.phase === 'gone') {
      o.visible = false
    } else if (g.phase === 'lifting' || g.phase === 'idle') {
      const u = Math.min(1, g.hp / g.max) // heaved higher as its health fills
      const shake = g.phase === 'lifting' ? 1 : 0
      o.position.y = 1.6 * u * u
      o.position.x = Math.sin(g.t * 45) * 0.09 * u * shake
      o.rotation.z = Math.sin(g.t * 38) * 0.012 * u * shake
    } else {
      const u = Math.min(1, g.t / THROW_TIME)
      o.position.y = 1.6 + 140 * u * u
      o.position.z = z - 30 * u // drifts north as it flies
      o.position.x = 0
      o.rotation.x = -u * 5
      o.rotation.z = u * 3
      o.scale.setScalar(1 - 0.7 * u)
    }
  })

  return (
    <group ref={lift} position-z={z}>
    <group position-z={-z} name={`Gate x${b.luck}`}>
      <Block name={`Gate x${b.luck} Plinth`} x={LIFT.x} z={z} w={w} h={PLINTH_H} d={len} mat={plastic(b.plinth)} />
      <mesh name={`Gate x${b.luck} Label`} position={[LIFT.x, PLINTH_H / 2, b.zS + 0.02]}>
        <planeGeometry args={[PANEL_W, PANEL_H]} />
        <meshBasicMaterial map={map} toneMapped={false} />
      </mesh>
      <HealthBar b={b} z={z} />
      <Block name={`Gate x${b.luck} Rock Slab`} x={LIFT.x} y={PLINTH_H} z={z} w={w - 4} h={SLAB_H} d={len - 0.8} mat={plastic(b.rock)} />
      <Block name={`Gate x${b.luck} Rock Large`} x={LIFT.x - 1.5} y={PLINTH_H + SLAB_H} z={z} w={w - 9} h={BLOCK_H} d={len - 2} mat={plastic(b.rock2)} />
      <Block name={`Gate x${b.luck} Rock Small`} x={LIFT.x + w / 2 - 4.2} y={PLINTH_H + SLAB_H} z={z + 0.4} w={3.2} h={BLOCK_H * 0.7} d={len - 2.4} mat={plastic(b.rock2)} />
    </group>
    </group>
  )
}

// The zone's loot stays hidden under its gate and appears once the gate is lifted.
function LootReveal({ zone }) {
  const ref = useRef()
  useFrame(() => {
    if (ref.current) ref.current.visible = clearedGates.has(zone.luck)
  })
  return (
    <group ref={ref} name={`Loot x${zone.luck}`} visible={false}>
      <LootItems zone={zone} />
    </group>
  )
}

// Gateway and Lift Pad share one spot at the south end of a zone. The Lift Pad
// shows until the zone's gate has been lifted away, then the Gateway takes over.
function ZoneEntry({ zn, floorW, padMap, gatewayMap }) {
  const pad = useRef()
  const gateway = useRef()
  useFrame(() => {
    const open = clearedGates.has(zn.luck)
    if (pad.current) pad.current.visible = !open
    if (gateway.current) gateway.current.visible = open
  })
  return (
    <>
      <mesh ref={pad} name={`Lift Pad x${zn.luck}`} position={[LIFT.x, 0.06, zn.entryZ]} rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[floorW, LIFT.entryLen]} />
        <meshStandardMaterial map={padMap} roughness={0.8} />
      </mesh>
      <mesh ref={gateway} name={`Gateway x${zn.luck}`} visible={false} position={[LIFT.x, 0.07, zn.entryZ]} rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[floorW, LIFT.entryLen]} />
        <meshStandardMaterial map={gatewayMap} roughness={0.8} />
      </mesh>
    </>
  )
}

// The Lift corridor: a chain of identical zones. Each has an entry (Lift Pad,
// then Gateway once its gate is gone) and a Loot Floor covered by that gate.
export default function LiftTower() {
  const mouthStripe = useMemo(() => liftStripeTexture(2), []) // 4 m deep Lift Pad
  const bonus = useGameStore((s) => luckBonus(s.plotSlots))
  const markers = useMemo(() => LIFT_ZONES.map((zn) => zoneMarkerTexture(finalLuck(zn.luck, bonus))), [bonus])
  const name = getDisplayName()
  const half = LIFT.width / 2
  const len = LIFT.zStart - LIFT_END
  const floorW = LIFT.width - 2 * DRAIN.width // walkable floor between the channels
  return (
    <group name="Lift Corridor">
      {LIFT_ZONES.map((zn, i) => (
        <group key={zn.luck} name={`Zone x${zn.luck}`}>
          <Block name={`Loot Floor x${zn.luck}`} x={LIFT.x} y={-2} z={(zn.zFrom + zn.zTo) / 2} w={floorW} h={2.04} d={zn.zFrom - zn.zTo} mat={liftFloor(zn.floor)} shadow={false} />
          <ZoneEntry zn={zn} floorW={floorW} padMap={mouthStripe} gatewayMap={markers[i]} />
          <Barrier b={zn.gate} name={name} />
        </group>
      ))}
      {/* Drainage channels along both floor edges, glowing cyan at the bottom. */}
      {[-1, 1].map((s) => (
        <Block key={s} name={`Gutter ${s < 0 ? 'West' : 'East'}`} x={LIFT.x + s * (half - DRAIN.width / 2)} y={-2} z={(LIFT.zStart + LIFT_END) / 2} w={DRAIN.width} h={2 - DRAIN.depth} d={len} mat={MAT.glow} shadow={false} />
      ))}
      {LIFT_ZONES.map((zn) => (
        <LootReveal key={zn.luck} zone={zn} />
      ))}
      {SHOW_RARITY_BOARD && <TimerBoard z={BOARD_Z} width={LIFT.width} bottom={BOARD_BOTTOM} />}
    </group>
  )
}
