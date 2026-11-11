import { useState } from 'react'
import { COLORS, TURN_ORDER } from '../game/constants'

const OPPOSITE_PAIRS = [['red', 'yellow'], ['green', 'blue']]

export default function SetupScreen({ onStart }) {
  const [count, setCount] = useState(2)
  const [selected, setSelected] = useState(['red', 'yellow'])
  const [names, setNames] = useState({})

  const changeCount = (nextCount) => {
    setCount(nextCount)
    if (nextCount === 4) setSelected([...TURN_ORDER])
    if (nextCount === 2) {
      const pair = OPPOSITE_PAIRS.find((candidate) =>
        candidate.every((color) => selected.includes(color))
      )
      setSelected(pair || ['red', 'yellow'])
    }
    if (nextCount === 3) setSelected(TURN_ORDER.slice(0, 3))
  }

  const toggleColor = (color) => {
    if (count === 2) {
      const pair = OPPOSITE_PAIRS.find((candidate) => candidate.includes(color))
      setSelected(pair)
      return
    }
    if (count === 4) return
    if (selected.includes(color)) {
      if (selected.length > 2) setSelected(selected.filter((item) => item !== color))
      return
    }
    if (selected.length < count) setSelected([...selected, color])
  }

  const valid = selected.length === count
  const selections = TURN_ORDER.filter((color) => selected.includes(color)).map((color, index) => ({
    color,
    name: names[color]?.trim() || `Player ${index + 1}`,
  }))

  return (
    <main className="setup-screen">
      <div className="setup-hero">
        <p className="eyebrow">Offline hot-seat edition</p>
        <h1>Ludo, gathered around.</h1>
        <p className="intro">A clean local board for bright, competitive rounds. Pick your players, then pass the device.</p>
      </div>
      <section className="setup-card" aria-labelledby="setup-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">New match</p>
            <h2 id="setup-title">Choose your table</h2>
          </div>
          <span className="setup-count">{count} players</span>
        </div>
        <div className="player-count" role="group" aria-label="Number of players">
          {[2, 3, 4].map((option) => <button key={option} type="button" className={count === option ? 'count-option active' : 'count-option'} onClick={() => changeCount(option)}>{option}</button>)}
        </div>
        <div className="color-picker">
          <div className="field-label">Playing colors</div>
          <div className="color-options">
            {TURN_ORDER.map((color) => {
              const info = COLORS[color]
              return <button key={color} type="button" className={`color-option ${selected.includes(color) ? 'selected' : ''}`} style={{ '--swatch': info.hex, '--swatch-tint': info.tint }} onClick={() => toggleColor(color)} aria-pressed={selected.includes(color)}><span className="color-dot" />{info.label}<span className="checkmark">{selected.includes(color) ? '✓' : ''}</span></button>
            })}
          </div>
          {count === 2 && <p className="field-hint">Two players use opposite corners.</p>}
        </div>
        <div className="name-list">
          {selections.map((player, index) => <label className="name-field" key={player.color}><span><i style={{ backgroundColor: COLORS[player.color].hex }} />{COLORS[player.color].label} player</span><input value={names[player.color] || ''} maxLength={18} placeholder={`Player ${index + 1}`} onChange={(event) => setNames({ ...names, [player.color]: event.target.value })} /></label>)}
        </div>
        <button type="button" className="primary-button start-button" disabled={!valid} onClick={() => onStart(selections)}>Start game <span aria-hidden="true">→</span></button>
      </section>
    </main>
  )
}
