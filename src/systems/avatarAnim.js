// The avatar walk cycle. Framework-free: components/Player.jsx builds one of
// these alongside the built avatar and ticks it each frame.
//
// Two paths, preferring an animation the rig itself ships:
//   1. player.glb ships a clip matching GAIT.runClip -> drive it with an
//      AnimationMixer, cross-faded under an idle clip when present. This
//      rigs to the skeleton exactly because it was authored for it.
//   2. no such clip -> a generated four-bone swing on ArmL1/ArmR1/LegL1/
//      LegR1 plus a Spine1 lean and a body bob. Rotation-only, so it never
//      fights avatarLoader.js's applyProportions(), which owns those nodes'
//      position and scale.
//
// Everything here is null-safe: a missing bone or a total failure just
// leaves the avatar static, the same way a failed load leaves Player on the
// capsule. Ported verbatim from Age-every-click's systems/avatarAnim.js,
// which targets this same shared Bloxity base rig and already tuned GAIT
// against it.
import * as THREE from 'three'
import { GAIT } from '../data/bloxity.js'

// phase offset per limb: legs are half a cycle apart; each arm is
// anti-phase to the leg on its own side (contralateral swing).
const LIMBS = [
  { name: 'LegL1', kind: 'leg', offset: 0 },
  { name: 'LegR1', kind: 'leg', offset: Math.PI },
  { name: 'ArmL1', kind: 'arm', offset: Math.PI },
  { name: 'ArmR1', kind: 'arm', offset: 0 },
]

const AXES = {
  x: new THREE.Vector3(1, 0, 0),
  y: new THREE.Vector3(0, 1, 0),
  z: new THREE.Vector3(0, 0, 1),
}

// Build the gait driver for one freshly loaded avatar. `built` is
// `{ root, nodes, clips }` — see components/Player.jsx. Returns null when
// there is nothing to animate.
export function makeGait(built) {
  if (!built || !built.root) return null

  const gait = {
    built,
    axis: AXES[GAIT.swingAxis] || AXES.x,
    swayAxis: AXES[GAIT.swayAxis] || AXES.z,
    amp: 0, // eased 0..1 locomotion weight
    phase: 0, // radians along the stride
    idleTime: 0, // seconds, only advances while idle (drives the breathing sway)
    q: new THREE.Quaternion(), // scratch
    mixer: null,
    run: null,
    idle: null,
    limbs: [],
    spine: null,
    spineBind: null,
  }

  // Arm bones + bind poses, for the held-item pose (setHolding) on either path.
  const nodes0 = built.nodes || {}
  gait.holding = false
  gait.arms = ['ArmL1', 'ArmR1']
    .filter((n) => nodes0[n])
    .map((n) => ({ bone: nodes0[n], bind: nodes0[n].quaternion.clone() }))

  // --- Path 1: an embedded clip ------------------------------------------
  const run = (built.clips || []).find((c) => GAIT.runClip.test(c.name))
  if (run) {
    gait.mixer = new THREE.AnimationMixer(built.root)
    gait.run = gait.mixer.clipAction(run)
    gait.run.play()
    gait.run.setEffectiveWeight(0)

    const idle = built.clips.find((c) => GAIT.idleClip.test(c.name))
    if (idle) {
      gait.idle = gait.mixer.clipAction(idle)
      gait.idle.play()
    }
    return gait
  }

  // --- Path 2: the generated fallback ------------------------------------
  const nodes = built.nodes || {}
  for (const limb of LIMBS) {
    const bone = nodes[limb.name]
    if (bone) gait.limbs.push({ ...limb, bone, bind: bone.quaternion.clone() })
  }
  const spine = nodes.Spine1
  if (spine) {
    gait.spine = spine
    gait.spineBind = spine.quaternion.clone()
  }
  return gait
}

// Both arms straight up (a bit past vertical in the swing axis), holding an
// item overhead. Applied last in updateGait so it wins over walk/idle/airborne.
const HOLD_ARM = -3.0
const HOLD_ARM_FORWARD = -1.57 // arms straight out in front, for held food
// mode: false (none), true / 'up' (overhead poop), 'forward' (food) or
// 'both' (both arms out in front, angled in to meet at the selected
// inventory item; see bothHandsLayout).
export function setHolding(gait, mode) {
  if (gait) gait.holding = mode
}

