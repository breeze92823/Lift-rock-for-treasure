import { CanvasTexture, SRGBColorSpace } from 'three'
import { canvasTexture } from './textures.js'

// Canvas-painted signs and billboard labels in the chunky Roblox UI style:
// heavy rounded font, thick black outline, saturated fills. Static ones are
// cached through canvasTexture(); the timer board repaints itself.

export const FONT_FAMILY = 'Fredoka, "Arial Black", sans-serif'
export const font = (size) => `700 ${size}px ${FONT_FAMILY}`

// The flexed-arm icon, shared with the HUD (components/hud/icons.jsx).
// 100x100 viewBox; fist top-right, bicep bulge left, elbow bottom-right.
export const ARM_PATH =
  'M8 84 C4 56 26 38 46 48 C52 51 56 54 58 52 L60 32 C54 18 66 4 82 8 C96 12 98 30 86 38 L88 66 C90 88 74 96 56 94 L18 92 C12 91 9 88 8 84 Z'

export function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.roundRect(x, y, w, h, r)
}

export function strokeText(ctx, text, x, y, { size = 64, fill = '#fff', stroke = '#000', line = size * 0.16, align = 'center', baseline = 'middle' } = {}) {
  ctx.font = font(size)
  ctx.textAlign = align
  ctx.textBaseline = baseline
  ctx.lineJoin = 'round'
  ctx.miterLimit = 2
  if (stroke && line > 0) {
    ctx.strokeStyle = stroke
    ctx.lineWidth = line
    ctx.strokeText(text, x, y)
  }
  ctx.fillStyle = fill
  ctx.fillText(text, x, y)
}

export function rainbow(ctx, x0, y0, x1, y1) {
  const g = ctx.createLinearGradient(x0, y0, x1, y1)
  ;['#ff2d2d', '#ff9a1a', '#ffe81a', '#3ae03a', '#1ad7ff', '#3a5bff', '#c23aff'].forEach((c, i, a) => g.addColorStop(i / (a.length - 1), c))
  return g
}

function vgrad(ctx, y0, y1, top, bottom) {
  const g = ctx.createLinearGradient(0, y0, 0, y1)
  g.addColorStop(0, top)
  g.addColorStop(1, bottom)
  return g
}

