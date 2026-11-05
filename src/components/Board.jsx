import { useMemo } from 'react'
import { BASE_ORIGINS, COLORS, HOME_COLUMNS, SAFE_IDX, START_IDX, STOPPER_COLORS, TRACK, TURN_ORDER } from '../game/constants'
import { getCell } from '../game/logic'
import Token from './Token'
import Dice from './Dice'

function cellKey(cell) { return `${cell[0]},${cell[1]}` }

export default function Board({ players, currentPlayer, dice, movable, animation, onRoll, onMove, canRoll }) {
  const tokenGroups = useMemo(() => {
    const groups = new Map()
    players.forEach((player) => player.tokens.forEach((storedProgress, tokenIndex) => {
      const progress = animation && player.color === currentPlayer.color && tokenIndex === animation.tokenIndex ? animation.progress : storedProgress
      const cell = getCell(player.color, progress, tokenIndex)
      const key = cellKey(cell)
      if (!groups.has(key)) groups.set(key, [])
      groups.get(key).push({ ...player, progress, tokenIndex, cell })
    }))
    return groups
  }, [players, animation, currentPlayer.color])
  const trackByCell = new Map(TRACK.map((cell, index) => [cellKey(cell), index]))
  const homeByCell = new Map(Object.entries(HOME_COLUMNS).flatMap(([color, cells]) => cells.map((cell) => [cellKey(cell), color])))
  const startByIndex = new Map(Object.entries(START_IDX).map(([color, index]) => [index, color]))
  const currentOrigin = BASE_ORIGINS[currentPlayer.color]
  const diceStyle = { left: `${((currentOrigin[1] + 2.5) / 15) * 100}%`, top: `${((currentOrigin[0] + 2.5) / 15) * 100}%`, '--dice-size': `${(1.2 / 15) * 100}%` }

  return <div className="board-wrap"><div className="board" aria-label="Ludo board">{Array.from({ length: 225 }, (_, index) => { const row = Math.floor(index / 15); const col = index % 15; const key = `${row},${col}`; const trackIndex = trackByCell.get(key); const homeColor = homeByCell.get(key); const startColor = trackIndex === undefined ? undefined : startByIndex.get(trackIndex); const isCenter = row >= 6 && row <= 8 && col >= 6 && col <= 8; const baseColor = TURN_ORDER.find((color) => { const [baseRow, baseCol] = BASE_ORIGINS[color]; return row >= baseRow && row < baseRow + 6 && col >= baseCol && col < baseCol + 6 }); const stopperColor = trackIndex === undefined ? undefined : STOPPER_COLORS[trackIndex]; return <div className={`board-cell ${trackIndex !== undefined ? 'track-cell' : ''} ${homeColor ? `home-cell ${homeColor}` : ''} ${startColor ? `start-cell ${startColor}` : ''} ${isCenter ? 'center-cell' : ''} ${baseColor ? `base-cell ${baseColor}` : ''}`} key={key}>{trackIndex !== undefined && (SAFE_IDX.includes(trackIndex) || startColor) && <span className={`star ${stopperColor ? `stopper stopper-${stopperColor}` : ''}`}>★</span>}</div> })}<div className="base-inner red" /><div className="base-inner green" /><div className="base-inner yellow" /><div className="base-inner blue" /><div className="center-finish" aria-hidden="true"><span className="finish-triangle finish-red" /><span className="finish-triangle finish-green" /><span className="finish-triangle finish-yellow" /><span className="finish-triangle finish-blue" /></div><Dice value={dice.value} rolling={dice.rolling} color={COLORS[currentPlayer.color].hex} onRoll={onRoll} disabled={!canRoll} style={diceStyle} />{[...tokenGroups.entries()].map(([key, group]) => group.map((token, index) => { const [row, col] = token.cell; const movableToken = token.color === currentPlayer.color && movable.includes(token.tokenIndex); const isMoving = animation && token.color === currentPlayer.color && token.tokenIndex === animation.tokenIndex; const size = group.length === 1 ? 1 : group.length === 2 ? 0.72 : 0.52; const offsets = group.length === 1 ? [[0, 0]] : group.length === 2 ? [[-0.18, 0], [0.18, 0]] : [[-0.16, -0.16], [0.16, -0.16], [-0.16, 0.16], [0.16, 0.16]]; const [dx, dy] = offsets[index] || [0, 0]; return <Token key={`${key}-${token.color}-${token.tokenIndex}`} color={token.color} tokenIndex={token.tokenIndex} row={row + dy} col={col + dx} scale={size} movable={movableToken} moving={isMoving} onClick={() => onMove(token.tokenIndex)} /> }))}</div></div>
}
