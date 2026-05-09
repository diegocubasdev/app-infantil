import { useState } from 'react'
import { CelebrationOverlay } from '../../components/CelebrationOverlay'
import { GameShell } from '../../components/GameShell'
import { KidCard } from '../../components/KidCard'
import { ProgressStars } from '../../components/ProgressStars'
import { useCelebration } from '../../hooks/useCelebration'
import { playSuccessSound, playTapSound } from '../../lib/kidAudio'
import { speakKidText } from '../../lib/speech'

type MusicGameProps = {
  onBack: () => void
}

const instruments = [
  { emoji: '🥁', name: 'Tambor', sound: 'tum tum' },
  { emoji: '🎹', name: 'Piano', sound: 'plim plim' },
  { emoji: '🎺', name: 'Trompete', sound: 'ta ra ra' },
  { emoji: '🎸', name: 'Violão', sound: 'dim dom' },
  { emoji: '🔔', name: 'Sino', sound: 'din don' },
  { emoji: '👏', name: 'Palmas', sound: 'clap clap' },
]

export function MusicGame({ onBack }: MusicGameProps) {
  const [sequence, setSequence] = useState<string[]>([])
  const [message, setMessage] = useState('Toque nos instrumentos.')
  const { isCelebrating, celebrate } = useCelebration()

  function playInstrument(instrument: (typeof instruments)[number]) {
    playTapSound()
    playSuccessSound()
    const nextSequence = [...sequence, instrument.emoji].slice(-5)
    setSequence(nextSequence)
    setMessage(`${instrument.name}: ${instrument.sound}!`)
    speakKidText(`${instrument.name}. ${instrument.sound}!`)

    if (nextSequence.length === 5) {
      celebrate()
      speakKidText('Que música bonita!')
    }
  }

  return (
    <GameShell title="Bandinha" onBack={onBack} className="bg-gradient-to-br from-rose-300 to-yellow-400">
      <CelebrationOverlay show={isCelebrating} message="Que música!" />
      <section className="mx-auto grid max-w-6xl gap-5 lg:grid-cols-[1fr_0.7fr]">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {instruments.map((instrument) => (
            <KidCard
              key={instrument.name}
              onClick={() => playInstrument(instrument)}
              className="flex min-h-36 flex-col items-center justify-center gap-3 text-center"
            >
              <span className="text-6xl sm:text-7xl">{instrument.emoji}</span>
              <span className="text-2xl font-black">{instrument.name}</span>
            </KidCard>
          ))}
        </div>

        <div className="flex flex-col items-center justify-center gap-5 rounded-[2rem] bg-white/80 p-5 text-center text-slate-800 shadow-2xl ring-4 ring-white/70">
          <ProgressStars value={sequence.length} total={5} label="Ritmo" />
          <div className="min-h-20 text-5xl">{sequence.join(' ')}</div>
          <p className="text-3xl font-black">{message}</p>
          <button
            type="button"
            onClick={() => {
              playTapSound()
              setSequence([])
              setMessage('Nova música!')
            }}
            className="rounded-3xl bg-yellow-300 px-8 py-4 text-2xl font-black shadow-xl active:scale-95"
          >
            Limpar música
          </button>
        </div>
      </section>
    </GameShell>
  )
}
