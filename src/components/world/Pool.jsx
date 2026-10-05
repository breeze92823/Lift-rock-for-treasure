import { useMemo } from 'react'
import { LEADERBOARDS, LEADERBOARD_ROWS, POOL } from '../../data/world.js'
import { MAT, plastic } from '../../materials/world.js'
import { leaderboardTexture } from '../../utils/labels.js'
import { useLeaderboardStore } from '../../store/useLeaderboardStore.js'
import { formatCash, compactNumber, formatDuration } from '../../utils/format.js'
import { Block, Flat } from './parts.jsx'

const FORMAT = { cash: formatCash, strength: compactNumber, playTime: formatDuration }

const CURB = 1.2
const BOARD_W = 7
const BOARD_H = 6.5

function Leaderboard({ title, stat, frame, icon, x, z, rot }) {
  const data = useLeaderboardStore((s) => s[stat])
  const rows = useMemo(() => {
    const live = data.map((r) => ({ name: r.name, value: FORMAT[stat](r.value), mine: !!r.mine }))
    while (live.length < LEADERBOARD_ROWS) live.push({ name: '---', value: '-' }) // not enough players yet
    return live
  }, [data, stat])
  const map = useMemo(() => leaderboardTexture(title, frame, icon, rows), [title, frame, icon, rows])
  return (
    <group position={[x, 0, z]} rotation-y={rot}>
      {[-1, 1].map((s) => (
        <Block key={s} x={s * (BOARD_W / 2 - 0.4)} w={0.35} h={1.6} d={0.35} mat={plastic(frame)} />
      ))}
      <mesh position={[0, 1.5 + BOARD_H / 2, 0]} rotation-x={-0.12} castShadow>
        <boxGeometry args={[BOARD_W, BOARD_H, 0.3]} />
        <meshStandardMaterial attach="material-0" color={frame} />
        <meshStandardMaterial attach="material-1" color={frame} />
        <meshStandardMaterial attach="material-2" color={frame} />
        <meshStandardMaterial attach="material-3" color={frame} />
        <meshBasicMaterial attach="material-4" map={map} toneMapped={false} />
        <meshStandardMaterial attach="material-5" color="#5a3016" />
      </mesh>
    </group>
  )
}

// Shallow pool on the west side with the three leaderboards standing in it.
export default function Pool() {
  const { x0, x1, z0, z1 } = POOL
  return (
    <group>
      <Block x={(x0 + x1) / 2} z={z0 - CURB / 2} w={x1 - x0 + 2 * CURB} h={0.5} d={CURB} mat={MAT.curb} />
      <Block x={(x0 + x1) / 2} z={z1 + CURB / 2} w={x1 - x0 + 2 * CURB} h={0.5} d={CURB} mat={MAT.curb} />
      <Block x={x0 - CURB / 2} z={(z0 + z1) / 2} w={CURB} h={0.5} d={z1 - z0} mat={MAT.curb} />
      <Block x={x1 + CURB / 2} z={(z0 + z1) / 2} w={CURB} h={0.5} d={z1 - z0} mat={MAT.curb} />
      <Flat x0={x0} x1={x1} z0={z0} z1={z1} h={0.22} mat={MAT.water} />
      {LEADERBOARDS.map((b) => (
        <Leaderboard key={b.title} {...b} />
      ))}
    </group>
  )
}
