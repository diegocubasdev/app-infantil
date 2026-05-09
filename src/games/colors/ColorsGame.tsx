import { useState } from 'react'
import { CelebrationOverlay } from '../../components/CelebrationOverlay'
import { GameShell } from '../../components/GameShell'
import { KidCard } from '../../components/KidCard'
import { ProgressStars } from '../../components/ProgressStars'
import { useCelebration } from '../../hooks/useCelebration'
import { playGentleSound, playSuccessSound, playTapSound } from '../../lib/kidAudio'
import { speakKidText } from '../../lib/speech'

type ColorsGameProps = {
  onBack: () => void
}

const colors = [
  { name: 'Azul', emoji: '💧', className: 'bg-blue-500 text-white' },
  { name: 'Vermelho', emoji: '🍓', className: 'bg-red-500 text-white' },
  { name: 'Amarelo', emoji: '☀️', className: 'bg-yellow-300 text-slate-800' },
  { name: 'Verde', emoji: '🌿', className: 'bg-green-500 text-white' },
  { name: 'Roxo', emoji: '🍇', className: 'bg-purple-500 text-white' },
  { name: 'Laranja', emoji: '🥕', className: 'bg-orange-500 text-white' },
]

export function ColorsGame({ onBack }: ColorsGameProps) {
  const [targetIndex, setTargetIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [message, setMessage] = useState('Toque na cor pedida.')
  const { isCelebrating, celebrate } = useCelebration()
  const target = colors[targetIndex]

  function chooseColor(index: number) {
    const color = colors[index]

    if (index === targetIndex) {
      const nextScore = Math.min(6, score + 1)
      playSuccessSound()
      setScore(nextScore)
      setMessage(`${color.name}! Muito bem!`)
      speakKidText(`${color.name}! Muito bem!`)
      setTargetIndex((current) => (current + 1) % colors.length)

      if (nextScore === 6) {
        celebrate()
      }
      return
    }

    playGentleSound()
    setMessage(`${color.name}. Agora procure ${target.name}.`)
    speakKidText(`${color.name}. Agora procure ${target.name}.`)
  }

  return (
    <GameShell title="Cores e Formas" onBack={onBack} className="bg-gradient-to-br from-green-300 to-sky-500">
      <CelebrationOverlay show={isCelebrating} message="Arco-íris completo!" />
      <section className="mx-auto grid max-w-6xl gap-5 lg:grid-cols-[0.9fr_1fr]">
        <div className="flex flex-col items-center justify-center gap-5 rounded-[2rem] bg-white/85 p-6 text-center text-slate-800 shadow-2xl ring-4 ring-white/70">
          <ProgressStars value={score} total={6} label="Cores" />
          <p className="text-3xl font-black">Ache a cor</p>
          <div className={`rounded-[2rem] px-10 py-8 text-5xl font-black shadow-xl ${target.className}`}>
            {target.name} {target.emoji}
          </div>
          <p className="text-2xl font-black">{message}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {colors.map((color, index) => (
            <KidCard
              key={color.name}
              onClick={() => {
                playTapSound()
                chooseColor(index)
              }}
              className={`flex min-h-32 flex-col items-center justify-center gap-2 text-center ${color.className}`}
            >
              <span className="text-5xl">{color.emoji}</span>
              <span className="text-2xl font-black">{color.name}</span>
            </KidCard>
          ))}
        </div>
      </section>
    </GameShell>
  )
}
