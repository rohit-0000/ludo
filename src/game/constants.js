export const COLORS = {
  red: { key: 'red', label: 'Red', hex: '#e53935', tint: '#ffebee', startIdx: 0 },
  green: { key: 'green', label: 'Green', hex: '#43a047', tint: '#e8f5e9', startIdx: 13 },
  yellow: { key: 'yellow', label: 'Yellow', hex: '#fdd835', tint: '#fffde7', startIdx: 26 },
  blue: { key: 'blue', label: 'Blue', hex: '#1e88e5', tint: '#e3f2fd', startIdx: 39 },
}

export const TURN_ORDER = ['red', 'green', 'yellow', 'blue']
export const START_IDX = Object.fromEntries(TURN_ORDER.map((color) => [color, COLORS[color].startIdx]))

export const TRACK = [
  [6, 1], [6, 2], [6, 3], [6, 4], [6, 5],
  [5, 6], [4, 6], [3, 6], [2, 6], [1, 6], [0, 6], [0, 7],
  [0, 8], [1, 8], [2, 8], [3, 8], [4, 8], [5, 8],
  [6, 9], [6, 10], [6, 11], [6, 12], [6, 13], [6, 14], [7, 14],
  [8, 14], [8, 13], [8, 12], [8, 11], [8, 10], [8, 9],
  [9, 8], [10, 8], [11, 8], [12, 8], [13, 8], [14, 8], [14, 7],
  [14, 6], [13, 6], [12, 6], [11, 6], [10, 6], [9, 6],
  [8, 5], [8, 4], [8, 3], [8, 2], [8, 1], [8, 0], [7, 0], [6, 0],
]

if (TRACK.length !== 52 || new Set(TRACK.map(([row, col]) => `${row},${col}`)).size !== 52) {
  throw new Error('TRACK must contain 52 unique cells')
}

export const SAFE_IDX = [8, 21, 34, 47]
// Safe stoppers use the requested rotated color order.
export const STOPPER_COLORS = { 8: 'red', 21: 'green', 34: 'yellow', 47: 'blue' }
export const SAFE_SQUARES = new Set([...SAFE_IDX, ...Object.values(START_IDX)])

export const HOME_COLUMNS = {
  red: [[7, 1], [7, 2], [7, 3], [7, 4], [7, 5]],
  green: [[1, 7], [2, 7], [3, 7], [4, 7], [5, 7]],
  yellow: [[7, 13], [7, 12], [7, 11], [7, 10], [7, 9]],
  blue: [[13, 7], [12, 7], [11, 7], [10, 7], [9, 7]],
}

export const BASE_SLOTS = {
  red: [[1, 1], [1, 4], [4, 1], [4, 4]],
  green: [[1, 10], [1, 13], [4, 10], [4, 13]],
  yellow: [[10, 10], [10, 13], [13, 10], [13, 13]],
  blue: [[10, 1], [10, 4], [13, 1], [13, 4]],
}

export const CENTER_POSITIONS = {
  red: [7, 6],
  green: [6, 7],
  yellow: [7, 8],
  blue: [8, 7],
}

export const BASE_ORIGINS = {
  red: [0, 0], green: [0, 9], yellow: [9, 9], blue: [9, 0],
}

export const AUTO_MOVE_DELAY = 450
export const NO_MOVE_DELAY = 1000
export const STEP_MS = 175
