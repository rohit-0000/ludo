import { COLORS } from '../game/constants'

export default function WinnerModal({ rankings, players, onPlayAgain }) {
  const allRanks = [...rankings, ...players.filter((player) => !rankings.some((rank) => rank.color === player.color)).map((player, index) => ({ ...player, rank: rankings.length + index + 1 }))]
  return <div className="winner-backdrop"><section className="winner-modal" role="dialog" aria-modal="true" aria-labelledby="winner-title"><p className="eyebrow">Match complete</p><h2 id="winner-title">The board has a winner.</h2><p className="winner-copy">Every remaining finish is locked in. Here is how the table landed.</p><div className="ranking-list">{allRanks.map((rank) => <div className={`ranking-row rank-${rank.rank}`} key={rank.color}><strong>{rank.rank}</strong><span className="ranking-swatch" style={{ backgroundColor: COLORS[rank.color].hex }} /><span>{rank.name}</span>{rank.rank === 1 && <em>Winner</em>}</div>)}</div><button type="button" className="primary-button" onClick={onPlayAgain}>Play again <span aria-hidden="true">↗</span></button></section></div>
}
