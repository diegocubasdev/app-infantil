const feminineVoiceWords = [
  'maria',
  'francisca',
  'luciana',
  'helena',
  'leticia',
  'female',
  'feminina',
  'mulher',
  'woman',
]

const qualityVoiceWords = ['google', 'microsoft', 'natural', 'neural', 'premium', 'apple', 'brasil']
const masculineVoiceWords = ['daniel', 'ricardo', 'felipe', 'male', 'masculina', 'homem', 'man']

function scoreVoice(voice: SpeechSynthesisVoice) {
  const name = voice.name.toLowerCase()
  const lang = voice.lang.toLowerCase()
  let score = 0

  if (lang === 'pt-br') {
    score += 100
  } else if (lang.startsWith('pt')) {
    score += 70
  }

  if (feminineVoiceWords.some((word) => name.includes(word))) {
    score += 80
  }

  if (qualityVoiceWords.some((word) => name.includes(word))) {
    score += 20
  }

  if (masculineVoiceWords.some((word) => name.includes(word))) {
    score -= 60
  }

  if (voice.localService) {
    score += 5
  }

  return score
}

function findKidFriendlyFemaleVoice() {
  const voices = window.speechSynthesis?.getVoices?.() ?? []

  return [...voices].sort((a, b) => scoreVoice(b) - scoreVoice(a))[0]
}

function prepareKidText(text: string) {
  return text
    .replace(/\s+/g, ' ')
    .replace(/\bvoce\b/gi, 'você')
    .replace(/\besta\b/gi, 'está')
    .replace(/\bhistoria\b/gi, 'história')
    .replace(/\bmusica\b/gi, 'música')
    .trim()
}

export function getKidVoiceStatus() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

export function stopSpeaking() {
  if (!getKidVoiceStatus()) {
    return
  }

  window.speechSynthesis.cancel()
}

export function speak(text: string, onEnd?: () => void) {
  if (!getKidVoiceStatus()) {
    return false
  }

  const cleanText = prepareKidText(text)

  if (!cleanText) {
    return false
  }

  window.speechSynthesis.cancel()

  const utterance = new SpeechSynthesisUtterance(cleanText)
  const voice = findKidFriendlyFemaleVoice()

  utterance.lang = voice?.lang?.toLowerCase().startsWith('pt') ? voice.lang : 'pt-BR'
  utterance.voice = voice ?? null
  utterance.pitch = 1.42
  utterance.rate = 0.72
  utterance.volume = 1
  utterance.onend = () => onEnd?.()
  utterance.onerror = () => onEnd?.()

  window.speechSynthesis.speak(utterance)
  return true
}

export const speakKidText = speak
