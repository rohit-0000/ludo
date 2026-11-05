const PIPS = { 1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 3, 6, 2, 5, 8] }

export default function Dice({ value, rolling, color, onRoll, disabled, style }) {
  const shown = value || 1
  return <button type="button" className={`dice ${rolling ? 'rolling' : ''}`} style={{ ...style, '--dice-color': color }} onClick={onRoll} disabled={disabled} aria-label={disabled ? `Dice showing ${shown}` : `Roll dice, currently showing ${shown}`}>
    <span className="dice-face">{PIPS[shown].map((position) => <i key={position} className="pip" style={{ gridArea: `${Math.floor(position / 3) + 1} / ${(position % 3) + 1}` }} />)}</span>
  </button>
}
