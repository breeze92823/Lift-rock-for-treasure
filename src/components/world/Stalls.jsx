import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { DoubleSide, MeshStandardMaterial } from 'three'
import { STALLS } from '../../data/world.js'
import { MAT, plastic } from '../../materials/world.js'
import { useGameStore } from '../../store/useGameStore.js'
import { Block, Label, Npc } from './parts.jsx'

const STRIPES = 7
const ROOF_W = 4
const ROOF_D = 3.4

// Striped market awning, tilted down toward the front.
const AWNING_TILT = 0.28

function Awning({ color, dark, awningRef }) {
  const sw = ROOF_W / STRIPES
  return (
    <group ref={awningRef} position={[0, 3.35, 0.1]} rotation-x={AWNING_TILT}>
      {Array.from({ length: STRIPES }, (_, i) => (
        <group key={i}>
          <Block x={-ROOF_W / 2 + sw * (i + 0.5)} y={0} w={sw} h={0.14} d={ROOF_D} mat={i % 2 ? MAT.white : plastic(color)} />
          {/* front valance */}
          <Block x={-ROOF_W / 2 + sw * (i + 0.5)} y={-0.45} z={ROOF_D / 2 - 0.05} w={sw} h={0.5} d={0.1} mat={i % 2 ? MAT.white : plastic(dark)} />
        </group>
      ))}
    </group>
  )
}

function Ring({ color }) {
  return (
    <group position={[0, 0.08, 2.8]} rotation-x={-Math.PI / 2}>
      <mesh>
        <torusGeometry args={[1.7, 0.04, 8, 64]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} toneMapped={false} />
      </mesh>
      <mesh>
        <circleGeometry args={[1.7, 48]} />
        <meshBasicMaterial color={color} transparent opacity={0.22} depthWrite={false} side={DoubleSide} />
      </mesh>
    </group>
  )
}

// Shop animation (ported from Tnt-Mining's Stalls.jsx): while the stall's window
// is open the chest lid swings up; when it closes the stall squash-pops, the
// awning wobbles, coins burst from the chest and the merchant hops and waves.
const GOLD = '#ffc21a'
const CHEST_LID_OPEN = -1.9 // rad about the back hinge
const COIN_BURST = [[-0.5, 1.2], [0.3, 1.5], [0.7, 1.1], [-0.2, 1.7], [0.1, 1.3]] // [sideways drift, launch speed]
const COIN_BURST_TIME = 0.9
const WAVE_S = 1.6

const goldMat = new MeshStandardMaterial({ color: GOLD, emissive: '#ff9d00', emissiveIntensity: 0.25, metalness: 0.3, roughness: 0.4 })

function GoldCoin({ position, rotation }) {
  return (
    <mesh position={position} rotation={rotation} material={goldMat} castShadow>
      <cylinderGeometry args={[0.13, 0.13, 0.05, 10]} />
    </mesh>
  )
}

// Small treasure chest beside the counter; the lid hinges on the back top edge.
function Chest({ lidRef }) {
  const blue = plastic('#2fb4ef')
  const gold = plastic(GOLD)
  return (
    <group>
      <Block w={1} h={0.55} d={0.7} mat={blue} />
      <Block w={1.04} h={0.1} d={0.74} mat={gold} />
      {[-0.46, 0.46].map((x) => <Block key={x} x={x} w={0.12} h={0.56} d={0.76} mat={gold} />)}
      <group ref={lidRef} position={[0, 0.56, -0.35]}>
        <Block z={0.35} w={1} h={0.28} d={0.7} mat={blue} />
        <Block z={0.35} y={0.28} w={1.04} h={0.08} d={0.74} mat={gold} />
        {[-0.46, 0.46].map((x) => <Block key={x} x={x} z={0.35} w={0.12} h={0.34} d={0.76} mat={gold} />)}
      </group>
      <mesh position={[0, 0.5, 0]} material={goldMat}>
        <boxGeometry args={[0.8, 0.08, 0.5]} />
      </mesh>
    </group>
  )
}