// Two-handed grip: each arm points forward and yaws inward until the hands
// are HAND_GAP/2 either side of the centre line. Returns the inward yaw and
// the forward reach of the hands from the shoulder pivots (Spine2 frame), so
// heldItem.js can centre the item between them. Follows the shoulderWidth /
// armLength proportions because it reads the live node transforms.
const HAND_GAP = 1.9 // hand centres; arms are 0.64 wide, so a 1.3 block fits between
const ARM_LEN = 2.4
const _layout = { yaw: 0, y: 0, z: 0 } // reused; read before the next call
export function bothHandsLayout(nodes) {
  const off = nodes.ArmL_Offset
  const arm = nodes.ArmL1
  if (!off || !arm) return null
  const len = ARM_LEN * (arm.scale.y || 1)
  const yaw = Math.asin(Math.max(0, Math.min(0.95, (Math.abs(off.position.x) - HAND_GAP / 2) / len)))
  _layout.yaw = yaw
  _layout.y = off.position.y
  _layout.z = off.position.z + len * Math.cos(yaw)
  return _layout
}

const _qYaw = new THREE.Quaternion()
function applyHold(gait) {
  if (gait.holding === 'both') {
    const layout = bothHandsLayout(gait.built.nodes || {})
    const yaw = layout ? layout.yaw : 0
    for (const a of gait.arms) {
      // ArmR sits at -x: yawing it by +yaw swings the hand toward the centre.
      const side = a.bone.name === 'ArmR1' ? 1 : -1
      gait.q.setFromAxisAngle(gait.axis, HOLD_ARM_FORWARD)
      _qYaw.setFromAxisAngle(AXES.y, side * yaw)
      gait.q.premultiply(_qYaw)
      a.bone.quaternion.copy(a.bind).premultiply(gait.q)
    }
    return
  }
  gait.q.setFromAxisAngle(gait.axis, gait.holding === 'forward' ? HOLD_ARM_FORWARD : HOLD_ARM)
  for (const a of gait.arms) a.bone.quaternion.copy(a.bind).premultiply(gait.q)
}

// speed01: horizontal speed / max move speed. Values outside 0..1 are
// clamped. grounded (default true) gates the airborne pose below.
export function updateGait(gait, dt, speed01, grounded = true, bending = false, trainSpot = null, lifting = null) {
  if (!gait || dt <= 0) return
  tickGait(gait, dt, speed01, grounded)
  applyTraining(gait, dt, trainSpot && speed01 < 0.1 ? trainSpot : null)
  if (gait.holding) applyHold(gait)
  applyBend(gait, dt, bending)
  applyLift(gait, dt, lifting)
}

// Lifting a Lift gate. The player stands at the gate's face (liftGate.js moves
// them there) with both hands pressed flat against it, crouched and leaning in
// to push. progress 0..1 is the gate's health filled: the arms creep upward and
// strain with it. progress >= 1 is the throw: both arms fling overhead. Eased in
// from whatever walk/idle pose was set, applied last. Rotation-only on spine and
// arms, so it works on both paths.
const LIFT_PUSH_ARM = -1.5 // arms out in front, hands on the gate face
const LIFT_PUSH_ARM_END = -1.95 // hands sliding up the face as the gate rises
const LIFT_LEAN = 0.3
const ease01 = (t) => t * t * (3 - 2 * t)
const _qTarget = new THREE.Quaternion()
function applyLift(gait, dt, progress) {
  if (progress === null || progress === undefined) {
    gait.liftW = 0
    return
  }
  gait.liftW = Math.min(1, (gait.liftW || 0) + dt * 6)
  gait.liftT = (gait.liftT || 0) + dt
  const w = ease01(gait.liftW)
  const throwing = progress >= 1
  const fill = Math.min(1, progress)
  const strain = throwing ? 0 : 0.4 + 0.6 * fill
  const shake = Math.sin(gait.liftT * 42) * 0.035 * strain
  const arm = throwing ? HOLD_ARM : LIFT_PUSH_ARM + (LIFT_PUSH_ARM_END - LIFT_PUSH_ARM) * fill + shake
  gait.q.setFromAxisAngle(gait.axis, arm)
  for (const a of gait.arms) {
    _qTarget.copy(a.bind).premultiply(gait.q)
    a.bone.quaternion.slerp(_qTarget, w)
  }
  if (gait.spine) {
    const bind = gait.spineBind || (gait.spineBind = gait.spine.quaternion.clone())
    gait.q.setFromAxisAngle(AXES.x, throwing ? -0.18 : LIFT_LEAN + shake)
    _qTarget.copy(bind).premultiply(gait.q)
    gait.spine.quaternion.slerp(_qTarget, w)
  }
  const root = gait.built.root
  root.position.y = w * (throwing ? 0.04 : -0.15 + 0.02 * Math.sin(gait.liftT * 30) * strain)
}

