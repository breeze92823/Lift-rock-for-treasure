// UI sound effects for the E-interaction flow. Synthesized once via
// OfflineAudioContext (data/interact.js tunables, no asset files), cached, then
// played through audio.js's master bus so the portal's master volume applies.
import { unlock, getMasterBus } from './audio.js'
import {
  CONFIRM_POP_GAIN,
  CONFIRM_POP_SYNTH_NOTES_HZ,
  CONFIRM_POP_SYNTH_NOTE_GAP_S,
  CONFIRM_POP_SYNTH_ATTACK_S,
  CONFIRM_POP_SYNTH_DECAY_S,
  BUTTON_CLICK_GAIN,
  BUTTON_CLICK_SYNTH_FREQ_HZ,
  BUTTON_CLICK_SYNTH_ATTACK_S,
  BUTTON_CLICK_SYNTH_DECAY_S,
  BUTTON_CLICK_SYNTH_NOISE_GAIN,
  BUTTON_CLICK_SYNTH_NOISE_DECAY_S,
  ACTION_FAIL_GAIN,
  ACTION_FAIL_SYNTH_NOTES_HZ,
  ACTION_FAIL_SYNTH_NOTE_GAP_S,
  ACTION_FAIL_SYNTH_ATTACK_S,
  ACTION_FAIL_SYNTH_DECAY_S,
} from '../data/interact.js'
import {
  STRENGTH_POP_SOUND_URL,
  STRENGTH_POP_GAIN,
  LIFT_LOOP_SOUND_URL,
  LIFT_LOOP_SECONDS,
  LIFT_LOOP_CROSSFADE_S,
  LIFT_LOOP_PEAK,
  LIFT_LOOP_GAIN,
  LIFT_LOOP_FADE_IN_S,
  LIFT_LOOP_FADE_OUT_S,
  THROW_ROCK_SOUND_URL,
  THROW_ROCK_PEAK,
  THROW_ROCK_GAIN,
} from '../data/actionPopups.js'

const cache = new Map() // name -> Promise<AudioBuffer>

function render(ctx, name, seconds, build) {
  if (!cache.has(name)) {
    const rate = ctx.sampleRate
    const offline = new OfflineAudioContext(1, Math.ceil(seconds * rate), rate)
    build(offline)
    cache.set(name, offline.startRendering())
  }
  return cache.get(name)
}

// A run of enveloped oscillator notes (fast attack, exponential decay).
function notes(offline, type, freqs, gap, attack, decay, peakGain) {
  freqs.forEach((freq, i) => {
    const start = i * gap
    const peak = start + attack
    const end = peak + decay
    const osc = offline.createOscillator()
    osc.type = type
    osc.frequency.value = freq
    const gain = offline.createGain()
    gain.gain.setValueAtTime(0, start)
    gain.gain.linearRampToValueAtTime(peakGain, peak)
    gain.gain.exponentialRampToValueAtTime(0.001, end)
    osc.connect(gain)
    gain.connect(offline.destination)
    osc.start(start)
    osc.stop(end + 0.05)
  })
}

const noteSpan = (n, gap, attack, decay) => gap * (n - 1) + attack + decay + 0.05

function confirmBuffer(ctx) {
  const seconds = noteSpan(CONFIRM_POP_SYNTH_NOTES_HZ.length, CONFIRM_POP_SYNTH_NOTE_GAP_S, CONFIRM_POP_SYNTH_ATTACK_S, CONFIRM_POP_SYNTH_DECAY_S)
  return render(ctx, 'confirm', seconds, (o) =>
    notes(o, 'sine', CONFIRM_POP_SYNTH_NOTES_HZ, CONFIRM_POP_SYNTH_NOTE_GAP_S, CONFIRM_POP_SYNTH_ATTACK_S, CONFIRM_POP_SYNTH_DECAY_S, 0.9),
  )
}

