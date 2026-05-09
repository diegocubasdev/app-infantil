import { useMemo, useState } from 'react'
import { ColorsGame } from './games/colors/ColorsGame'
import { FlappyAnimal } from './games/flappy/FlappyAnimal'
import { MemoryGame } from './games/memory/MemoryGame'
import { MusicGame } from './games/music/MusicGame'
import { PuzzleGame } from './games/puzzle/PuzzleGame'
import { RestaurantGame } from './games/restaurant/RestaurantGame'
import { SchoolGame } from './games/school/SchoolGame'
import { StoryMusic } from './games/story/StoryMusic'
import { useKidAudio } from './lib/kidAudio'
import type { Game, GameId } from './types/game'

const games: Game[] = [
  {
    id: 'flappy',
    title: 'Flappy Animal',
    emoji: '🐦',
    color: 'from-sky-300 to-cyan-500',
    description: 'Voe, troque animal e junte estrelas.',
  },
  {
    id: 'puzzle',
    title: 'Quebra-Cabeça',
    emoji: '🧩',
    color: 'from-fuchsia-300 to-pink-500',
    description: 'Arraste ou toque para encaixar.',
  },
  {
    id: 'restaurant',
    title: 'Restaurante',
    emoji: '🍎',
    color: 'from-orange-300 to-red-400',
    description: 'Monte a bandeja dos amigos.',
  },
  {
    id: 'school',
    title: 'Escolinha',
    emoji: '🔤',
    color: 'from-lime-300 to-emerald-500',
    description: 'Ache letras, números e cores.',
  },
  {
    id: 'story',
    title: 'História e Música',
    emoji: '🌙',
    color: 'from-violet-300 to-indigo-500',
    description: 'Crie, salve e escute histórias.',
  },
  {
    id: 'memory',
    title: 'Memória',
    emoji: '❔',
    color: 'from-cyan-300 to-blue-500',
    description: 'Encontre os pares iguais.',
  },
  {
    id: 'music',
    title: 'Bandinha',
    emoji: '🥁',
    color: 'from-rose-300 to-yellow-400',
    description: 'Toque ritmos e instrumentos.',
  },
  {
    id: 'colors',
    title: 'Cores e Formas',
    emoji: '🎨',
    color: 'from-green-300 to-sky-500',
    description: 'Ache cores no arco-íris.',
  },
]

function renderGame(gameId: GameId, onBack: () => void) {
  const gameById = {
    flappy: <FlappyAnimal onBack={onBack} />,
    puzzle: <PuzzleGame onBack={onBack} />,
    restaurant: <RestaurantGame onBack={onBack} />,
    school: <SchoolGame onBack={onBack} />,
    story: <StoryMusic onBack={onBack} />,
    memory: <MemoryGame onBack={onBack} />,
    music: <MusicGame onBack={onBack} />,
    colors: <ColorsGame onBack={onBack} />,
  }

  return gameById[gameId]
}

export default function App() {
  const [selectedGameId, setSelectedGameId] = useState<GameId | null>(null)
  const { isMusicOn, toggleMusic, playTapSound } = useKidAudio()

  const selectedGame = useMemo(
    () => games.find((game) => game.id === selectedGameId),
    [selectedGameId],
  )

  if (selectedGame) {
    return renderGame(selectedGame.id, () => setSelectedGameId(null))
  }

  return (
    <main className="min-h-dvh overflow-x-hidden bg-gradient-to-br from-yellow-200 via-rose-200 to-sky-300 p-3 sm:p-4 lg:p-6">
      <section className="mx-auto flex min-h-[calc(100dvh-1.5rem)] max-w-7xl flex-col gap-4 sm:min-h-[calc(100dvh-2rem)] lg:min-h-[calc(100dvh-3rem)] lg:gap-6">
        <header className="flex flex-col items-center justify-between gap-3 rounded-[2rem] bg-white/80 px-5 py-4 text-center shadow-xl sm:flex-row sm:px-8 sm:py-5 sm:text-left">
          <div>
            <h1 className="text-4xl font-black text-slate-800 sm:text-5xl">Mundo da Diversão</h1>
            <p className="text-xl font-bold text-slate-600 sm:text-2xl">Escolha uma brincadeira!</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleMusic}
              aria-pressed={isMusicOn}
              className="rounded-3xl bg-yellow-300 px-6 py-4 text-2xl font-black text-slate-800 shadow-xl transition active:scale-95"
            >
              {isMusicOn ? '♪ Ligado' : 'Som'}
            </button>
            <div className="text-5xl sm:text-7xl" aria-hidden="true">
              🌈
            </div>
          </div>
        </header>

        <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {games.map((game) => (
            <button
              key={game.id}
              type="button"
              onClick={() => {
                playTapSound()
                setSelectedGameId(game.id)
              }}
              className={`flex min-h-44 flex-col items-center justify-center gap-3 rounded-[2rem] bg-gradient-to-br ${game.color} p-5 text-white shadow-xl ring-4 ring-white/70 transition hover:scale-[1.02] active:scale-95 sm:min-h-52 lg:p-6`}
            >
              <span className="text-6xl drop-shadow-lg sm:text-7xl" aria-hidden="true">
                {game.emoji}
              </span>
              <span className="text-center text-2xl font-black drop-shadow sm:text-3xl">
                {game.title}
              </span>
              <span className="text-center text-lg font-bold opacity-95 sm:text-xl">
                {game.description}
              </span>
            </button>
          ))}
        </div>
      </section>
    </main>
  )
}
