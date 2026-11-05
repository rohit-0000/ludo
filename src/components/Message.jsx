export default function Message({ children }) {
  return <p className="game-message" aria-live="polite">{children}</p>
}
