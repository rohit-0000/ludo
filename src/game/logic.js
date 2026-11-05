import { BASE_SLOTS, CENTER_POSITIONS, COLORS, HOME_COLUMNS, SAFE_SQUARES, START_IDX, TRACK } from './constants'

export function getTrackIdx(color, progress) {
  if (progress < 0 || progress > 50) return null
  return (START_IDX[color] + progress) % TRACK.length
}

export function getCell(color, progress, tokenIndex = 0) {
  if (progress === -1) return BASE_SLOTS[color][tokenIndex]
  if (progress === 56) return CENTER_POSITIONS[color]
  if (progress >= 51) return HOME_COLUMNS[color][progress - 51]
  return TRACK[getTrackIdx(color, progress)]
}

export function canMove(progress, roll) {
  if (progress === -1) return roll === 6
  return progress + roll <= 56
}

export function getMovableTokens(player, roll) {
  return player.tokens.reduce((movable, progress, index) => {
    if (canMove(progress, roll)) movable.push(index)
    return movable
  }, [])
}

export function isProtected(state, trackIdx, moverColor) {
  if (SAFE_SQUARES.has(trackIdx)) return true
  return state.players.some((player) => {
    if (player.color === moverColor) return false
    return player.tokens.filter((progress) => getTrackIdx(player.color, progress) === trackIdx).length >= 2
  })
}

export function nextPlayerIdx(players, currentIdx) {
  for (let offset = 1; offset <= players.length; offset += 1) {
    const index = (currentIdx + offset) % players.length
    if (players[index].rank === null) return index
  }
  return currentIdx
}

export function applyMove(state, tokenIndex, roll) {
  const currentPlayer = state.players[state.currentIdx]
  const previousProgress = currentPlayer.tokens[tokenIndex]
  const nextProgress = previousProgress === -1 ? 0 : previousProgress + roll
  const players = state.players.map((player) => ({ ...player, tokens: [...player.tokens] }))
  players[state.currentIdx].tokens[tokenIndex] = nextProgress
  const landedTrackIdx = getTrackIdx(currentPlayer.color, nextProgress)
  let captured = false

  if (landedTrackIdx !== null && !isProtected({ ...state, players }, landedTrackIdx, currentPlayer.color)) {
    players.forEach((player, playerIndex) => {
      if (playerIndex === state.currentIdx) return
      player.tokens = player.tokens.map((progress) => {
        if (getTrackIdx(player.color, progress) === landedTrackIdx) {
          captured = true
          return -1
        }
        return progress
      })
    })
  }

  const reachedHome = previousProgress !== 56 && nextProgress === 56
  return { players, captured, reachedHome, nextProgress }
}

export function randomRoll(random = Math.random) {
  return Math.floor(random() * 6) + 1
}

export function createPlayers(selections) {
  return selections.map(({ color, name }) => ({
    color,
    name: name.trim() || COLORS[color].label,
    tokens: [-1, -1, -1, -1],
    rank: null,
  }))
}
