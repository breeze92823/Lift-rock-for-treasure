// Lift Pad -> gate sequence. Standing still on a zone's pad lifts its gate: once
// per LIFT_TICK seconds the player gains STRENGTH_PER_CLICK strength (like a
// click) and the gate's health bar fills by the player's current strength. When
// the bar is full the gate is thrown into the sky for THROW_TIME seconds and
// disappears for good. Walking off the pad pauses (progress is kept). The lift
// pose is driven by player.lifting (see avatarAnim.js). Framework-free;
// components/world/LiftTower.jsx reads liftState to animate the gate,
// terrainHeight.js reads clearedGates.
import { ARENA, DRAIN, LIFT, LIFT_ZONES } from '../data/world.js'
import { STRENGTH_PER_CLICK } from '../data/actionPopups.js'
import { useGameStore } from '../store/useGameStore.js'
import { gainStrength } from './strengthGain.js'
import { inputState } from './input.js'
import { player } from './playerState.js'
import { startLiftLoop, stopLiftLoop, playThrowRock } from './sfx.js'

export const LIFT_TICK = 1 // s between strength gains / health fills
export const THROW_AT = 0.9 // fraction of the bar that arms the throw
export const FULL_HOLD_TIME = 1 // s between passing THROW_AT and the gate being thrown
export const THROW_TIME = 1.6 // s the gate spends flying off
const STAND_GAP = 0.7 // m from the gate face to the player's centre: arm's reach, so both hands rest on it
const STAND_RATE = 12 // 1/s, how fast the player slides into place at the gate
const THROW_POSE_TIME = 0.7 // s the player keeps their arms thrown up after the gate flies

// gates[luck] = { phase: 'lifting' | 'idle' | 'thrown' | 'gone', t: seconds in phase,
//                 hp: health filled so far, max: health needed }
export const liftState = { active: null, gates: {} }
// Gates no longer in the way; their colliders are skipped.
export const clearedGates = new Set()

const padHalf = LIFT.width / 2 - DRAIN.width
let acc = 0
let throwPose = 0 // s left of the arms-up throw pose

function padUnderPlayer() {
  const p = player.position
  if (!player.grounded || Math.abs(p.x - LIFT.x) > padHalf) return null
  return LIFT_ZONES.find((zn) => !clearedGates.has(zn.luck) && p.z <= zn.zFrom && p.z >= zn.zFrom - LIFT.entryLen) || null
}

function gateFor(zn) {
  return liftState.gates[zn.luck] || (liftState.gates[zn.luck] = { phase: 'idle', t: 0, hp: 0, max: zn.hp })
}

function stopLifting() {
  const g = liftState.active && liftState.gates[liftState.active]
  if (g && g.phase === 'lifting') g.phase = 'idle'
  liftState.active = null
  player.lifting = null
  acc = 0
  throwPose = 0
  stopLiftLoop()
}

// Callbacks run when the player walks back from the corridor into the hub and
// the gates reset (loot.js restores the loot here).
export const hubResetListeners = []
let wasInCorridor = false

export function stepLift(dt) {
  const inCorridor = player.position.z < ARENA.minZ
  if (wasInCorridor && !inCorridor) {
    resetLift()
    hubResetListeners.forEach((fn) => fn())
  }
  wasInCorridor = inCorridor

  // Gates already in flight finish regardless of the player.
  for (const key in liftState.gates) {
    const g = liftState.gates[key]
    if (g.phase !== 'thrown') continue
    g.t += dt
    if (g.t >= THROW_TIME) g.phase = 'gone'
  }

  const zn = padUnderPlayer()
  const moving = inputState.move.x !== 0 || inputState.move.z !== 0
  if (throwPose > 0) {
    throwPose -= dt
    if (moving || throwPose <= 0) {
      throwPose = 0
      player.lifting = null
    }
  }
  if (!zn || moving) {
    if (liftState.active) stopLifting()
    return
  }

  const g = gateFor(zn)
  if (liftState.active !== zn.luck) {
    stopLifting()
    liftState.active = zn.luck
    g.phase = 'lifting'
    g.t = 0
    startLiftLoop()
  }
  g.t += dt
  player.facing = Math.PI // face north, toward the gate
  player.velocity.x = 0
  player.velocity.z = 0
  // Slide up to the gate so the hands touch its face.
  player.position.z += (zn.gate.zS + STAND_GAP - player.position.z) * Math.min(1, STAND_RATE * dt)
  player.lifting = g.hp / g.max

  // Strength already meets the gate's requirement: throw it right away.
  const strongEnough = useGameStore.getState().strength >= g.max
  if (strongEnough || g.hp >= g.max * THROW_AT) {
    // Past THROW_AT: keep lifting (bar keeps filling) for FULL_HOLD_TIME, then throw.
    if (!g.fullT) playThrowRock() // sound leads the throw by FULL_HOLD_TIME
    g.fullT = (g.fullT || 0) + dt
    if (strongEnough || g.fullT >= FULL_HOLD_TIME) {
      g.hp = g.max
      g.phase = 'thrown'
      g.t = 0
      clearedGates.add(zn.luck)
      stopLifting()
      player.lifting = 1 // arms fling overhead
      throwPose = THROW_POSE_TIME
      return
    }
  }

  acc += dt
  while (acc >= LIFT_TICK && g.hp < g.max) {
    acc -= LIFT_TICK
    g.hp = Math.min(g.max, g.hp + Math.max(1, useGameStore.getState().strength))
    gainStrength(STRENGTH_PER_CLICK)
  }
  if (g.phase === 'lifting') player.lifting = g.hp / g.max
}

// Put every gate back, e.g. on respawn.
export function resetLift() {
  liftState.active = null
  liftState.gates = {}
  clearedGates.clear()
  player.lifting = null
  acc = 0
  throwPose = 0
  stopLiftLoop()
}