// Bent-over pooping pose: the spine folds forward and the arms hang down. Eased in and
// out, applied last so it wins over walk/idle/hold. Spine-only, so it works on both paths.
const BEND_SPINE = 1.25
const BEND_ARM = 0.35
const BEND_HZ = 9
function applyBend(gait, dt, bending) {
  gait.bend = (gait.bend || 0) + ((bending ? 1 : 0) - (gait.bend || 0)) * (1 - Math.exp(-BEND_HZ * dt))
  if (gait.bend < 0.001) return
  const spine = gait.built.nodes && gait.built.nodes.Spine1
  if (spine) {
    const bind = gait.spineBind || (gait.spineBind = spine.quaternion.clone())
    gait.q.setFromAxisAngle(AXES.x, BEND_SPINE * gait.bend)
    spine.quaternion.copy(bind).premultiply(gait.q)
  }
  if (bending) {
    gait.q.setFromAxisAngle(gait.axis, BEND_ARM * gait.bend)
    for (const a of gait.arms) a.bone.quaternion.copy(a.bind).premultiply(gait.q)
  }
}

// Dumbbell workout on a training pad: a barbell held in both hands, the arms
// raising and lowering in turn. Eased in and out, applied after walk/idle so
// it wins on the arms; the bells exist only while it is active.
const TRAIN_HZ = 0.33 // one rep every ~3 s: it is a heavy bar
const TRAIN_EASE_HZ = 8
const CURL_LOW = -0.1
const CURL_HIGH = -1.4
const BAR_REACH = 3.6 // plate offset from the bar centre, rig units
const HAND_Y = -2.25 // hand centre down the arm bone, rig units
const HAND_Z = -0.4 // arm meshes sit 0.4 behind their shoulder pivot
let _barGeo = null
function barbellGeometry() {
  if (_barGeo) return _barGeo
  const plate = (x, r, h) => new THREE.CylinderGeometry(r, r, h, 14).rotateZ(Math.PI / 2).translate(x, 0, 0)
  _barGeo = [
    new THREE.CylinderGeometry(0.12, 0.12, 2 * BAR_REACH + 0.6, 8).rotateZ(Math.PI / 2),
    ...[-1, 1].flatMap((s) => [plate(s * 3.2, 0.9, 0.3), plate(s * 3.6, 0.72, 0.3)]),
  ]
  return _barGeo
}

function makeBarbell(color) {
  const g = new THREE.Group()
  const plateMat = new THREE.MeshStandardMaterial({ color, roughness: 0.5 })
  const barMat = new THREE.MeshStandardMaterial({ color: '#9aa0a8', roughness: 0.4, metalness: 0.5 })
  barbellGeometry().forEach((geo, i) => {
    const m = new THREE.Mesh(geo, i ? plateMat : barMat)
    m.castShadow = true
    g.add(m)
  })
  g.userData.plateMat = plateMat
  return g
}

function applyTraining(gait, dt, spot) {
  const target = spot ? 1 : 0
  gait.train = (gait.train || 0) + (target - (gait.train || 0)) * (1 - Math.exp(-TRAIN_EASE_HZ * dt))
  const w = gait.train
  if (w < 0.001) {
    if (gait.bar) gait.bar.visible = false
    return
  }
  const nodes = gait.built.nodes || {}
  const left = gait.arms.find((a) => a.bone.name === 'ArmL1')
  const pivot = nodes.ArmL_Offset // identity-rotation shoulder node: swings happen in its frame
  if (!left || !pivot) return
  if (!gait.bar) {
    gait.bar = makeBarbell('#ff9d00')
    pivot.add(gait.bar)
  }
  if (spot) {
    gait.trainPhase = (gait.trainPhase || 0) + TRAIN_HZ * 2 * Math.PI * dt
    gait.bar.userData.plateMat.color.set(spot.bell)
  }

  // Heavy rep: slow grind up, a shaking hold at the top, controlled lower, a
  // beat to reset. The body leans back and dips under the load.
  const u = ((gait.trainPhase || 0) / (2 * Math.PI)) % 1
  const ease = (t) => t * t * (3 - 2 * t)
  let lift
  if (u < 0.1) lift = 0
  else if (u < 0.5) lift = ease((u - 0.1) / 0.4)
  else if (u < 0.62) lift = 1
  else if (u < 0.95) lift = 1 - ease((u - 0.62) / 0.33)
  else lift = 0
  const strain = lift * (0.4 + 0.6 * Math.sin(Math.PI * Math.min(1, Math.max(0, (u - 0.1) / 0.52)))) // peaks near the top
  const shake = Math.sin((gait.trainPhase || 0) * 38) * 0.025 * strain
  const ang = (CURL_LOW + (CURL_HIGH - CURL_LOW) * lift + shake) * w
  gait.q.setFromAxisAngle(gait.axis, ang)
  for (const a of gait.arms) a.bone.quaternion.copy(a.bind).premultiply(gait.q)
  if (gait.spine) {
    gait.q.setFromAxisAngle(AXES.x, (-0.14 * lift + shake * 0.6) * w)
    gait.spine.quaternion.copy(gait.spineBind).premultiply(gait.q)
  }
  gait.built.root.position.y = -0.05 * strain * w

  // The bar rides the hands: rotate the hand point (down the arm) about the
  // shoulder by the swing angle, centred between the two shoulders.
  const len = -HAND_Y * (left.bone.scale.y || 1)
  const c = Math.cos(ang)
  const s = Math.sin(ang)
  gait.bar.visible = true
  gait.bar.position.set(-pivot.position.x, -len * c - HAND_Z * s, -len * s + HAND_Z * c)
}

