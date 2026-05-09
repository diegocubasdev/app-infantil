import { useMemo, useState } from 'react'
import { CelebrationOverlay } from '../../components/CelebrationOverlay'
import { GameShell } from '../../components/GameShell'
import { KidCard } from '../../components/KidCard'
import { ProgressStars } from '../../components/ProgressStars'
import { useCelebration } from '../../hooks/useCelebration'
import { playGentleSound, playSuccessSound, playTapSound } from '../../lib/kidAudio'
import { speakKidText } from '../../lib/speech'

type MemoryGameProps = {
  onBack: () => void
}

const sets = [
  ['🐶', '🐱', '🐻'],
  ['🍎', '🍌', '🥕', '🧁'],
  ['⭐', '🌙', '🌈', '☀️', '💧'],
]

function shuffle<T>(items: T[]) {
  return [...items].sort(() => Math.random() - 0.5)
}

export function MemoryGame({ onBack }: MemoryGameProps) {
  const [round, setRound] = useState(0)
  const [flipped, setFlipped] = useState<number[]>([])
  const [matched, setMatched] = useState<string[]>([])
  const [message, setMessage] = useState('Ache os pares iguais.')
  const { isCelebrating, celebrate } = useCelebration()
  const cards = useMemo(() => shuffle([...sets[round], ...sets[round]]), [round])

  function restart(nextRound = round) {
    playTapSound()
    setRound(nextRound % sets.length)
    setFlipped([])
    setMatched([])
    setMessage('Ache os pares iguais.')
  }

  function flip(index: number) {
    const emoji = cards[index]

    if (matched.includes(emoji) || flipped.includes(index) || flipped.length === 2) {
      return
    }

    playTapSound()
    const nextFlipped = [...flipped, index]
    setFlipped(nextFlipped)

    if (nextFlipped.length === 2) {
      const [first, second] = nextFlipped

      if (cards[first] === cards[second]) {
        const nextMatched = [...matched, emoji]
        setMatched(nextMatched)
        setFlipped([])
        setMessage('Par encontrado!')
        playSuccessSound()
        speakKidText('Par encontrado!')

        if (nextMatched.length === sets[round].length) {
          celebrate()
          setMessage('Memória completa!')
          speakKidText('Memoria completa!')
        }
        return
      }

      playGentleSound()
      setMessage('Quase! Tente lembrar.')
      window.setTimeout(() => setFlipped([]), 700)
    }
  }

  return (
    <GameShell title="Jogo da Memória" onBack={onBack} className="bg-gradient-to-br from-cyan-300 to-blue-500">
      <CelebrationOverlay show={isCelebrating} message="Você lembrou!" />
      <section className="mx-auto max-w-5xl">
        <div className="mb-4 flex flex-wrap items-center justify-center gap-3">
          <ProgressStars value={matched.length} total={sets[round].length} label="Pares" />
          <button
            type="button"
            onClick={() => restart(round + 1)}
            className="rounded-3xl bg-yellow-300 px-6 py-4 text-2xl font-black text-slate-800 shadow-xl active:scale-95"
          >
            Nova rodada
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {cards.map((emoji, index) => {
            const isOpen = flipped.includes(index) || matched.includes(emoji)

            return (
              <KidCard
                key={`${emoji}-${index}`}
                active={isOpen}
                onClick={() => flip(index)}
                className="flex min-h-32 items-center justify-center text-6xl sm:min-h-40 sm:text-7xl"
              >
                {isOpen ? emoji : '❔'}
              </KidCard>
            )
          })}
        </div>
        <div className="mx-auto mt-4 max-w-3xl rounded-3xl bg-white/95 px-6 py-4 text-center text-2xl font-black text-slate-800 shadow-xl sm:text-3xl">
          {message}
        </div>
      </section>
    </GameShell>
  )
}
