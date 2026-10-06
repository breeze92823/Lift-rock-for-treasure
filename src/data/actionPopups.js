// Strength-gain popup tunables. Every click adds STRENGTH_PER_CLICK strength and
// spawns one "+N" popup (Arm icon) near the player: it springs in with an
// elastic pop, then sweeps down toward the bottom-middle of the screen and
// fades. Simulated by systems/actionPopups.js, drawn by
// components/hud/ActionPopups.jsx.

export const STRENGTH_PER_CLICK = 1
export const TRAINING_TICK = 1 // seconds between gains while standing on a training pad (STRENGTH_PER_CLICK x pad power)

export const ACTION_POPUP_POOL_SIZE = 14
export const ACTION_POPUP_LIFETIME = 0.95 // seconds, spawn to gone
export const ACTION_POPUP_FADE_IN = 0.09

// Pop-in flourish (fractions of lifetime / normalized viewport units).
export const ACTION_POPUP_POP_T = 0.24
export const ACTION_POPUP_POP_SCALE_FROM = 0.25
export const ACTION_POPUP_POP_OVERSHOOT = 2.4
export const ACTION_POPUP_HOP = 0.05
export const ACTION_POPUP_FADE_OUT_START = 0.55

// Player anchor raised this many metres so popups appear around the torso.
export const ACTION_POPUP_ANCHOR_HEIGHT = 1.3

// Random scatter at spawn, normalized viewport units (viewport spans 2x2).
export const ACTION_POPUP_SPREAD_X = 0.16
export const ACTION_POPUP_SPREAD_Y = 0.12

// Travel: landing NDC Y (-1 = bottom edge) and fraction of the gap to screen
// centre that is closed.
export const ACTION_POPUP_TARGET_Y = -0.95
export const ACTION_POPUP_CENTER_PULL = 0.7

// CSS pixels.
export const ACTION_POPUP_ICON_SIZE = 72
export const ACTION_POPUP_FONT_SIZE = 40

// Pop sound played with each popup (real file in public/audio).
export const STRENGTH_POP_SOUND_URL = '/audio/power_gain.mp3'
export const STRENGTH_POP_GAIN = 0.135 // 0..1, on top of the master volume

// Looping lift sound while heaving a gate: only the first LIFT_LOOP_SECONDS of the file
// are used, looped seamlessly, and peak-normalized so LIFT_LOOP_GAIN is its true level.
export const LIFT_LOOP_SOUND_URL = '/audio/lift_rock_2.mp3'
export const LIFT_LOOP_SECONDS = 3
export const LIFT_LOOP_CROSSFADE_S = 0.08 // equal-power blend of the loop's tail into its head
export const LIFT_LOOP_PEAK = 0.9 // normalize the clip's peak to this before gain
export const LIFT_LOOP_GAIN = 0.16 // 0..1, on top of the master volume (pop is 0.135)
export const LIFT_LOOP_FADE_IN_S = 0.1
export const LIFT_LOOP_FADE_OUT_S = 0.15

// One-shot when a gate is thrown into the sky; peak-normalized, then scaled by THROW_ROCK_GAIN.
export const THROW_ROCK_SOUND_URL = '/audio/throw_rock.mp3'
export const THROW_ROCK_PEAK = 0.9
export const THROW_ROCK_GAIN = 0.22 // 0..1, on top of the master volume

// Cash register one-shot when the offline earnings are claimed; trimmed to CASH_MAX_SECONDS,
// peak-normalized, then scaled by CASH_GAIN.
export const CASH_SOUND_URL = '/audio/cash.mp3'
export const CASH_PEAK = 0.9
export const CASH_MAX_SECONDS = 1.5
export const CASH_FADE_OUT_S = 0.15
export const CASH_GAIN = 0.2 // 0..1, on top of the master volume (throw is 0.22, pop 0.135)
