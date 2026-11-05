import { COLORS } from '../game/constants'

export default function Token({ color, tokenIndex, row, col, scale = 1, movable, onClick, moving }) {
  const info = COLORS[color]
  return <button type="button" className={`token ${movable ? 'movable' : ''} ${moving ? 'moving' : ''}`} style={{ left: `${((col + 0.5) / 15) * 100}%`, top: `${((row + 0.5) / 15) * 100}%`, '--token-color': info.hex, '--token-tint': info.tint, '--token-scale': scale }} onClick={onClick} disabled={!movable} aria-label={`${info.label} token ${tokenIndex + 1}${movable ? ', can move' : ''}`}><span className="token-shine" /></button>
}
