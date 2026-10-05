// Procedural 16x16 pixel-art block textures for the Arms window icons (one per arm, cached as data URLs).
const N = 16
const cache = {}

function rng(seed) {
  let s = 0
  for (const c of seed) s = (s * 31 + c.charCodeAt(0)) >>> 0
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296)
}

const PATTERNS = {
  noise: (x, y, r, p) => p[(r() * p.length) | 0],
  // vertical wood grain: columns pick a tone, occasional dark knots
  grain: (x, y, r, p, col) => (r() < 0.12 ? p[3] : p[col[x]]),
  // blotchy stone
  stone: (x, y, r, p) => p[(((Math.sin(x * 1.7) + Math.cos(y * 2.1) + r() * 1.6) * 1.2) | 0) & 3],
  brick: (x, y, r, p) => {
    const row = (y / 4) | 0
    const off = row % 2 ? 4 : 0
    if (y % 4 === 3 || (x + off) % 8 === 7) return p[3]
    return p[(r() * 3) | 0]
  },
  // light pane with a bright frame and streaks
  glass: (x, y, r, p) => {
    if (x === 0 || y === 0 || x === N - 1 || y === N - 1) return p[3]
    return (x + y) % 7 === 0 ? p[2] : r() < 0.06 ? p[1] : p[0]
  },
  // stone base with colored ore specks
  ore: (x, y, r, p) => (r() < 0.22 ? p[(r() * 2) | 0] : p[2 + ((r() * 2) | 0)]),
  glitch: (x, y, r, p) => (r() < 0.3 ? p[(r() * p.length) | 0] : p[(((y / 2) | 0) + (x > 7 ? 1 : 0)) % 2]),
  disco: (x, y, r, p) => p[(((x / 4) | 0) + ((y / 4) | 0)) % p.length],
}

export function armTexture(arm) {
  if (cache[arm.id]) return cache[arm.id]
  const c = document.createElement('canvas')
  c.width = c.height = N
  const g = c.getContext('2d')
  const r = rng(arm.id)
  const col = Array.from({ length: N }, () => (r() * 3) | 0)
  for (let y = 0; y < N; y++)
    for (let x = 0; x < N; x++) {
      g.fillStyle = PATTERNS[arm.pattern](x, y, r, arm.palette, col)
      g.fillRect(x, y, 1, 1)
    }
  return (cache[arm.id] = c.toDataURL())
}
