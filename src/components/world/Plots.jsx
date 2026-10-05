import { useMemo, useRef } from 'react'
import { AdditiveBlending, DoubleSide } from 'three'
import { canvasTexture } from '../../utils/textures.js'
import { useFrame } from '@react-three/fiber'
import { PLOT, PLOTS, PLOT_SLOT, PLOT_ROW_Z, HOME_SLOTS, plotSlotsAt, plotSlotXs as slotXs } from '../../data/world.js'
import { MAT, plastic } from '../../materials/world.js'
import { homeIconTexture, luckTextTexture, baseUpgradeSignTexture } from '../../utils/labels.js'
import { useGameStore } from '../../store/useGameStore.js'
import { useRemoteStore } from '../../store/useRemoteStore.js'
import { Block, Label } from './parts.jsx'
import { MODELS, GenericItem, RARITY, RARITY_FALLBACK } from './LootItems.jsx'
import { ITEM_LUCK, luckBonus } from '../../data/loot.js'

const SLOT = PLOT_SLOT.size
const UPPER_Y = 6
const CARPET_D = 5
const PEDESTAL_H = 0.65 // raised treasure slots on the home plot's ground floor

// Grey studded deck with the red carpet runner and two rows of dark
// treasure slots, at height y.
function Deck({ cx, z, y, pedestals = false }) {
  const rowZ = PLOT_ROW_Z
  return (
    <group>
      <Block x={cx} z={z} y={y + PLOT.h} w={PLOT.width - 1} h={0.05} d={CARPET_D} mat={MAT.carpet} />
      {[-1, 1].map((s) => (
        <Block key={s} x={cx} z={z + s * (CARPET_D / 2 + 0.15)} y={y + PLOT.h} w={PLOT.width - 1} h={0.07} d={0.3} mat={MAT.carpetEdge} shadow={false} />
      ))}
      {[-1, 1].map((s) =>
        slotXs(cx).map((x) =>
          pedestals ? (
            <group key={`${s}${x}`}>
              <Block x={x} z={z + s * rowZ} y={y + PLOT.h} w={SLOT - 0.3} h={PEDESTAL_H - 0.25} d={SLOT - 0.3} mat={plastic('#6d7480')} />
              <Block x={x} z={z + s * rowZ} y={y + PLOT.h + PEDESTAL_H - 0.25} w={SLOT} h={0.25} d={SLOT} mat={MAT.slot} />
            </group>
          ) : (
            <Block key={`${s}${x}`} x={x} z={z + s * rowZ} y={y + PLOT.h} w={SLOT} h={0.45} d={SLOT} mat={MAT.slot} />
          ),
        ),
      )}
    </group>
  )
}

function Ladder({ x, z, h, rot }) {
  const rungs = Math.floor(h / 0.5)
  return (
    <group position={[x, 0, z]} rotation-y={rot}>
      {[-0.45, 0.45].map((s) => (
        <Block key={s} x={s} w={0.15} h={h} d={0.15} mat={MAT.wood} />
      ))}
      {Array.from({ length: rungs }, (_, i) => (
        <Block key={i} y={0.3 + i * 0.5} w={0.9} h={0.1} d={0.12} mat={MAT.woodDark} shadow={false} />
      ))}
    </group>
  )
}

// Hovering, slowly spinning wrapper (same motion as the loot on the lift floors).
function Floating({ i, children }) {
  const ref = useRef()
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    if (!ref.current) return
    ref.current.position.y = 0.9 + Math.sin(t * 1.8 + i) * 0.15
    ref.current.rotation.y = t * 0.8 + i * 1.3
  })
  return (
    <group ref={ref} position={[0, 0.9, 0]} scale={0.85}>
      {children}
    </group>
  )
}

// Items the player has placed on the home plot's ground-floor slots.
function PlacedItems({ plot, placed }) {
  const slots = useMemo(() => plotSlotsAt(plot), [plot])
  return Object.entries(placed).map(([i, it]) => {
    const Model = MODELS[it.name] || GenericItem
    const { x, z } = slots[i]
    const { fill } = RARITY[it.rarity] || RARITY_FALLBACK
    return (
      <group key={i} position={[x, PLOT.h + PEDESTAL_H, z]}>
        <Floating i={+i}>
          <Model />
        </Floating>
        <Label
          position={[0, 3.2, 0]}
          height={1.1}
          lines={[
            { text: it.name, size: 64 },
            { text: it.rarity, size: 34, fill, line: 5 },
            { text: `+${ITEM_LUCK[it.name] ?? 0}% Luck`, size: 58, fill: '#4dff3a', stroke: '#0b3a00' },
          ]}
        />
      </group>
    )
  })
}

