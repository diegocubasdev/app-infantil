const preferredVoiceWords = ['maria', 'francisca', 'luciana', 'female', 'google', 'brasil']

function findPortugueseVoice() {
  const voices = window.speechSynthesis?.getVoices?.() ?? []
  const portugueseVoices = voices.filter((voice) => voice.lang.toLowerCase().startsWith('pt'))

  return (
    portugueseVoices.find((voice) =>
      preferredVoiceWords.some((word) => voice.name.toLowerCase().includes(word)),
    ) ??
    portugueseVoices.find((voice) => voice.lang.toLowerCase().startsWith('pt-br')) ??
    portugueseVoices[0] ??
    voices[0]
  )
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

  const cleanText = text.replace(/\s+/g, ' ').trim()

  if (!cleanText) {
    return false
  }

  window.speechSynthesis.cancel()

  const utterance = new SpeechSynthesisUtterance(cleanText)
  const voice = findPortugueseVoice()

  utterance.lang = voice?.lang ?? 'pt-BR'
  utterance.voice = voice ?? null
  utterance.pitch = 1.32
  utterance.rate = 0.76
  utterance.volume = 1
  utterance.onend = () => onEnd?.()
  utterance.onerror = () => onEnd?.()

  window.speechSynthesis.speak(utterance)
  return true
}

export const speakKidText = speak
