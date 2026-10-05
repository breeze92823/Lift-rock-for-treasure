import { useId } from 'react'
import { ARM_PATH } from '../../utils/labels.js'

// Chunky cartoon HUD icons, 100x100 viewBox, dark outlines like the Roblox
// originals. Gradient ids are shared between instances — identical defs, so
// whichever one the browser resolves draws the same.
const OUT = '#1d1d22'

export function ArmIcon(props) {
  // Per-instance id: a shared id breaks (unfilled icon) when the instance that
  // owns the gradient is display:none, e.g. an idle popup node.
  const gid = `g-arm-${useId().replace(/:/g, '')}`
  return (
    <svg viewBox="0 0 100 100" {...props}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffc93d" />
          <stop offset="1" stopColor="#ff7a00" />
        </linearGradient>
      </defs>
      <path d={ARM_PATH} fill={`url(#${gid})`} stroke="#7a3300" strokeWidth="6" strokeLinejoin="round" />
      <path d="M22 70 C22 58 32 52 42 56" fill="none" stroke="#ffe08a" strokeWidth="5" strokeLinecap="round" opacity="0.8" />
      <path d="M72 14 C80 12 86 16 86 22" fill="none" stroke="#ffe08a" strokeWidth="4" strokeLinecap="round" opacity="0.8" />
    </svg>
  )
}

export function BookIcon(props) {
  return (
    <svg viewBox="0 0 100 100" {...props}>
      <path d="M10 46 L54 24 L92 46 L48 70 Z" fill="#4aa3ff" stroke={OUT} strokeWidth="4" strokeLinejoin="round" />
      <path d="M10 46 L48 70 L48 86 L10 62 Z" fill="#1f5fc8" stroke={OUT} strokeWidth="4" strokeLinejoin="round" />
      <path d="M48 70 L92 46 L92 62 L48 86 Z" fill="#f2f2f2" stroke={OUT} strokeWidth="4" strokeLinejoin="round" />
      <path d="M54 76 L88 57 M54 81 L88 62" stroke="#b8c2d6" strokeWidth="2.5" />
      <path d="M26 46 L56 31" stroke="#9fd0ff" strokeWidth="4" strokeLinecap="round" />
    </svg>
  )
}

export function UpgradeIcon(props) {
  const chevron = (y, fill, side) => (
    <g>
      <path d={`M14 ${y + 26} L50 ${y} L86 ${y + 26} L86 ${y + 40} L50 ${y + 16} L14 ${y + 40} Z`} fill={fill} stroke={OUT} strokeWidth="4" strokeLinejoin="round" />
      <path d={`M14 ${y + 40} L50 ${y + 16} L50 ${y + 24} L14 ${y + 48} Z`} fill={side} stroke={OUT} strokeWidth="3" strokeLinejoin="round" />
    </g>
  )
  return (
    <svg viewBox="0 0 100 100" {...props}>
      {chevron(40, '#3fcf3a', '#1f8a1f')}
      {chevron(12, '#6cf04e', '#2aa22a')}
    </svg>
  )
}

export function RebirthIcon(props) {
  return (
    <svg viewBox="0 0 100 100" {...props}>
      <g transform="rotate(-20 50 50)">
        <circle cx="50" cy="52" r="40" fill="#fff" stroke={OUT} strokeWidth="5" />
        <path d="M10 52 A40 40 0 0 1 90 52 Z" fill="#ef3340" stroke={OUT} strokeWidth="5" strokeLinejoin="round" />
        <path d="M22 36 A30 30 0 0 1 46 20" fill="none" stroke="#ff9aa0" strokeWidth="5" strokeLinecap="round" />
        <circle cx="50" cy="52" r="12" fill="#fff" stroke={OUT} strokeWidth="5" />
      </g>
    </svg>
  )
}

export function CashIcon(props) {
  return (
    <svg viewBox="0 0 100 100" {...props}>
      <g transform="rotate(-18 50 50)">
        <rect x="8" y="46" width="78" height="34" rx="4" fill="#1f8a2a" stroke={OUT} strokeWidth="4" />
        <rect x="12" y="34" width="78" height="34" rx="4" fill="#2fb83a" stroke={OUT} strokeWidth="4" />
        <rect x="16" y="22" width="78" height="34" rx="4" fill="#5fe04a" stroke={OUT} strokeWidth="4" />
        <circle cx="55" cy="39" r="9" fill="#2a9a2a" stroke={OUT} strokeWidth="3" />
        <rect x="28" y="22" width="10" height="34" fill="#ffd23a" stroke={OUT} strokeWidth="3" />
      </g>
    </svg>
  )
}

