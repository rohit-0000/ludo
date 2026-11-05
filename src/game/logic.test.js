import { describe, expect, it } from 'vitest'
import { SAFE_IDX, START_IDX, STOPPER_COLORS, TRACK } from './constants'
import { applyMove, canMove, getCell, getMovableTokens, getTrackIdx, isProtected } from './logic'
import { reducer, selectionForColors } from './reducer'

const player = (color, tokens = [-1, -1, -1, -1], rank = null) => ({ color, name: color, tokens, rank })
const playingState = (players, overrides = {}) => ({ phase: 'playing', players, currentIdx: 0, dice: { value: null, rolling: false }, turnStage: 'awaitRoll', sixStreak: 0, bonusPending: false, movable: [], message: '', rankings: [], ...overrides })

describe('board geometry', () => {
  it('has 52 unique track cells with exact starts and stars', () => {
    expect(TRACK).toHaveLength(52)
    expect(new Set(TRACK.map((cell) => cell.join(','))).size).toBe(52)
    expect(Object.values(START_IDX).map((index) => TRACK[index])).toEqual([[6, 1], [1, 8], [8, 13], [13, 6]])
    expect(SAFE_IDX).toEqual([8, 21, 34, 47])
    expect(SAFE_IDX.map((index) => STOPPER_COLORS[index])).toEqual(['red', 'green', 'yellow', 'blue'])
  })

  it('maps base, track, home and center progress to cells', () => {
    expect(getCell('red', -1, 0)).toEqual([1, 1])
    expect(getCell('red', -1, 1)).toEqual([1, 4])
    expect(getCell('red', -1, 2)).toEqual([4, 1])
    expect(getCell('green', 0)).toEqual([1, 8])
    expect(getCell('yellow', 51)).toEqual([7, 13])
    expect(getCell('blue', 56)).toEqual([8, 7])
  })
})

describe('movement and protection', () => {
  it('only lets a base token leave on six and requires exact finish', () => {
    expect(canMove(-1, 5)).toBe(false)
    expect(canMove(-1, 6)).toBe(true)
    expect(canMove(55, 1)).toBe(true)
    expect(canMove(55, 2)).toBe(false)
    expect(getMovableTokens(player('red', [-1, 55, 54, 56]), 1)).toEqual([1, 2])
  })

  it('captures on a normal track square', () => {
    const state = playingState([player('red', [0, -1, -1, -1]), player('blue', [14, -1, -1, -1])])
    const result = applyMove(state, 0, 1)
    expect(result.captured).toBe(true)
    expect(result.players[1].tokens[0]).toBe(-1)
  })

  it('protects stars, starts and opponent blocks', () => {
    const safeState = playingState([player('red'), player('blue')])
    expect(isProtected(safeState, 8, 'red')).toBe(true)
    expect(isProtected(safeState, START_IDX.green, 'red')).toBe(true)
    const blockState = playingState([player('red'), player('blue', [14, 14, -1, -1])])
    expect(isProtected(blockState, getTrackIdx('blue', 14), 'red')).toBe(true)
  })
})

describe('turn reducer', () => {
  it('uses opposite colors for a two-player setup', () => {
    expect(selectionForColors(['red', 'yellow']).map((item) => item.color)).toEqual(['red', 'yellow'])
    expect(selectionForColors(['green', 'blue']).map((item) => item.color)).toEqual(['green', 'blue'])
  })

  it('forfeits the third consecutive six', () => {
    const state = playingState([player('red'), player('green')], { sixStreak: 2 })
    const next = reducer(state, { type: 'ROLL_RESULT', value: 6 })
    expect(next.currentIdx).toBe(1)
    expect(next.sixStreak).toBe(0)
    expect(next.message).toContain('three sixes')
  })

  it('keeps the turn for capture and home bonuses', () => {
    const captureState = playingState([player('red', [0, -1, -1, -1]), player('blue', [14, -1, -1, -1])], { dice: { value: 1, rolling: false }, turnStage: 'awaitMove', movable: [0] })
    expect(reducer(captureState, { type: 'MOVE_TOKEN', tokenIndex: 0 }).currentIdx).toBe(0)
    const homeState = playingState([player('red', [55, -1, -1, -1]), player('blue')], { dice: { value: 1, rolling: false }, turnStage: 'awaitMove', movable: [0] })
    expect(reducer(homeState, { type: 'MOVE_TOKEN', tokenIndex: 0 }).bonusPending).toBe(true)
  })

  it('skips ranked players', () => {
    const state = playingState([player('red', [-1, -1, -1, -1], 1), player('green'), player('yellow')], { turnStage: 'animating' })
    const next = reducer(state, { type: 'PASS_NO_MOVE' })
    expect(next.currentIdx).toBe(1)
    const second = reducer({ ...next, currentIdx: 1, turnStage: 'animating' }, { type: 'PASS_NO_MOVE' })
    expect(second.currentIdx).toBe(2)
  })
})