function failBuffer(ctx) {
  const seconds = noteSpan(ACTION_FAIL_SYNTH_NOTES_HZ.length, ACTION_FAIL_SYNTH_NOTE_GAP_S, ACTION_FAIL_SYNTH_ATTACK_S, ACTION_FAIL_SYNTH_DECAY_S)
  return render(ctx, 'fail', seconds, (o) =>
    notes(o, 'square', ACTION_FAIL_SYNTH_NOTES_HZ, ACTION_FAIL_SYNTH_NOTE_GAP_S, ACTION_FAIL_SYNTH_ATTACK_S, ACTION_FAIL_SYNTH_DECAY_S, 0.7),
  )
}

// High sine tick plus a short bandpass noise burst.
function clickBuffer(ctx) {
  const seconds = Math.max(BUTTON_CLICK_SYNTH_ATTACK_S + BUTTON_CLICK_SYNTH_DECAY_S, BUTTON_CLICK_SYNTH_NOISE_DECAY_S) + 0.02
  return render(ctx, 'click', seconds, (o) => {
    notes(o, 'sine', [BUTTON_CLICK_SYNTH_FREQ_HZ], 0, BUTTON_CLICK_SYNTH_ATTACK_S, BUTTON_CLICK_SYNTH_DECAY_S, 1)

    const len = Math.ceil(BUTTON_CLICK_SYNTH_NOISE_DECAY_S * o.sampleRate)
    const buf = o.createBuffer(1, len, o.sampleRate)
    const data = buf.getChannelData(0)
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1
    const src = o.createBufferSource()
    src.buffer = buf
    const filter = o.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.value = BUTTON_CLICK_SYNTH_FREQ_HZ * 3
    const gain = o.createGain()
    gain.gain.setValueAtTime(BUTTON_CLICK_SYNTH_NOISE_GAIN, 0)
    gain.gain.exponentialRampToValueAtTime(0.001, BUTTON_CLICK_SYNTH_NOISE_DECAY_S)
    src.connect(filter)
    filter.connect(gain)
    gain.connect(o.destination)
    src.start(0)
  })
}

function play(getBuffer, level) {
  const ctx = unlock()
  if (!ctx) return
  getBuffer(ctx).then((buffer) => {
    const source = ctx.createBufferSource()
    source.buffer = buffer
    const gain = ctx.createGain()
    gain.gain.value = level
    source.connect(gain)
    gain.connect(getMasterBus())
    source.start(0)
  })
}

// The "hold completed" pop: the moment a held-E interaction actually fires.
export const playConfirmPop = () => play(confirmBuffer, CONFIRM_POP_GAIN)
// Any HUD button press.
export const playButtonClick = () => play(clickBuffer, BUTTON_CLICK_GAIN)
// A blocked action; showActionResult(.., false) plays it with the red popup.
export const playActionFail = () => play(failBuffer, ACTION_FAIL_GAIN)

// Decoded-once cache for the pop file; a missing/undecodable file stays silent.
let popBufferPromise = null
function loadPopBuffer(ctx) {
  if (!popBufferPromise) {
    popBufferPromise = fetch(STRENGTH_POP_SOUND_URL)
      .then((r) => r.arrayBuffer())
      .then((data) => ctx.decodeAudioData(data))
      .catch(() => null)
  }
  return popBufferPromise
}

// "+N" strength popup pop, fired the instant the popup spawns.
export function playStrengthPop() {
  const ctx = unlock()
  if (!ctx) return
  loadPopBuffer(ctx).then((buffer) => {
    if (!buffer) return
    const source = ctx.createBufferSource()
    source.buffer = buffer
    const gain = ctx.createGain()
    gain.gain.value = STRENGTH_POP_GAIN
    source.connect(gain)
    gain.connect(getMasterBus())
    source.start(0)
  })
}