export function BackpackIcon(props) {
  return (
    <svg viewBox="0 0 100 100" {...props}>
      <path d="M36 22 C36 10 64 10 64 22" fill="none" stroke={OUT} strokeWidth="9" />
      <path d="M36 22 C36 10 64 10 64 22" fill="none" stroke="#c42a22" strokeWidth="4" />
      <rect x="16" y="20" width="68" height="70" rx="18" fill="#e8402f" stroke={OUT} strokeWidth="5" />
      <path d="M18 44 C30 52 70 52 82 44" fill="none" stroke={OUT} strokeWidth="4" />
      <rect x="30" y="56" width="40" height="26" rx="7" fill="#c42a22" stroke={OUT} strokeWidth="4" />
      <path d="M42 64 L50 72 L58 64" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M26 30 C30 26 36 25 40 26" fill="none" stroke="#ff8a7a" strokeWidth="4" strokeLinecap="round" />
    </svg>
  )
}

export function GiftIcon(props) {
  return (
    <svg viewBox="0 0 100 100" {...props}>
      <path d="M50 30 C34 10 18 18 28 30 Z M50 30 C66 10 82 18 72 30 Z" fill="#ffcc2a" stroke={OUT} strokeWidth="4" strokeLinejoin="round" />
      <rect x="14" y="44" width="72" height="46" rx="4" fill="#6a2ad6" stroke={OUT} strokeWidth="4" />
      <rect x="8" y="28" width="84" height="20" rx="4" fill="#8a46f0" stroke={OUT} strokeWidth="4" />
      <rect x="42" y="28" width="16" height="62" fill="#ffcc2a" stroke={OUT} strokeWidth="4" />
    </svg>
  )
}

export function RobuxIcon(props) {
  return (
    <svg viewBox="0 0 100 100" {...props}>
      <path d="M50 6 L88 28 L88 72 L50 94 L12 72 L12 28 Z" fill="#1fbf3a" stroke="#0a3a12" strokeWidth="6" strokeLinejoin="round" />
      <path d="M50 26 L70 38 L70 62 L50 74 L30 62 L30 38 Z" fill="#0f7a22" stroke="#0a3a12" strokeWidth="4" strokeLinejoin="round" />
      <rect x="42" y="42" width="16" height="16" fill="#1fbf3a" />
    </svg>
  )
}

export function FaceIcon(props) {
  return (
    <svg viewBox="0 0 100 100" {...props}>
      <circle cx="50" cy="50" r="40" fill="#ffd23a" stroke={OUT} strokeWidth="5" />
      <ellipse cx="36" cy="44" rx="10" ry="13" fill="#fff" stroke={OUT} strokeWidth="3" />
      <ellipse cx="64" cy="44" rx="10" ry="13" fill="#fff" stroke={OUT} strokeWidth="3" />
      <circle cx="38" cy="47" r="5" fill={OUT} />
      <circle cx="66" cy="47" r="5" fill={OUT} />
      <path d="M38 70 C44 76 56 76 62 70" fill="none" stroke={OUT} strokeWidth="4" strokeLinecap="round" />
      <path d="M8 74 C20 70 26 84 18 92 C10 92 4 84 8 74 Z" fill="#3fcf3a" stroke={OUT} strokeWidth="3" />
    </svg>
  )
}

export function GearIcon(props) {
  const teeth = Array.from({ length: 8 }, (_, i) => (
    <rect key={i} x="43" y="8" width="14" height="18" rx="3" fill="#cfd6e0" stroke={OUT} strokeWidth="3" transform={`rotate(${i * 45} 50 50)`} />
  ))
  return (
    <svg viewBox="0 0 100 100" {...props}>
      {teeth}
      <circle cx="50" cy="50" r="30" fill="#cfd6e0" stroke={OUT} strokeWidth="4" />
      <circle cx="50" cy="50" r="12" fill="#2a3a5a" stroke={OUT} strokeWidth="3" />
    </svg>
  )
}
