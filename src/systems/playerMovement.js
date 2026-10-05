import { padUnlocked } from './rebirth.js'
import { plotStyled } from './plotStyle.js'
import { showActionResult } from './actionResult.js'
import { inputState } from './input.js'
import { player, resetPlayer } from './playerState.js'
import { getYaw, syncYawToPlayer } from './cameraOrbit.js'
import { terrainHeightAt } from './terrainHeight.js'
import { stepLift } from './liftGate.js'
import { useGameStore } from '../store/useGameStore.js'
import { LADDERS, LIFT_DRAINS, PLAYER_MOVE_SPEED, SPAWN, SPAWN_FACING, TRAINING, TRAINING_SPOTS, WORLD_BOUNDS } from '../data/world.js'

// Kinematic capsule, stepped once per frame: apply input -> gravity ->
// integrate -> keep on the ground slab -> clamp to the ground height under
// the player's feet.
const ACCEL = 45 // m/s^2 approach toward target velocity
const GRAVITY = -22 // m/s^2
const JUMP_SPEED = 7.5 // m/s
const MAX_STEP = 0.65 // m the player can step up without jumping

// Clamps the (dx, dz) delta as one 2D vector so velocity curves straight
// toward the target instead of warping axis-by-axis.
function approach2D(v, targetX, targetZ, maxDelta) {
  const dx = targetX - v.x
  const dz = targetZ - v.z
  const dist = Math.hypot(dx, dz)
  if (dist <= maxDelta || dist === 0) {
    v.x = targetX
    v.z = targetZ
  } else {
    const scale = maxDelta / dist
    v.x += dx * scale
    v.z += dz * scale
  }
}

let lockedPad = null // locked training pad the player is standing on (message shows once per entry)

// Ladder climbing: walk into a plot's front ladder (from the path, or from the deck edge to go
// down) to grab it; forward/back moves up/down, jump lets go.
const CLIMB_SPEED = 3.5 // m/s
const GRAB_REACH = 1.1 // m in front of the ladder, along the player's approach
const GRAB_HALF_W = 0.8 // m either side of the ladder's centre line
let climbing = null // the LADDERS entry being climbed

const ladderIsLive = (i) => plotStyled(i)

function findLadderToGrab(p, wishX) {
  for (let i = 0; i < LADDERS.length; i++) {
    const l = LADDERS[i]
    if (!ladderIsLive(i) || Math.abs(p.z - l.z) > GRAB_HALF_W) continue
    const inward = (p.x - l.x) * l.side // > 0: further into the plot than the ladder
    if (p.y < 1 && inward < 0 && inward > -GRAB_REACH && wishX * l.side > 0.3) return l // from the path, going up
    if (p.y > l.top - 0.5 && inward > 0 && inward < GRAB_REACH + 0.5 && wishX * l.side < -0.3) return l // from the deck, going down
  }
  return null
}

// Returns true while the player is on the ladder (the caller skips normal movement).
function stepClimb(dt, p, wishX) {
  if (!climbing) {
    if (!player.grounded && p.y < 1) return false
    const l = findLadderToGrab(p, wishX)
    if (!l) return false
    climbing = l
    p.x = l.x - l.side * 0.45 // on the path side of the rungs
    if (p.y > l.top - 0.5) p.y = l.top - 0.2 // going down: swing over the edge
    player.velocity.x = player.velocity.z = player.velocity.y = 0
  }
  const l = climbing
  if (Math.abs(p.x - (l.x - l.side * 0.45)) > 0.5 || Math.abs(p.z - l.z) > GRAB_HALF_W + 0.5) { // teleported away (Spawn / Home)
    climbing = null
    return false
  }
  if (inputState.jump) { // let go: hop back toward the path
    inputState.jump = false
    climbing = null
    p.x = l.x - l.side * 0.6
    player.velocity.y = 3
    return false
  }
  // Heading toward the plot (the ladder, from the path) climbs, heading away descends. Judged
  // from the actual wish direction so it works whichever way the camera faces.
  const toward = wishX * l.side
  const dir = toward > 0.2 ? 1 : toward < -0.2 ? -1 : 0
  p.y += dir * CLIMB_SPEED * dt
  player.velocity.x = player.velocity.z = player.velocity.y = 0
  player.grounded = false
  if (p.y >= l.top) { // over the top: step onto the deck
    p.y = l.top
    p.x = l.edgeX + l.side * 0.8
    climbing = null
    player.grounded = true
  } else if (dir < 0 && p.y <= terrainHeightAt(p.x, p.z)) { // back at the bottom
    p.y = terrainHeightAt(p.x, p.z)
    climbing = null
    player.grounded = true
  }
  return true
}

