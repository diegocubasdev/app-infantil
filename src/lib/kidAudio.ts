import { useEffect, useState } from 'react'

let audioContext: AudioContext | null = null
let musicTimer: number | null = null
let musicEnabled = true
let melodyIndex = 0
const listeners = new Set<(enabled: boolean) => void>()

const melodies = [
  [523, 659, 784, 659, 587, 698, 784, 523],
  [392, 523, 587, 659, 587, 523, 440, 392],
  [659, 698, 784, 880, 784, 698, 659, 523],
  [523, 587, 659, 523, 659, 784, 698, 587],
]

function getPreferredMusicState() {
  const saved = window.localStorage.getItem('kid-music-enabled')
  return saved ? saved === 'true' : true
}

function getAudioContext() {
  const audioWindow = window as Window & {
    webkitAudioContext?: typeof AudioContext
  }
  const AudioContextClass = window.AudioContext ?? audioWindow.webkitAudioContext

  if (!AudioContextClass) {
    return null
  }

  audioContext ??= new AudioContextClass()
  return audioContext
}

function notify() {
  listeners.forEach((listener) => listener(musicEnabled))
}

async function resumeAudio() {
  const context = getAudioContext()

  if (!context) {
    return null
  }

  if (context.state === 'suspended') {
    await context.resume()
  }

  return context
}

function playTone(frequency: number, duration = 0.16, volume = 0.05, delay = 0) {
  const context = getAudioContext()

  if (!context) {
    return
  }

  const startsAt = context.currentTime + delay
  const oscillator = context.createOscillator()
  const gain = context.createGain()

  oscillator.type = 'sine'
  oscillator.frequency.setValueAtTime(frequency, startsAt)
  gain.gain.setValueAtTime(0.0001, startsAt)
  gain.gain.exponentialRampToValueAtTime(volume, startsAt + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.0001, startsAt + duration)

  oscillator.connect(gain)
  gain.connect(context.destination)
  oscillator.start(startsAt)
  oscillator.stop(startsAt + duration + 0.03)
}

function playMusicBar() {
  const melody = melodies[melodyIndex % melodies.length]
  melodyIndex += 1
  melody.forEach((note, index) => playTone(note, 0.22, 0.017, index * 0.28))
}

export async function ensureAudioStarted() {
  await resumeAudio()

  if (getPreferredMusicState() && !musicTimer) {
    await startBackgroundMusic()
  }
}

export function playTapSound() {
  void ensureAudioStarted()
  playTone(660, 0.09, 0.035)
}

export function playSuccessSound() {
  void ensureAudioStarted()
  playTone(523, 0.12, 0.045)
  playTone(659, 0.14, 0.045, 0.1)
  playTone(784, 0.18, 0.05, 0.22)
}

export function playGentleSound() {
  void ensureAudioStarted()
  playTone(392, 0.12, 0.035)
  playTone(494, 0.16, 0.035, 0.12)
}

export async function startBackgroundMusic() {
  const context = await resumeAudio()

  if (!context) {
    return false
  }

  if (musicTimer) {
    musicEnabled = true
    notify()
    return true
  }

  musicEnabled = true
  window.localStorage.setItem('kid-music-enabled', 'true')
  playMusicBar()
  musicTimer = window.setInterval(playMusicBar, 2600)
  notify()
  return true
}

export function stopBackgroundMusic() {
  if (musicTimer) {
    window.clearInterval(musicTimer)
    musicTimer = null
  }

  musicEnabled = false
  window.localStorage.setItem('kid-music-enabled', 'false')
  notify()
}

export function useKidAudio() {
  const [isMusicOn, setIsMusicOn] = useState(() => getPreferredMusicState())

  useEffect(() => {
    musicEnabled = getPreferredMusicState()
    listeners.add(setIsMusicOn)
    return () => {
      listeners.delete(setIsMusicOn)
    }
  }, [])

  async function toggleMusic() {
    playTone(660, 0.09, 0.035)

    if (musicEnabled && musicTimer) {
      stopBackgroundMusic()
      return
    }

    await startBackgroundMusic()
  }

  return {
    isMusicOn,
    toggleMusic,
    playTapSound,
    playSuccessSound,
    playGentleSound,
    ensureAudioStarted,
  }
}
