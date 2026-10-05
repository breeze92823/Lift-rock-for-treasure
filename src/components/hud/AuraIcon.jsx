// Vector aura icons for the Aura window: a layered glowing shape per aura.shape, tinted by aura.colors.
const FLAME = 'M50 4 C58 24 84 34 82 62 C80 84 66 96 50 96 C34 96 20 84 18 62 C16 48 26 40 30 26 C38 38 42 38 45 30 C47 20 46 12 50 4 Z'
const FLAME_IN = 'M50 30 C56 44 70 50 69 66 C68 80 60 88 50 88 C40 88 32 80 31 66 C30 56 38 52 41 44 C45 50 47 50 48 44 C49 38 49 34 50 30 Z'
const SPARK = 'M0 -9 L3 -3 L9 0 L3 3 L0 9 L-3 3 L-9 0 L-3 -3 Z'

export default function AuraIcon({ aura, className }) {
  const [a, b] = aura.colors
  const id = `ai-${aura.id}`
  const stops = aura.rainbow
    ? ['#ff4a4a', '#ffd84a', '#4aff7a', '#4ab8ff', '#c04aff'].map((c, i, arr) => <stop key={c} offset={`${(i / (arr.length - 1)) * 100}%`} stopColor={c} />)
    : [<stop key="a" offset="0%" stopColor={a} />, <stop key="b" offset="100%" stopColor={b} />]
  let body
  switch (aura.shape) {
    case 'halo':
      body = (
        <>
          <path d="M62 10 C30 24 24 62 40 92 C26 64 30 30 62 10 Z" fill={`url(#${id})`} stroke="#3a1a60" strokeWidth="2" />
          <path d="M70 34 C44 40 30 56 36 74 C46 58 56 52 70 34 Z" fill={b} opacity="0.85" />
          <path d="M26 40 C40 28 70 34 72 52 C62 44 40 42 26 40 Z" fill="none" stroke={b} strokeWidth="5" strokeLinecap="round" />
          <path d="M30 66 C46 76 74 70 74 58" fill="none" stroke={a} strokeWidth="4" strokeLinecap="round" />
        </>
      )
      break
    case 'crown':
      body = <path d="M14 78 L10 28 L34 50 L50 14 L66 50 L90 28 L86 78 Z" fill={`url(#${id})`} stroke="#3a0a10" strokeWidth="3" strokeLinejoin="round" />
      break
    case 'orb':
      body = (
        <>
          <circle cx="50" cy="50" r="38" fill={`url(#${id})`} stroke="#10062a" strokeWidth="3" />
          <ellipse cx="50" cy="50" rx="46" ry="14" fill="none" stroke={a} strokeWidth="4" transform="rotate(-25 50 50)" />
        </>
      )
      break
    case 'star':
      body = <path d="M50 6 L62 38 L94 50 L62 62 L50 94 L38 62 L6 50 L38 38 Z" fill={`url(#${id})`} stroke="#1a0a40" strokeWidth="3" strokeLinejoin="round" />
      break
    default:
      body = (
        <>
          <path d={FLAME} fill={`url(#${id})`} stroke="rgba(0,0,0,0.35)" strokeWidth="2" strokeLinejoin="round" />
          <path d={FLAME_IN} fill="#fff" opacity="0.45" />
        </>
      )
  }
  return (
    <svg className={className} viewBox="0 0 100 100" aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0.4" y2="1">{stops}</linearGradient>
      </defs>
      {body}
      <g fill="#fff" opacity="0.9">
        <path d={SPARK} transform="translate(14 20) scale(0.8)" />
        <path d={SPARK} transform="translate(88 44) scale(0.6)" />
        <path d={SPARK} transform="translate(80 12) scale(0.45)" />
      </g>
    </svg>
  )
}