// Soft vertical fade (opaque at the top of the cone, clear at the bottom).
const beamTexture = () =>
  canvasTexture('light-beam', 4, 128, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, 0, h)
    g.addColorStop(0, 'rgba(160,225,255,0.55)')
    g.addColorStop(1, 'rgba(160,225,255,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, w, h)
  })

// Enclosed ground-floor hall under the home plot's second storey: blue
// checkered back wall, orange pillars, a smooth ceiling with round cyan lights.
function GroundHall({ cx, z, side }) {
  const w = PLOT.width
  const d = PLOT.depth
  const hgt = UPPER_Y - PLOT.h
  const backX = cx + side * (w / 2 - 0.15)
  const lightXs = [-0.4, -0.24, -0.08, 0.08, 0.24, 0.4].map((f) => cx + f * w)
  const lightZs = [-d * 0.3, d * 0.3]
  return (
    <group>
      <Block x={backX} z={z} y={PLOT.h} w={0.3} h={hgt} d={d} mat={MAT.wall} />
      {/* thick black studded frame around the hall: top + bottom beams, front corner posts */}
      <Block x={cx - side * (w / 2 - 0.45)} z={z} y={UPPER_Y - 0.9} w={0.9} h={0.9} d={d} mat={MAT.liftPad} />
      <Block x={cx - side * (w / 2 - 0.45)} z={z} y={PLOT.h} w={0.9} h={0.6} d={d} mat={MAT.liftPad} />
      {[-1, 1].map((s) => (
        <group key={`f${s}`}>
          <Block x={cx} z={z + s * (d / 2 - 0.45)} y={UPPER_Y - 0.9} w={w} h={0.9} d={0.9} mat={MAT.liftPad} />
          <Block x={cx} z={z + s * (d / 2 - 0.45)} y={PLOT.h} w={w} h={0.6} d={0.9} mat={MAT.liftPad} />
        </group>
      ))}
      {[-1, 1].map((s) => (
        <Block key={s} x={cx + side * (w / 2 - 1.2)} z={z + s * 5.5} y={PLOT.h} w={1} h={hgt} d={1} mat={plastic('#b5663f')} />
      ))}
      <mesh position={[cx, UPPER_Y - 0.01, z]} rotation-x={Math.PI / 2}>
        <planeGeometry args={[w, d]} />
        <meshBasicMaterial color="#8da3c4" toneMapped={false} />
      </mesh>
      {lightXs.map((x) =>
        lightZs.map((lz) => (
          <group key={`${x}${lz}`} position={[x, UPPER_Y - 0.04, z + lz]} rotation-x={Math.PI / 2}>
            <mesh>
              <circleGeometry args={[1.25, 32]} />
              <meshBasicMaterial color="#2fc0ff" toneMapped={false} />
            </mesh>
            {/* visible light cone shining down from the fixture (group is rotated, so local -z is up) */}
            <mesh position-z={1.7} rotation-x={-Math.PI / 2}>
              <cylinderGeometry args={[1.25, 2.6, 3.4, 32, 1, true]} />
              <meshBasicMaterial map={beamTexture()} transparent blending={AdditiveBlending} depthWrite={false} side={DoubleSide} toneMapped={false} />
            </mesh>
            <mesh position-z={-0.01}>
              <circleGeometry args={[0.8, 32]} />
              <meshBasicMaterial color="#e6faff" toneMapped={false} />
            </mesh>
          </group>
        )),
      )}
      {[-0.25, 0.25].map((f) =>
        lightZs.map((lz) => <pointLight key={`${f}${lz}`} position={[cx + f * w, UPPER_Y - 0.8, z + lz]} color="#bfe9ff" intensity={70} distance={18} decay={2} />),
      )}
    </group>
  )
}