// Lift loop: first LIFT_LOOP_SECONDS of the file, peak-normalized, with the tail
// crossfaded into the head so the loop point doesn't click.
let liftBufferPromise = null
function loadLiftBuffer(ctx) {
  if (!liftBufferPromise) {
    liftBufferPromise = fetch(LIFT_LOOP_SOUND_URL)
      .then((r) => r.arrayBuffer())
      .then((data) => ctx.decodeAudioData(data))
      .then((src) => {
        const rate = src.sampleRate
        const total = Math.min(src.length, Math.floor(LIFT_LOOP_SECONDS * rate))
        const xf = Math.min(Math.floor(LIFT_LOOP_CROSSFADE_S * rate), Math.floor(total / 2))
        const len = total - xf
        const out = ctx.createBuffer(src.numberOfChannels, len, rate)
        let peak = 0
        for (let c = 0; c < src.numberOfChannels; c++) {
          const a = src.getChannelData(c)
          const b = out.getChannelData(c)
          for (let i = 0; i < len; i++) b[i] = a[i]
          for (let i = 0; i < xf; i++) {
            const t = (i + 0.5) / xf
            b[i] = a[i] * Math.sin((t * Math.PI) / 2) + a[len + i] * Math.cos((t * Math.PI) / 2)
          }
          for (let i = 0; i < len; i++) peak = Math.max(peak, Math.abs(b[i]))
        }
        if (peak > 0) {
          const k = LIFT_LOOP_PEAK / peak
          for (let c = 0; c < out.numberOfChannels; c++) {
            const b = out.getChannelData(c)
            for (let i = 0; i < len; i++) b[i] *= k
          }
        }
        return out
      })
      .catch(() => null)
  }
  return liftBufferPromise
}

let liftWanted = false
let liftVoice = null // { source, gain }

export function startLiftLoop() {
  if (liftWanted) return
  liftWanted = true
  const ctx = unlock()
  if (!ctx) return
  loadLiftBuffer(ctx).then((buffer) => {
    if (!buffer || !liftWanted || liftVoice) return
    const source = ctx.createBufferSource()
    source.buffer = buffer
    source.loop = true
    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0, ctx.currentTime)
    gain.gain.linearRampToValueAtTime(LIFT_LOOP_GAIN, ctx.currentTime + LIFT_LOOP_FADE_IN_S)
    source.connect(gain)
    gain.connect(getMasterBus())
    source.start(0)
    liftVoice = { source, gain }
  })
}

export function stopLiftLoop() {
  liftWanted = false
  const voice = liftVoice
  if (!voice) return
  liftVoice = null
  const ctx = voice.gain.context
  const now = ctx.currentTime
  voice.gain.gain.cancelScheduledValues(now)
  voice.gain.gain.setValueAtTime(voice.gain.gain.value, now)
  voice.gain.gain.linearRampToValueAtTime(0, now + LIFT_LOOP_FADE_OUT_S)
  voice.source.stop(now + LIFT_LOOP_FADE_OUT_S + 0.02)
}

// Throw one-shot: decoded once, peak-normalized; a missing file stays silent.
let throwBufferPromise = null
function loadThrowBuffer(ctx) {
  if (!throwBufferPromise) {
    throwBufferPromise = fetch(THROW_ROCK_SOUND_URL)
      .then((r) => r.arrayBuffer())
      .then((data) => ctx.decodeAudioData(data))
      .then((buf) => {
        let peak = 0
        for (let c = 0; c < buf.numberOfChannels; c++) {
          const d = buf.getChannelData(c)
          for (let i = 0; i < d.length; i++) peak = Math.max(peak, Math.abs(d[i]))
        }
        if (peak > 0) {
          const k = THROW_ROCK_PEAK / peak
          for (let c = 0; c < buf.numberOfChannels; c++) {
            const d = buf.getChannelData(c)
            for (let i = 0; i < d.length; i++) d[i] *= k
          }
        }
        return buf
      })
      .catch(() => null)
  }
  return throwBufferPromise
}

export function playThrowRock() {
  const ctx = unlock()
  if (!ctx) return
  loadThrowBuffer(ctx).then((buffer) => {
    if (!buffer) return
    const source = ctx.createBufferSource()
    source.buffer = buffer
    const gain = ctx.createGain()
    gain.gain.value = THROW_ROCK_GAIN
    source.connect(gain)
    gain.connect(getMasterBus())
    source.start(0)
  })
}
