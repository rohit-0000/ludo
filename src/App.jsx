import { useCallback, useEffect, useReducer, useRef, useState } from 'react'
import { COLORS, AUTO_MOVE_DELAY, NO_MOVE_DELAY, STEP_MS } from './game/constants'
import { randomRoll } from './game/logic'
import { playCaptureSound, playHomeSound, playMoveSound, playNoMoveSound, playRollSound, playWinSound, setMuted } from './game/sound'
import { getPersistedState, reducer, STORAGE_KEY } from './game/reducer'
import SetupScreen from './components/SetupScreen'
import Board from './components/Board'
import PlayerPanel from './components/PlayerPanel'
import Message from './components/Message'
import WinnerModal from './components/WinnerModal'
import './App.css'

function App() {
  const [state, dispatch] = useReducer(reducer, undefined, getPersistedState)
  const [moving, setMoving] = useState(null)
  const [muted, setMutedState] = useState(() => {
    try {
      return window.localStorage.getItem('myludo-sound-muted') === 'true'
    } catch {
      return false
    }
  })
  const timer = useRef(null)
  const moveTimer = useRef(null)
  const movingRef = useRef(false)
  const previousState = useRef(null)

  const animateMove = useCallback((tokenIndex) => {
    if (movingRef.current || state.turnStage !== 'awaitMove' || !state.movable.includes(tokenIndex)) return
    const player = state.players[state.currentIdx]
    const start = player.tokens[tokenIndex]
    const target = start === -1 ? 0 : start + state.dice.value
    const steps = start === -1 ? [0] : Array.from({ length: target - start }, (_, index) => start + index + 1)
    movingRef.current = true
    let stepIndex = 0
    const advance = () => {
      if (stepIndex >= steps.length) {
        movingRef.current = false
        setMoving(null)
        dispatch({ type: 'MOVE_TOKEN', tokenIndex })
        return
      }
      playMoveSound()
      setMoving({ tokenIndex, progress: steps[stepIndex] })
      stepIndex += 1
      moveTimer.current = setTimeout(advance, STEP_MS)
    }
    setMoving({ tokenIndex, progress: start })
    moveTimer.current = setTimeout(advance, STEP_MS)
  }, [dispatch, state.currentIdx, state.dice.value, state.movable, state.players, state.turnStage])

  useEffect(() => () => {
    clearTimeout(timer.current)
    clearTimeout(moveTimer.current)
    movingRef.current = false
  }, [])
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // Storage can be unavailable in private or restricted browser contexts.
    }
  }, [state])
  useEffect(() => {
    setMuted(muted)
    try {
      window.localStorage.setItem('myludo-sound-muted', String(muted))
    } catch {
      // Sound preference can remain in memory if storage is unavailable.
    }
  }, [muted])
  useEffect(() => {
    if (state.phase !== 'playing') return undefined
    if (moving) return undefined
    if (state.turnStage === 'animating') {
      timer.current = setTimeout(() => dispatch({ type: 'PASS_NO_MOVE' }), NO_MOVE_DELAY)
      return () => clearTimeout(timer.current)
    }
    if (state.turnStage === 'awaitMove' && state.movable.length === 1) {
      timer.current = setTimeout(() => animateMove(state.movable[0]), AUTO_MOVE_DELAY)
      return () => clearTimeout(timer.current)
    }
    return undefined
  }, [animateMove, moving, state.phase, state.turnStage, state.movable])
  useEffect(() => {
    const previous = previousState.current
    if (previous && state !== previous) {
      if (state.message.includes('captured')) playCaptureSound()
      else if (state.message.includes('finished')) playWinSound()
      else if (state.message.includes('brought')) playHomeSound()
      else if (state.message.includes('No legal move')) playNoMoveSound()
    }
    previousState.current = state
  }, [state])

  const roll = () => {
    if (state.turnStage !== 'awaitRoll' || state.dice.rolling) return
    playRollSound()
    dispatch({ type: 'ROLL_START' })
    timer.current = setTimeout(() => dispatch({ type: 'ROLL_RESULT', value: randomRoll() }), 700)
  }
  const newGame = () => { if (window.confirm('Restart this match? Your current game will be lost.')) dispatch({ type: 'SETUP' }) }
  if (state.phase === 'setup') return <SetupScreen onStart={(selections) => dispatch({ type: 'START_GAME', selections })} />
  const currentPlayer = state.players[state.currentIdx]

  return <main className="game-shell"><header className="game-header"><div><p className="eyebrow">Local match</p><h1>Ludo</h1></div><div className="header-actions"><button type="button" className="ghost-button sound-toggle" onClick={() => setMutedState((value) => !value)} aria-pressed={muted}>{muted ? 'Unmute' : 'Mute'} <span aria-hidden="true">{muted ? '🔇' : '🔊'}</span></button><button type="button" className="ghost-button" onClick={newGame}>New game <span aria-hidden="true">↗</span></button></div></header><div className="turn-banner" style={{ '--active-color': COLORS[currentPlayer.color].hex }}><span className="turn-badge" /> <strong>{currentPlayer.name}</strong><span>to move</span><span className="turn-color">{COLORS[currentPlayer.color].label}</span></div><div className="game-layout"><PlayerPanel players={state.players} currentIdx={state.currentIdx} rankings={state.rankings} /><section className="board-column"><Board players={state.players} currentPlayer={currentPlayer} dice={state.dice} movable={moving ? [] : state.movable} animation={moving} canRoll={state.turnStage === 'awaitRoll' && !state.dice.rolling && !moving} onRoll={roll} onMove={animateMove} /><Message>{state.message}</Message></section></div>{state.phase === 'finished' && <WinnerModal rankings={state.rankings} players={state.players} onPlayAgain={() => dispatch({ type: 'SETUP' })} />}</main>
}

export default App
