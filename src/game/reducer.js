import { COLORS, TURN_ORDER } from './constants'
import { applyMove, createPlayers, getMovableTokens, nextPlayerIdx } from './logic'

export const initialState = {
  phase: 'setup',
  players: [],
  currentIdx: 0,
  dice: { value: null, rolling: false },
  turnStage: 'awaitRoll',
  sixStreak: 0,
  bonusPending: false,
  movable: [],
  message: '',
  rankings: [],
}

export const STORAGE_KEY = 'myludo-game-state'

export function getPersistedState() {
  if (typeof window === 'undefined') return initialState
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY)
    if (!saved) return initialState
    const parsed = JSON.parse(saved)
    if (!parsed || !Array.isArray(parsed.players) || !['setup', 'playing', 'finished'].includes(parsed.phase)) return initialState
    if (parsed.dice?.rolling) parsed.dice.rolling = false
    return { ...initialState, ...parsed, dice: { ...initialState.dice, ...parsed.dice, rolling: false } }
  } catch {
    return initialState
  }
}

function nextStateAfterTurn(state, bonus, message) {
  const activeCount = state.players.filter((player) => player.rank === null).length
  if (activeCount <= 1) return { ...state, phase: 'finished', turnStage: 'awaitRoll', bonusPending: false, movable: [], message }
  if (bonus) return { ...state, turnStage: 'awaitRoll', bonusPending: true, movable: [], message }
  const nextIdx = nextPlayerIdx(state.players, state.currentIdx)
  return { ...state, currentIdx: nextIdx, turnStage: 'awaitRoll', sixStreak: 0, bonusPending: false, movable: [], message }
}

export function reducer(state, action) {
  switch (action.type) {
    case 'START_GAME': {
      const players = createPlayers(action.selections)
      return { ...initialState, phase: 'playing', players, message: `${players[0].name}'s turn. Roll the dice.` }
    }
    case 'ROLL_START':
      return { ...state, dice: { ...state.dice, rolling: true } }
    case 'ROLL_RESULT': {
      if (state.turnStage !== 'awaitRoll') return state
      const value = action.value
      const sixStreak = value === 6 ? state.sixStreak + 1 : 0
      if (value === 6 && sixStreak >= 3) {
        const nextIdx = nextPlayerIdx(state.players, state.currentIdx)
        return {
          ...state,
          dice: { value, rolling: false },
          currentIdx: nextIdx,
          sixStreak: 0,
          turnStage: 'awaitRoll',
          bonusPending: false,
          movable: [],
          message: `${state.players[state.currentIdx].name} rolled three sixes. The turn is forfeited.`,
        }
      }
      const player = state.players[state.currentIdx]
      const movable = getMovableTokens(player, value)
      return {
        ...state,
        dice: { value, rolling: false },
        sixStreak,
        movable,
        turnStage: movable.length ? 'awaitMove' : 'animating',
        bonusPending: !movable.length && value === 6,
        message: movable.length ? `${player.name} rolled ${value}. Choose a token.` : `${player.name} rolled ${value}. No legal move.`,
      }
    }
    case 'MOVE_TOKEN': {
      if (state.turnStage !== 'awaitMove' || !state.movable.includes(action.tokenIndex)) return state
      const player = state.players[state.currentIdx]
      const result = applyMove(state, action.tokenIndex, state.dice.value)
      const players = result.players
      const movedPlayer = players[state.currentIdx]
      let rankings = state.rankings
      let message = result.captured ? `${player.name} captured a token!` : `${player.name} moved token ${action.tokenIndex + 1}.`
      let rank = movedPlayer.rank
      if (movedPlayer.tokens.every((progress) => progress === 56) && rank === null) {
        rank = rankings.length + 1
        movedPlayer.rank = rank
        rankings = [...rankings, { color: player.color, name: player.name, rank }]
        message = `${player.name} finished in ${rank}${rank === 1 ? 'st' : rank === 2 ? 'nd' : rank === 3 ? 'rd' : 'th'} place!`
      } else if (result.reachedHome) {
        message = `${player.name} brought a token home.`
      }
      const bonus = !rank && (state.dice.value === 6 || result.captured || result.reachedHome)
      const next = nextStateAfterTurn({ ...state, players, rankings }, bonus, message)
      return { ...next, dice: { ...state.dice, rolling: false } }
    }
    case 'PASS_NO_MOVE': {
      if (state.turnStage !== 'animating') return state
      if (state.bonusPending) return { ...state, turnStage: 'awaitRoll', movable: [], bonusPending: false, message: `${state.players[state.currentIdx].name} gets another roll for the six.` }
      const nextIdx = nextPlayerIdx(state.players, state.currentIdx)
      return { ...state, currentIdx: nextIdx, turnStage: 'awaitRoll', sixStreak: 0, bonusPending: false, movable: [], message: `${state.players[nextIdx].name}'s turn. Roll the dice.` }
    }
    case 'SETUP':
      return initialState
    default:
      return state
  }
}

export function selectionForColors(colors) {
  return colors.map((color, index) => ({ color, name: `${COLORS[color].label} player ${index + 1}` }))
}

export { TURN_ORDER }
