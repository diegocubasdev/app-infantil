import { useMemo, useState } from 'react'
import { CelebrationOverlay } from '../../components/CelebrationOverlay'
import { GameShell } from '../../components/GameShell'
import { KidCard } from '../../components/KidCard'
import { ProgressStars } from '../../components/ProgressStars'
import { useCelebration } from '../../hooks/useCelebration'
import { playGentleSound, playSuccessSound, playTapSound } from '../../lib/kidAudio'
import { speakKidText } from '../../lib/speech'

type SchoolGameProps = {
  onBack: () => void
}

type LessonItem = {
  value: string
  friend: string
  phrase: string
  color?: string
}

type Lesson = {
  id: string
  label: string
  title: string
  challengePrefix: string
  items: LessonItem[]
}

const lessons: Lesson[] = [
  {
    id: 'letters',
    label: 'ABC',
    title: 'Letrinhas',
    challengePrefix: 'Ache a letra',
    items: [
      { value: 'A', friend: '🐝', phrase: 'A de abelha' },
      { value: 'B', friend: '⚽', phrase: 'B de bola' },
      { value: 'C', friend: '🏠', phrase: 'C de casa' },
      { value: 'D', friend: '🦕', phrase: 'D de dino' },
      { value: 'E', friend: '⭐', phrase: 'E de estrela' },
      { value: 'F', friend: '🌸', phrase: 'F de flor' },
    ],
  },
  {
    id: 'numbers',
    label: '123',
    title: 'Numeros',
    challengePrefix: 'Conte',
    items: Array.from({ length: 10 }, (_, index) => ({
      value: String(index + 1),
      friend: '⭐'.repeat(index + 1),
      phrase: `${index + 1}! Vamos contar.`,
    })),
  },
  {
    id: 'colors',
    label: 'Cores',
    title: 'Cores',
    challengePrefix: 'Toque no',
    items: [
      { value: 'Azul', friend: '💧', phrase: 'Azul como o ceu', color: 'bg-blue-500 text-white' },
      { value: 'Vermelho', friend: '🍓', phrase: 'Vermelho como morango', color: 'bg-red-500 text-white' },
      { value: 'Amarelo', friend: '☀️', phrase: 'Amarelo como o sol', color: 'bg-yellow-300 text-slate-800' },
      { value: 'Verde', friend: '🌿', phrase: 'Verde como folha', color: 'bg-green-500 text-white' },
    ],
  },
]

export function SchoolGame({ onBack }: SchoolGameProps) {
  const [lessonId, setLessonId] = useState(lessons[0].id)
  const [activeIndex, setActiveIndex] = useState(0)
  const [targetIndex, setTargetIndex] = useState(0)
  const [medals, setMedals] = useState(0)
  const [message, setMessage] = useState('Toque no cartao pedido.')
  const { isCelebrating, celebrate } = useCelebration()

  const lesson = lessons.find((item) => item.id === lessonId) ?? lessons[0]
  const active = lesson.items[activeIndex] ?? lesson.items[0]
  const target = lesson.items[targetIndex] ?? lesson.items[0]
  const challenge = useMemo(
    () => `${lesson.challengePrefix} ${lesson.id === 'numbers' ? target.value : target.value}`,
    [lesson.challengePrefix, lesson.id, target.value],
  )

  function nextTarget() {
    setTargetIndex((current) => (current + 1) % lesson.items.length)
  }

  function selectLesson(nextLesson: Lesson) {
    playTapSound()
    setLessonId(nextLesson.id)
    setActiveIndex(0)
    setTargetIndex(0)
    setMedals(0)
    setMessage(`Vamos aprender ${nextLesson.title}.`)
    speakKidText(`Vamos aprender ${nextLesson.title}.`)
  }

  function selectItem(item: LessonItem, index: number) {
    setActiveIndex(index)

    if (index === targetIndex) {
      const nextMedals = Math.min(5, medals + 1)
      setMedals(nextMedals)
      playSuccessSound()
      setMessage(item.phrase)
      speakKidText(`Muito bem! ${item.phrase}`)
      nextTarget()

      if (nextMedals === 5) {
        celebrate()
      }
      return
    }

    playGentleSound()
    setMessage(`${item.phrase}. Agora procure ${target.value}.`)
    speakKidText(`${item.phrase}. Agora procure ${target.value}.`)
  }

  function nextItem() {
    playTapSound()
    const nextIndex = (activeIndex + 1) % lesson.items.length
    const item = lesson.items[nextIndex]
    setActiveIndex(nextIndex)
    setMessage(item.phrase)
    speakKidText(item.phrase)
  }

  return (
    <GameShell
      title="Escolinha"
      onBack={onBack}
      className="bg-gradient-to-br from-lime-300 via-emerald-400 to-teal-400"
    >
      <CelebrationOverlay show={isCelebrating} message="Você ganhou medalhas!" />
      <section className="grid gap-5 lg:min-h-[calc(100dvh-8rem)] lg:grid-cols-[1fr_1.05fr] lg:gap-6">
        <div className="flex flex-col gap-4 rounded-[2rem] bg-white/35 p-4 shadow-2xl ring-4 ring-white/60 lg:p-6">
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            {lessons.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => selectLesson(item)}
                className={`rounded-3xl px-4 py-4 text-2xl font-black shadow-xl transition active:scale-95 sm:text-3xl ${
                  item.id === lessonId ? 'bg-yellow-300 text-slate-800 ring-4 ring-white' : 'bg-white/90 text-slate-700'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="rounded-3xl bg-white/95 px-5 py-4 text-center text-2xl font-black text-slate-800 shadow-xl">
            {challenge}
          </div>

          <div className="grid flex-1 grid-cols-2 gap-4 sm:grid-cols-3">
            {lesson.items.map((item, index) => (
              <KidCard
                key={`${lesson.id}-${item.value}`}
                active={activeIndex === index}
                onClick={() => selectItem(item, index)}
                className={`flex min-h-24 items-center justify-center text-3xl font-black sm:text-4xl ${
                  item.color ?? 'bg-white/90 text-slate-800'
                } ${targetIndex === index ? 'ring-yellow-300' : ''}`}
              >
                {item.value}
              </KidCard>
            ))}
          </div>
        </div>

        <div className="flex min-h-80 flex-col items-center justify-center gap-4 rounded-[2rem] bg-white/90 p-5 text-center text-slate-800 shadow-2xl ring-4 ring-white/70 lg:p-6">
          <ProgressStars value={medals} total={5} label="Medalhas" />
          <p className="rounded-full bg-lime-200 px-6 py-3 text-2xl font-black">{lesson.title}</p>
          <div className="text-7xl font-black sm:text-8xl">{active.value}</div>
          <div className="max-w-full overflow-hidden text-7xl leading-tight sm:text-8xl">{active.friend}</div>
          <p className="text-3xl font-black sm:text-4xl">{message}</p>
          <button
            type="button"
            onClick={nextItem}
            className="rounded-3xl bg-yellow-300 px-8 py-4 text-2xl font-black text-slate-800 shadow-xl active:scale-95 sm:text-3xl"
          >
            Explorar
          </button>
        </div>
      </section>
    </GameShell>
  )
}