export function drawClover(ctx, x, y, r) {
  ctx.save()
  ctx.translate(x, y)
  ctx.fillStyle = '#2fd14a'
  ctx.strokeStyle = '#0d5a1a'
  ctx.lineWidth = r * 0.14
  for (let i = 0; i < 4; i++) {
    ctx.save()
    ctx.rotate((i * Math.PI) / 2 + Math.PI / 4)
    ctx.beginPath()
    ctx.arc(0, -r * 0.48, r * 0.42, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()
    ctx.restore()
  }
  ctx.fillStyle = '#7dff8e'
  ctx.beginPath()
  ctx.arc(0, 0, r * 0.18, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

export function drawArm(ctx, x, y, size) {
  ctx.save()
  ctx.translate(x, y)
  ctx.scale(size / 100, size / 100)
  const p = new Path2D(ARM_PATH)
  const g = ctx.createLinearGradient(0, 0, 0, 100)
  g.addColorStop(0, '#ffc23a')
  g.addColorStop(1, '#ff7a00')
  ctx.lineJoin = 'round'
  ctx.strokeStyle = '#7a3300'
  ctx.lineWidth = 8
  ctx.stroke(p)
  ctx.fillStyle = g
  ctx.fill(p)
  ctx.restore()
}

export function drawRebirth(ctx, x, y, r) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(-0.35)
  ctx.lineWidth = r * 0.16
  ctx.strokeStyle = '#2a2a33'
  ctx.fillStyle = '#ffffff'
  ctx.beginPath()
  ctx.arc(0, 0, r, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#ee3340'
  ctx.beginPath()
  ctx.arc(0, 0, r, Math.PI, 0)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(0, 0, r, 0, Math.PI * 2)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(-r, 0)
  ctx.lineTo(r, 0)
  ctx.stroke()
  ctx.fillStyle = '#fff'
  ctx.beginPath()
  ctx.arc(0, 0, r * 0.32, 0, Math.PI * 2)
  ctx.fill()
  ctx.stroke()
  ctx.restore()
}

// Generic floating label: a stack of lines, each optionally on a pill.
// line = { text, size, fill, stroke, pill, pillStroke }
// Returns { map, aspect } (aspect = width / height).
const PAD = 16
export function billboardTexture(lines) {
  const key = 'bb:' + JSON.stringify(lines)
  const heights = lines.map((l) => (l.size ?? 64) * (l.pill ? 1.45 : 1.2))
  const H = Math.ceil(heights.reduce((a, b) => a + b, 0) + PAD * 2)
  const W = 1024
  const map = canvasTexture(key, W, H, (ctx) => {
    let y = PAD
    lines.forEach((l, i) => {
      const size = l.size ?? 64
      const cy = y + heights[i] / 2
      if (l.pill) {
        ctx.font = font(size)
        const tw = ctx.measureText(l.text).width + size * 0.9
        const ph = size * 1.25
        roundRect(ctx, W / 2 - tw / 2, cy - ph / 2, tw, ph, ph * 0.3)
        ctx.fillStyle = l.pill === 'rainbow' ? rainbow(ctx, W / 2 - tw / 2, 0, W / 2 + tw / 2, 0) : l.pill
        ctx.fill()
        ctx.lineWidth = size * 0.1
        ctx.strokeStyle = l.pillStroke ?? '#000'
        ctx.stroke()
      }
      if (l.icon === 'clover') {
        ctx.font = font(size)
        const tw = ctx.measureText(l.text).width
        drawClover(ctx, W / 2 - tw / 2 - size * 0.55, cy, size * 0.42)
        strokeText(ctx, l.text, W / 2 + size * 0.35, cy, { size, fill: l.fill, stroke: l.stroke ?? '#000' })
      } else {
        strokeText(ctx, l.text, W / 2, cy, { size, fill: l.fill ?? '#fff', stroke: l.stroke ?? '#000', line: l.line })
      }
      y += heights[i]
    })
  })
  return { map, aspect: W / H }
}

export const RARITY_PILL = {
  Secret: { pill: '#2b2c35', pillStroke: '#ffffff', fill: '#ffffff' },
  Celestial: { pill: 'rainbow', pillStroke: '#3a0d5a', fill: '#ffffff' },
  Divine: { pill: '#ffd84a', pillStroke: '#6a4a00', fill: '#ffffff' },
  Exclusive: { pill: '#ff2b2b', pillStroke: '#5a0000', fill: '#ffffff' },
}

// Front face of a lift barrier (4:1 panel): "xN Luck" over a dark strip
// carrying the lift progress bar (0/req) and the lifter's name.
export function tierTexture(luck, req, name, color) {
  return canvasTexture(`tier:${luck}:${req}:${name}:${color}`, 1024, 256, (ctx, w, h) => {
    ctx.fillStyle = color
    ctx.fillRect(0, 0, w, h)
    ctx.font = font(76)
    const label = `x${luck} Luck`
    const tw = ctx.measureText(label).width
    drawClover(ctx, w / 2 - tw / 2 - 14, 52, 28)
    strokeText(ctx, label, w / 2 + 26, 54, { size: 76, line: 12 })
    roundRect(ctx, 200, 118, w - 400, 62, 26)
    ctx.fillStyle = '#121418'
    ctx.fill()
    ctx.lineWidth = 6
    ctx.strokeStyle = '#3c4049'
    ctx.stroke()
    strokeText(ctx, `0/${req}`, w / 2, 151, { size: 46, line: 8 })
    strokeText(ctx, name, w / 2, 218, { size: 34, fill: '#d9dce3', line: 0 })
  })
}

// Floor marker at the corridor mouth: pale green slab with a clover and "x1".
export function zoneMarkerTexture(luck) {
  return canvasTexture(`zone:${luck}`, 1024, 256, (ctx, w, h) => {
    ctx.fillStyle = '#b9d9a8'
    ctx.fillRect(0, 0, w, h)
    drawClover(ctx, w / 2 - 190, h / 2, 90)
    strokeText(ctx, `x${luck}`, w / 2 + 70, h / 2 + 4, { size: 150, fill: '#e8e8e8', stroke: '#2a2a2a', line: 18 })
  })
}

// `k` scales the artwork with the pad's depth (2 for a 4 m deep pad), so the
// lettering keeps its proportions instead of being stretched tall.
export function liftStripeTexture(k = 1) {
  return canvasTexture(k === 1 ? 'lift-stripe' : `lift-stripe:${k}`, 1024, 128 * k, (ctx, w, h) => {
    ctx.fillStyle = vgrad(ctx, 0, h, '#ffad2e', '#ff7f0a')
    ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = 'rgba(0,0,0,0.18)'
    ctx.fillRect(0, h - 10 * k, w, 10 * k)
    drawArm(ctx, w / 2 - 230 * k, 14 * k, 100 * k)
    strokeText(ctx, 'LIFT', w / 2 + 50 * k, h / 2 + 4 * k, { size: 104 * k, fill: '#ffffff', stroke: '#1d1d1d', line: 16 * k })
  })
}

// Spawn countdown board (legendary / mythic / secret). Repainted each second
// by the component that owns it, so it is not cached.
export function makeTimerBoard() {
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 600
  const ctx = canvas.getContext('2d')
  const map = new CanvasTexture(canvas)
  map.colorSpace = SRGBColorSpace
  map.anisotropy = 8

  function draw(rows) {
    const w = canvas.width
    const h = canvas.height
    ctx.clearRect(0, 0, w, h)
    roundRect(ctx, 0, 0, w, h, 28)
    ctx.fillStyle = '#f26b0f'
    ctx.fill()
    roundRect(ctx, 14, 14, w - 28, h - 28, 20)
    ctx.fillStyle = '#121212'
    ctx.fill()
    const rh = (h - 28 - 24) / rows.length
    rows.forEach((r, i) => {
      const y = 26 + i * rh
      roundRect(ctx, 28, y, w - 56, rh - 12, 14)
      ctx.fillStyle = r.bg === 'rainbow' ? rainbow(ctx, 28, 0, w - 28, 0) : r.bg
      ctx.fill()
      ctx.lineWidth = 8
      ctx.strokeStyle = r.border
      ctx.stroke()
      strokeText(ctx, `${r.label} spawns in: ${r.time}`, w / 2, y + (rh - 12) / 2 + 4, { size: 72, line: 14 })
    })
    map.needsUpdate = true
  }
  return { map, draw, aspect: canvas.width / canvas.height }
}

function drawBillIcon(ctx, x, y, s) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(-0.25)
  roundRect(ctx, -s * 0.5, -s * 0.3, s, s * 0.6, s * 0.1)
  ctx.fillStyle = '#4fd048'
  ctx.fill()
  ctx.lineWidth = s * 0.08
  ctx.strokeStyle = '#0d5a1a'
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(0, 0, s * 0.17, 0, Math.PI * 2)
  ctx.fillStyle = '#b6f5a8'
  ctx.fill()
  ctx.restore()
}

function drawClockIcon(ctx, x, y, r) {
  ctx.save()
  ctx.translate(x, y)
  ctx.beginPath()
  ctx.arc(0, 0, r, 0, Math.PI * 2)
  ctx.fillStyle = '#ff3b3b'
  ctx.fill()
  ctx.lineWidth = r * 0.18
  ctx.strokeStyle = '#fff'
  ctx.stroke()
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(0, -r * 0.55)
  ctx.lineTo(0, 0)
  ctx.lineTo(r * 0.4, r * 0.2)
  ctx.stroke()
  ctx.restore()
}

const MEDALS = ['#ffd426', '#d9dde6', '#e0894a']
const HEADS = ['#f2c9a0', '#c98e63', '#ffe0bd', '#8d5a3b', '#e8b48a']

function drawAvatar(ctx, x, y, s, i) {
  roundRect(ctx, x - s / 2, y - s / 2, s, s, s * 0.22)
  ctx.fillStyle = HEADS[i % HEADS.length]
  ctx.fill()
  ctx.lineWidth = 3
  ctx.strokeStyle = '#2a1608'
  ctx.stroke()
  ctx.fillStyle = '#2a1608'
  ctx.fillRect(x - s * 0.22, y - s * 0.08, s * 0.1, s * 0.16)
  ctx.fillRect(x + s * 0.12, y - s * 0.08, s * 0.1, s * 0.16)
}

// `rows`: [{ name, value }] ranked top-down; `icon`: 'cash' | 'power' | 'time'.
export function leaderboardTexture(title, frame, icon, rows) {
  return canvasTexture(`lb:${title}:${JSON.stringify(rows)}`, 640, 576, (ctx, w, h) => {
    roundRect(ctx, 0, 0, w, h, 34)
    ctx.fillStyle = frame
    ctx.fill()
    roundRect(ctx, 10, 10, w - 20, h - 20, 26)
    ctx.fillStyle = 'rgba(255,255,255,0.35)'
    ctx.fill()
    roundRect(ctx, 18, 18, w - 36, h - 36, 20)
    ctx.fillStyle = vgrad(ctx, 18, h - 18, '#b85a1e', '#8a3d12')
    ctx.fill()
    const cx = 124
    if (icon === 'cash') drawBillIcon(ctx, cx, 64, 72)
    else if (icon === 'power') drawArm(ctx, cx - 34, 30, 68)
    else drawClockIcon(ctx, cx, 64, 30)
    strokeText(ctx, title, cx + 44, 66, { size: 66, line: 12, align: 'left' })
    const top = 118
    const step = (h - 18 - 12 - top) / rows.length
    rows.forEach((r, i) => {
      const y = top + i * step + step / 2
      roundRect(ctx, 34, y - step / 2 + 3, w - 68, step - 6, 10)
      ctx.fillStyle = r.mine ? 'rgba(255,214,64,0.55)' : i % 2 ? 'rgba(0,0,0,0.12)' : 'rgba(0,0,0,0.26)'
      ctx.fill()
      if (r.mine) {
        ctx.lineWidth = 4
        ctx.strokeStyle = '#ffe14a' // the viewer's own row gets a gold outline
        ctx.stroke()
      }
      if (i < 3) {
        ctx.beginPath()
        ctx.arc(66, y, 20, 0, Math.PI * 2)
        ctx.fillStyle = MEDALS[i]
        ctx.fill()
        ctx.lineWidth = 4
        ctx.strokeStyle = '#3a1800'
        ctx.stroke()
        strokeText(ctx, String(i + 1), 66, y + 2, { size: 26, line: 5, fill: '#3a1800', stroke: null })
      } else {
        strokeText(ctx, String(i + 1), 66, y + 2, { size: 28, line: 6 })
      }
      drawAvatar(ctx, 118, y, 36, i)
      strokeText(ctx, r.name, 152, y + 2, { size: 30, align: 'left', line: 6 })
      strokeText(ctx, r.value, w - 52, y + 2, { size: 30, align: 'right', line: 6, fill: '#7dff6a' })
    })
  })
}

export function trainingBannerTexture() {
  return canvasTexture('training', 2048, 400, (ctx, w, h) => {
    roundRect(ctx, 0, 0, w, h, 40)
    ctx.fillStyle = '#8a3d00'
    ctx.fill()
    roundRect(ctx, 22, 22, w - 44, h - 44, 30)
    ctx.fillStyle = vgrad(ctx, 0, h, '#ffe23a', '#ff6a00')
    ctx.fill()
    ctx.save()
    ctx.translate(w / 2, h / 2 + 12)
    ctx.transform(1, 0, -0.28, 1, 0, 0)
    strokeText(ctx, 'TRAINING', 0, 0, { size: 250, fill: '#ffffff', stroke: '#3a1800', line: 40 })
    ctx.restore()
  })
}

export function drawHex(ctx, x, y, r) {
  ctx.save()
  ctx.translate(x, y)
  ctx.lineJoin = 'round'
  ctx.lineWidth = r * 0.2
  ctx.strokeStyle = '#0d5a1a'
  ctx.fillStyle = '#7dff3a'
  ctx.beginPath()
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + Math.PI / 6
    ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r)
  }
  ctx.closePath()
  ctx.fill()
  ctx.stroke()
  ctx.fillStyle = '#1f9a22'
  ctx.beginPath()
  ctx.arc(0, 0, r * 0.4, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

// Requirement plaque (rebirth count, hex count or "Starter") over the power.
export function trainingLabelTexture(p) {
  const { type, n } = p.req
  return canvasTexture(`tl:${p.power}:${type}:${n ?? ''}`, 512, 256, (ctx, w) => {
    roundRect(ctx, 100, 10, w - 200, 96, 18)
    ctx.fillStyle = 'rgba(40,40,60,0.85)'
    ctx.fill()
    ctx.lineWidth = 6
    ctx.strokeStyle = type === 'hex' ? '#2f9e2a' : '#c8cbe0'
    ctx.stroke()
    if (type === 'starter') {
      strokeText(ctx, 'Starter', w / 2, 60, { size: 56, fill: '#ffffff', line: 10 })
    } else if (type === 'hex') {
      const x0 = w / 2 - 12 * String(n).length
      drawHex(ctx, x0 - 8, 58, 30)
      strokeText(ctx, String(n), x0 + 36, 60, { size: 60, fill: '#ffffff', stroke: '#0d3a14', line: 10, align: 'left' })
    } else {
      drawRebirth(ctx, w / 2 - 50, 58, 30)
      strokeText(ctx, String(n), w / 2 + 20, 60, { size: 60, fill: '#ff4b4b', stroke: '#fff', line: 10 })
    }
    strokeText(ctx, `${p.power} Power`, w / 2, 170, { size: 66, fill: '#ff8a1a', stroke: '#3a1800', line: 12 })
  })
}

export function stallSignTexture(label, color) {
  return canvasTexture(`stall:${label}`, 512, 128, (ctx, w, h) => {
    strokeText(ctx, label, w / 2, h / 2 + 4, { size: 92, fill: color, stroke: '#ffffff', line: 18 })
    strokeText(ctx, label, w / 2, h / 2 + 4, { size: 92, fill: color, stroke: '#1a1a1a', line: 6 })
  })
}

// The black tribal sun painted on the hub's centre tile.
export function emblemTexture() {
  return canvasTexture('emblem', 1024, 1024, (ctx, w, h) => {
    ctx.translate(w / 2, h / 2)
    ctx.fillStyle = '#16161a'
    const spikes = 9
    for (let i = 0; i < spikes; i++) {
      ctx.save()
      ctx.rotate((i / spikes) * Math.PI * 2)
      ctx.beginPath()
      ctx.moveTo(-70, -120)
      ctx.quadraticCurveTo(-30, -300, 90, -470)
      ctx.quadraticCurveTo(10, -290, 70, -120)
      ctx.closePath()
      ctx.fill()
      ctx.restore()
    }
    ctx.lineWidth = 34
    ctx.strokeStyle = '#16161a'
    ctx.beginPath()
    ctx.arc(0, 0, 150, 0, Math.PI * 2)
    ctx.stroke()
  })
}

// Studded dark-grey path with lighter chevrons pointing north (texture V up).
export function chevronTexture() {
  const t = canvasTexture('chevron', 256, 256, (ctx, w, h) => {
    ctx.fillStyle = '#7f838c'
    ctx.fillRect(0, 0, w, h)
    ctx.strokeStyle = 'rgba(0,0,0,0.16)'
    ctx.lineWidth = 3
    for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) {
      roundRect(ctx, x * 64 + 10, y * 64 + 10, 44, 44, 10)
      ctx.stroke()
    }
    ctx.fillStyle = '#a3a7b0'
    ctx.beginPath()
    ctx.moveTo(0, 150)
    ctx.lineTo(w / 2, 60)
    ctx.lineTo(w, 150)
    ctx.lineTo(w, 210)
    ctx.lineTo(w / 2, 120)
    ctx.lineTo(0, 210)
    ctx.closePath()
    ctx.fill()
  }, { repeat: true })
  return t
}

export function homeIconTexture() {
  return canvasTexture('home-icon', 256, 256, (ctx) => {
    ctx.lineJoin = 'round'
    ctx.lineWidth = 16
    ctx.strokeStyle = '#ffffff'
    ctx.fillStyle = '#ff3b2f'
    ctx.beginPath()
    ctx.moveTo(128, 30)
    ctx.lineTo(236, 120)
    ctx.lineTo(206, 120)
    ctx.lineTo(206, 226)
    ctx.lineTo(50, 226)
    ctx.lineTo(50, 120)
    ctx.lineTo(20, 120)
    ctx.closePath()
    ctx.stroke()
    ctx.fill()
    ctx.fillStyle = '#ffd23a'
    ctx.fillRect(104, 150, 48, 76)
  })
}

export function armIconTexture() {
  return canvasTexture('arm-icon', 256, 256, (ctx) => drawArm(ctx, 28, 28, 200))
}

// "Luck: +205%" floating text: lime title, white value, heavy dark outline.
// Returns { map, aspect } like billboardTexture().
export function luckTextTexture(total) {
  const W = 1024
  const H = 200
  const map = canvasTexture(`luck-text:${total}`, W, H, (ctx) => {
    ctx.font = font(120)
    const a = ctx.measureText('Luck:').width
    ctx.font = font(78)
    const b = ctx.measureText(`+${total}%`).width
    const x0 = W / 2 - (a + 24 + b) / 2
    strokeText(ctx, 'Luck:', x0, H / 2, { size: 120, fill: '#c9ff1f', stroke: '#1d3a00', line: 22, align: 'left' })
    strokeText(ctx, `+${total}%`, x0 + a + 24, H / 2 + 14, { size: 78, fill: '#ffffff', stroke: '#1d3a00', line: 16, align: 'left' })
  })
  return { map, aspect: W / H }
}

// Blue "Base Upgrade" signboard: house icon, upgrade cost and slots used/total.
export function baseUpgradeSignTexture(used, total) {
  return canvasTexture(`base-sign:${used}:${total}`, 1024, 480, (ctx, w, h) => {
    roundRect(ctx, 0, 0, w, h, 50)
    ctx.fillStyle = '#2f4f78'
    ctx.fill()
    roundRect(ctx, 14, 14, w - 28, h - 28, 40)
    ctx.fillStyle = vgrad(ctx, 14, h, '#7fa6d6', '#5c82b4')
    ctx.fill()
    strokeText(ctx, 'Base Upgrade', w / 2, 100, { size: 120, line: 20 })
    // orange cost bar
    roundRect(ctx, 50, 190, w - 100, 190, 36)
    ctx.fillStyle = vgrad(ctx, 190, 380, '#ffc23a', '#ff7a00')
    ctx.fill()
    ctx.lineWidth = 12
    ctx.strokeStyle = '#7a3300'
    ctx.stroke()
    ctx.save()
    ctx.translate(70, 200)
    ctx.scale(0.55, 0.55)
    ctx.drawImage(homeIconTexture().image, 0, 0)
    ctx.restore()
    strokeText(ctx, '2', 330, 270, { size: 90, line: 16 })
    ctx.fillStyle = '#ff2b4a'
    ctx.strokeStyle = '#5a0010'
    ctx.lineWidth = 8
    ctx.beginPath()
    ctx.moveTo(430, 235)
    ctx.lineTo(470, 235)
    ctx.lineTo(490, 262)
    ctx.lineTo(450, 305)
    ctx.lineTo(410, 262)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()
    strokeText(ctx, '$5K', w - 80, 270, { size: 100, line: 18, align: 'right' })
    strokeText(ctx, `Slots ${used}/${total}`, w / 2 + 40, 345, { size: 56, fill: '#34c3ff', stroke: '#06304a', line: 10 })
  })
}