function Stall({ s }) {
  const counter = plastic(s.counter)
  const rootRef = useRef()
  const awning = useRef()
  const merchant = useRef()
  const arm = useRef()
  const lid = useRef()
  const coinRef = useRef()
  const burst = useRef([])
  // sinceClose: seconds since the window closed (Infinity = never, so one-shots stay idle).
  const anim = useRef({ wasOpen: false, sinceClose: Infinity, lid: 0, arm: 0 })

  useFrame(({ clock }, dt) => {
    const a = anim.current
    const open = !!useGameStore.getState()[`${s.id}Open`]
    if (!open && a.wasOpen) a.sinceClose = 0
    if (open && !a.wasOpen) a.sinceClose = Infinity
    a.wasOpen = open
    a.sinceClose += dt
    const t = a.sinceClose
    const fresh = Number.isFinite(t)
    const time = clock.elapsedTime + s.x

    // Squash-pop of the whole stall and a trailing awning wobble.
    const pop = fresh ? 0.05 * Math.sin(t * 16) * Math.exp(-t * 5) : 0
    rootRef.current?.scale.set(1 + pop, 1 - pop, 1 + pop)
    if (awning.current) awning.current.rotation.x = AWNING_TILT + (fresh ? 0.12 * Math.sin(t * 11 - 0.6) * Math.exp(-t * 3.5) : 0)

    // Chest lid eases open while the window is up, drops shut on close.
    a.lid += ((open ? CHEST_LID_OPEN : 0) - a.lid) * (1 - Math.exp(-dt * (open ? 9 : 6)))
    if (lid.current) lid.current.rotation.x = a.lid

    // Merchant idles with a small bob and look-around; hops and waves goodbye.
    const waving = open || (fresh && t < WAVE_S)
    a.arm += ((waving ? 1 : 0) - a.arm) * (1 - Math.exp(-dt * (waving ? 9 : 6)))
    if (merchant.current) {
      const hop = fresh && t < 0.5 ? Math.max(0, Math.sin(t * Math.PI * 2)) * 0.4 : 0
      merchant.current.position.y = Math.sin(time * 2.2) * 0.03 + hop
      merchant.current.rotation.y = Math.sin(time * 0.7) * 0.12 * (1 - a.arm)
    }
    if (arm.current) arm.current.rotation.z = -(0.05 + a.arm * (2.5 + Math.sin(time * 9) * 0.35))

    if (coinRef.current) {
      coinRef.current.rotation.y = time * 2
      coinRef.current.position.y = 1.65 + Math.sin(time * 3) * 0.05
    }

    // Coins arc out of the chest and fall back in, once per close.
    burst.current.forEach((coin, i) => {
      if (!coin) return
      const ct = t - i * 0.06
      const active = ct > 0 && ct < COIN_BURST_TIME
      coin.visible = active
      if (!active) return
      const [dx, vy] = COIN_BURST[i]
      const p = ct / COIN_BURST_TIME
      coin.position.set(dx * p, 0.5 + vy * 2.2 * ct - 5.5 * ct * ct, 0.25 * p)
      coin.rotation.set(ct * 9, ct * 6, 0)
    })
  })

  return (
    <group position={[s.x, 0, s.z]} rotation-y={s.facing}>
      <group ref={rootRef}>
        {/* counter + darker top */}
        <Block z={0.5} w={3.4} h={1.05} d={1.1} mat={counter} />
        <Block z={0.5} y={1.05} w={3.6} h={0.15} d={1.3} mat={MAT.woodDark} />
        {[[-1.7, -1.1], [1.7, -1.1], [-1.7, 1.05], [1.7, 1.05]].map(([x, z], i) => (
          <Block key={i} x={x} z={z} w={0.25} h={3.3} d={0.25} mat={MAT.wood} />
        ))}
        <Block z={-1.1} y={0} w={3.4} h={0.12} d={0.25} mat={MAT.wood} />
        <Awning color={s.color} dark={s.dark} awningRef={awning} />
        {s.npc && <Npc {...s.npc} position={[0, 0, -0.5]} rootRef={merchant} armRef={arm} />}
        {/* coin spinning on the counter */}
        <group ref={coinRef} position={[1.1, 1.65, 0.6]} scale={1.4}>
          <GoldCoin rotation={[Math.PI / 2, 0, 0]} />
        </group>
        {/* chest beside the counter, coins bursting from it */}
        <group position={[-2.5, 0, 1.4]} rotation-y={0.2}>
          <Chest lidRef={lid} />
          {COIN_BURST.map((_, i) => (
            <group key={i} ref={(el) => (burst.current[i] = el)} visible={false}>
              <GoldCoin />
            </group>
          ))}
        </group>
      </group>
      <Label position={[0, 4.4, 0.8]} height={2.2} lines={[{ text: s.label, size: 110, fill: s.color, stroke: '#0e1a05', line: 20 }]} />
      <Ring color={s.color} />
    </group>
  )
}

export default function Stalls() {
  return STALLS.map((s) => <Stall key={s.id} s={s} />)
}