// Total luck of everything placed on the home slots, and the signs at the
// carpet entrance: "Base Upgrade" board and the "Luck: +N%" readout.
function HomeSigns({ cx, z, side }) {
  const placed = useGameStore((s) => s.plotSlots)
  const items = Object.values(placed)
  const luck = luckBonus(placed)
  const { map: luckMap, aspect } = useMemo(() => luckTextTexture(luck), [luck])
  const signMap = useMemo(() => baseUpgradeSignTexture(items.length, HOME_SLOTS.length), [items.length])
  const x = cx - side * (PLOT.width / 2 - 1.2) // just inside the plot, at the carpet entrance
  const facing = side < 0 ? Math.PI / 2 : -Math.PI / 2
  return (
    <group>
      <group position={[x, PLOT.h, z - 5.5]} rotation-y={facing}>
        <Block x={0} w={0.4} h={1.6} d={0.4} mat={plastic('#3b5f8c')} />
        <mesh position={[0, 2.5, 0]} material={plastic('#2f4f78')} castShadow>
          <boxGeometry args={[4.2, 2.1, 0.25]} />
        </mesh>
        <mesh position={[0, 2.5, 0.14]}>
          <planeGeometry args={[4, 1.875]} />
          <meshBasicMaterial map={signMap} transparent toneMapped={false} />
        </mesh>
      </group>
      <sprite position={[x, PLOT.h + 1.8, z + 5.5]} scale={[1.5 * aspect, 1.5, 1]} renderOrder={2}>
        <spriteMaterial map={luckMap} transparent depthWrite={false} toneMapped={false} />
      </sprite>
    </group>
  )
}

// The player's own plot gets a second storey on posts, a ladder, a railing
// (ground-floor slots are left empty for now).
function UpperStorey({ cx, z, side }) {
  const w = PLOT.width
  const d = PLOT.depth
  const icon = useMemo(() => homeIconTexture(), [])
  const posts = [-w / 2 + 0.45, w / 2 - 0.45]
  const outerX = cx + side * (w / 2)
  return (
    <group>
      <Block x={cx} z={z} y={UPPER_Y} w={w} h={PLOT.h} d={d} mat={MAT.plot} />
      <Deck cx={cx} z={z} y={UPPER_Y} />
      {[-1, 1].map((s) =>
        posts.map((px) => <Block key={`${s}${px}`} x={cx + px} z={z + s * (d / 2 - 0.45)} y={PLOT.h} w={0.9} h={UPPER_Y - PLOT.h} d={0.9} mat={MAT.liftPad} />),
      )}
      {/* railing */}
      {[-1, 1].map((s) => (
        <Block key={`r${s}`} x={cx} z={z + s * (d / 2 - 0.1)} y={UPPER_Y + 1.3} w={w} h={0.15} d={0.15} mat={MAT.post} shadow={false} />
      ))}
      <Block x={outerX - side * 0.1} z={z} y={UPPER_Y + 1.3} w={0.15} h={0.15} d={d} mat={MAT.post} shadow={false} />
      {[-1, 1].map((s) =>
        posts.map((px) => <Block key={`rp${s}${px}`} x={cx + px} z={z + s * (d / 2 - 0.1)} y={UPPER_Y + PLOT.h} w={0.15} h={1.1} d={0.15} mat={MAT.post} shadow={false} />),
      )}
      <Ladder x={outerX + side * 0.2} z={z + d / 2 - 3.5} h={UPPER_Y + 1.2} rot={Math.PI / 2} />
      <sprite position={[cx - side * (w / 2 - 1), UPPER_Y + 3.4, z]} scale={[2.4, 2.4, 1]}>
        <spriteMaterial map={icon} transparent depthWrite={false} toneMapped={false} />
      </sprite>
    </group>
  )
}

// South plots either side of the chevron path.
export default function Plots() {
  const homePlot = useGameStore((s) => s.homePlot)
  const homeSlots = useGameStore((s) => s.plotSlots)
  const remotePlots = useRemoteStore((s) => s.plots)
  return PLOTS.map((p, i) => {
    const remote = i !== homePlot ? remotePlots[i] : null
    const cx = p.side * (PLOT.inner + PLOT.width / 2)
    return (
      <group key={i}>
        <Block x={cx} z={p.z} w={PLOT.width} h={PLOT.h} d={PLOT.depth} mat={MAT.plot} />
        <Deck cx={cx} z={p.z} y={0} pedestals={i === homePlot || !!remote} />
        {i === homePlot && <UpperStorey cx={cx} z={p.z} side={p.side} />}
        {i === homePlot && <PlacedItems plot={i} placed={homeSlots} />}
        {remote && <PlacedItems plot={i} placed={remote.slots} />}
        {i === homePlot && <GroundHall cx={cx} z={p.z} side={p.side} />}
        {i === homePlot && <HomeSigns cx={cx} z={p.z} side={p.side} />}
      </group>
    )
  })
}