function tickGait(gait, dt, speed01, grounded) {

  const target = speed01 < 0 ? 0 : speed01 > 1 ? 1 : speed01
  // Exponential ease so a start or stop does not snap mid-stride.
  gait.amp += (target - gait.amp) * (1 - Math.exp(-GAIT.blendHz * dt))
  // Advance the cycle; keep a little residual cadence so the legs finish the
  // step they are on rather than freezing.
  gait.phase += GAIT.strideHz * 2 * Math.PI * dt * (0.35 + 0.65 * gait.amp)
  if (gait.phase > Math.PI * 2) gait.phase -= Math.PI * 2

  if (gait.mixer) {
    if (gait.run) {
      gait.run.setEffectiveWeight(gait.amp)
      gait.run.timeScale = 0.4 + 0.9 * gait.amp
    }
    if (gait.idle) gait.idle.setEffectiveWeight(1 - gait.amp)
    gait.mixer.update(dt)
    return
  }

  // Airborne (jumping or falling): tuck the legs, throw the arms up. Takes
  // priority over the walk cycle and the idle sway below.
  if (!grounded) {
    for (const limb of gait.limbs) {
      let angle = 0
      if (limb.name === 'LegL1') angle = GAIT.airborneLegL
      else if (limb.name === 'LegR1') angle = GAIT.airborneLegR
      else if (limb.kind === 'arm') angle = GAIT.airborneArm
      gait.q.setFromAxisAngle(gait.axis, angle)
      limb.bone.quaternion.copy(limb.bind).premultiply(gait.q)
    }
    if (gait.spine) {
      gait.q.setFromAxisAngle(AXES.x, GAIT.airborneLean)
      gait.spine.quaternion.copy(gait.spineBind).premultiply(gait.q)
    }
    gait.built.root.position.y = 0
    return
  }

  // Below the ease-out floor: a slow breathing sway instead of a rigid hold.
  if (gait.amp < 0.01) {
    gait.idleTime += dt
    const idle = Math.sin(gait.idleTime * GAIT.idleSwayHz)
    for (const limb of gait.limbs) {
      if (limb.kind !== 'arm') {
        limb.bone.quaternion.copy(limb.bind)
        continue
      }
      const sign = limb.name === 'ArmL1' ? -1 : 1
      gait.q.setFromAxisAngle(gait.swayAxis, sign * (GAIT.idleArmSway + idle * GAIT.idleArmSwayAmp))
      limb.bone.quaternion.copy(limb.bind).premultiply(gait.q)
    }
    if (gait.spine) {
      gait.q.setFromAxisAngle(AXES.x, idle * GAIT.idleSpineSway)
      gait.spine.quaternion.copy(gait.spineBind).premultiply(gait.q)
    }
    gait.built.root.position.y = idle * GAIT.idleBob
    return
  }

  for (const limb of gait.limbs) {
    const swing = (limb.kind === 'arm' ? GAIT.armSwing : GAIT.legSwing) * gait.amp
    gait.q.setFromAxisAngle(gait.axis, Math.sin(gait.phase + limb.offset) * swing)
    // Parent-space swing (premultiply): the *_Offset parents carry position
    // only (identity rotation), so parent space is the character's own
    // frame and X is the forward/back flexion axis regardless of how each
    // mirrored limb bone's local frame is twisted.
    limb.bone.quaternion.copy(limb.bind).premultiply(gait.q)
  }
  if (gait.spine) {
    gait.q.setFromAxisAngle(AXES.x, GAIT.lean * gait.amp)
    gait.spine.quaternion.copy(gait.spineBind).premultiply(gait.q)
  }
  // Body bob: two beats per stride. Only local Y is ours to touch — X/Z/Y
  // world placement belongs to Player's group.
  gait.built.root.position.y = Math.abs(Math.sin(gait.phase)) * GAIT.bob * gait.amp
}

// Return the rig to its bind pose. Call before the avatar itself is torn
// down, while the nodes are still live.
export function disposeGait(gait) {
  if (!gait) return
  if (gait.mixer) {
    gait.mixer.stopAllAction()
    gait.mixer.uncacheRoot(gait.built.root)
  }
  if (gait.bar && gait.bar.parent) gait.bar.parent.remove(gait.bar)
  for (const limb of gait.limbs) limb.bone.quaternion.copy(limb.bind)
  if (gait.spine) gait.spine.quaternion.copy(gait.spineBind)
  if (gait.built && gait.built.root) gait.built.root.position.y = 0
}