export function step(dt) {
  if (dt <= 0) return

  // Camera-relative ground basis.
  const yaw = getYaw()
  const fwdX = -Math.sin(yaw)
  const fwdZ = -Math.cos(yaw)
  const rightX = Math.cos(yaw)
  const rightZ = -Math.sin(yaw)

  const mv = inputState.move
  // Keyboard is a unit vector; the touch stick is analog (magnitude 0..1).
  const len = Math.hypot(mv.x, mv.z)
  const scale = len > 1 ? 1 / len : 1
  const wishX = (fwdX * mv.z + rightX * mv.x) * scale
  const wishZ = (fwdZ * mv.z + rightZ * mv.x) * scale

  if (!(player.lifting != null || player.training != null) && stepClimb(dt, player.position, wishX)) {
    stepLift(dt)
    return
  }

  approach2D(player.velocity, wishX * player.moveSpeed, wishZ * player.moveSpeed, ACCEL * dt)

  // Jump reads last frame's grounded flag, then we clear it for this frame.
  if (inputState.jump) {
    if (player.grounded) player.velocity.y = JUMP_SPEED
    inputState.jump = false
  }
  player.grounded = false

  const p = player.position
  player.velocity.y += GRAVITY * dt
  const prevX = p.x
  const prevZ = p.z
  p.x += player.velocity.x * dt
  p.y += player.velocity.y * dt
  p.z += player.velocity.z * dt

  // Invisible wall at the edge of the world.
  const r = player.dims.radius
  p.x = Math.max(WORLD_BOUNDS.minX + r, Math.min(WORLD_BOUNDS.maxX - r, p.x))
  p.z = Math.max(WORLD_BOUNDS.minZ + r, Math.min(WORLD_BOUNDS.maxZ - r, p.z))

  // Too tall a ledge to step onto: stay put unless the player jumps high enough.
  // Try each axis on its own first so the player slides along walls.
  if (terrainHeightAt(p.x, p.z, p.y) > p.y + MAX_STEP) {
    if (terrainHeightAt(p.x, prevZ, p.y) <= p.y + MAX_STEP) {
      p.z = prevZ
      player.velocity.z = 0
    } else if (terrainHeightAt(prevX, p.z, p.y) <= p.y + MAX_STEP) {
      p.x = prevX
      player.velocity.x = 0
    } else {
      p.x = prevX
      p.z = prevZ
    }
  }

  const groundY = terrainHeightAt(p.x, p.z, p.y)
  if (p.y <= groundY) {
    p.y = groundY
    if (player.velocity.y < 0) player.velocity.y = 0
    player.grounded = true
  }

  // Fell into a drainage channel beside the Lift corridor: the player dies and respawns.
  if (player.grounded) {
    for (const d of LIFT_DRAINS) {
      if (p.x >= d.x0 && p.x <= d.x1 && p.z >= d.z0 && p.z <= d.z1 && p.y <= d.floor + 0.01) {
        resetPlayer(SPAWN, SPAWN_FACING)
        syncYawToPlayer()
        showActionResult('You fell into the channel!', false)
        return
      }
    }
  }

  // Standing on a training pad's rim: the avatar picks up the dumbbells.
  player.training = null
  let onLocked = null
  if (player.grounded) {
    const reach = TRAINING.pad / 2 - 0.1
    for (const s of TRAINING_SPOTS) {
      const inside = Math.abs(p.x - s.x) < reach && Math.abs(p.z - s.z) < reach && p.y > s.top - 0.1
      if (inside && !padUnlocked(s.req)) { // locked until the required rebirth
        onLocked = s
        break
      }
      if (Math.abs(p.x - s.x) < reach && Math.abs(p.z - s.z) < reach && p.y > s.top - 0.1) {
        player.training = s
        break
      }
    }
  }

  if (onLocked !== lockedPad && onLocked) showActionResult(`Requires Rebirth ${onLocked.req.n} to unlock!`, false)
  lockedPad = onLocked

  stepLift(dt)

  // Face the direction of travel.
  if (Math.hypot(wishX, wishZ) > 0.01 && (mv.x !== 0 || mv.z !== 0)) {
    player.facing = Math.atan2(wishX, wishZ)
  }
}
