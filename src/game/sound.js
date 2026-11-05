let audioContext
let muted = false

export function setMuted(value) {
  muted = value
}

function getAudioContext() {
  if (typeof window === 'undefined') return null
  const AudioContext = window.AudioContext || window.webkitAudioContext
  if (!AudioContext) return null
  if (!audioContext) audioContext = new AudioContext()
  if (audioContext.state === 'suspended') audioContext.resume()
  return audioContext
}

function tone(frequency, duration, type = 'sine', volume = 0.045, delay = 0) {
  if (muted) return
  const context = getAudioContext()
  if (!context) return
  const oscillator = context.createOscillator()
  const gain = context.createGain()
  const start = context.currentTime + delay
  oscillator.type = type
  oscillator.frequency.setValueAtTime(frequency, start)
  gain.gain.setValueAtTime(0.0001, start)
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.015)
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration)
  oscillator.connect(gain)
  gain.connect(context.destination)
  oscillator.start(start)
  oscillator.stop(start + duration + 0.02)
}

export function playRollSound() {
  tone(180, 0.12, 'square', 0.025)
  tone(260, 0.12, 'square', 0.02, 0.12)
  tone(360, 0.16, 'square', 0.02, 0.24)
}

export function playMoveSound() {
  tone(420, 0.08, 'triangle', 0.035)
}

export function playCaptureSound() {
  tone(220, 0.12, 'sawtooth', 0.035)
  tone(150, 0.18, 'sawtooth', 0.03, 0.1)
}

export function playHomeSound() {
  tone(520, 0.12, 'triangle', 0.04)
  tone(660, 0.18, 'triangle', 0.04, 0.12)
}

export function playWinSound() {
  tone(523, 0.14, 'triangle', 0.045)
  tone(659, 0.14, 'triangle', 0.045, 0.14)
  tone(784, 0.26, 'triangle', 0.05, 0.28)
}

export function playNoMoveSound() {
  tone(180, 0.2, 'sine', 0.025)
}
