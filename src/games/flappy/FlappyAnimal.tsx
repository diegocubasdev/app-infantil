import { useEffect, useRef, useState } from 'react'
import { CelebrationOverlay } from '../../components/CelebrationOverlay'
import { GameShell } from '../../components/GameShell'
import { ProgressStars } from '../../components/ProgressStars'
import { useCelebration } from '../../hooks/useCelebration'
import { useLocalBestScore } from '../../hooks/useLocalBestScore'
import { playGentleSound, playSuccessSound, playTapSound } from '../../lib/kidAudio'
import { speakKidText } from '../../lib/speech'

type FlappyAnimalProps = {
  onBack: () => void
}

type Frame = {
  y: number
  velocity: number
  obstacleX: number
  gapY: number
  score: number
  message: string
  clouds: number
  ground: number
  particles: Array<{ id: number; x: number; y: number }>
}

type Character = {
  emoji: string
  name: string
}

type MapTheme = {
  id: string
  name: string
  shellClass: string
  skyClass: string
  groundClass: string
  decoration: string
  clouds: string[]
  obstacles: Array<{
    top: string
    bottom: string
    color: string
  }>
}

const characters: Character[] = [
  { emoji: '🐦', name: 'Passarinho' },
  { emoji: '🐶', name: 'Cachorrinho' },
  { emoji: '🦆', name: 'Patinho' },
  { emoji: '🐝', name: 'Abelhinha' },
  { emoji: '🦋', name: 'Borboleta' },
  { emoji: '🚀', name: 'Foguete' },
]

const maps: MapTheme[] = [
  {
    id: 'garden',
    name: 'Jardim',
    shellClass: 'bg-gradient-to-br from-sky-300 via-cyan-400 to-teal-400',
    skyClass: 'bg-gradient-to-b from-sky-100 to-sky-300',
    groundClass: 'bg-gradient-to-r from-lime-400 via-green-300 to-lime-400',
    decoration: '🌼 🌷 🌼 🌱 🌷 🌼',
    clouds: ['☁️', '☁️', '🌤️', '☁️'],
    obstacles: [
      { top: '🌳', bottom: '🌳', color: 'from-emerald-300 to-emerald-600' },
      { top: '🌼', bottom: '🌿', color: 'from-lime-300 to-green-500' },
      { top: '🌈', bottom: '🌳', color: 'from-green-200 to-emerald-500' },
    ],
  },
  {
    id: 'space',
    name: 'Espaço',
    shellClass: 'bg-gradient-to-br from-indigo-500 via-violet-500 to-slate-900',
    skyClass: 'bg-gradient-to-b from-indigo-900 via-violet-700 to-blue-500',
    groundClass: 'bg-gradient-to-r from-slate-700 via-indigo-500 to-slate-700',
    decoration: '⭐ 🌙 ⭐ 🪐 ⭐ 🌙',
    clouds: ['⭐', '🌙', '🪐', '✨'],
    obstacles: [
      { top: '🪐', bottom: '🌙', color: 'from-violet-300 to-indigo-600' },
      { top: '⭐', bottom: '🚀', color: 'from-blue-300 to-violet-600' },
      { top: '☄️', bottom: '🪐', color: 'from-pink-300 to-purple-600' },
    ],
  },
  {
    id: 'candy',
    name: 'Doces',
    shellClass: 'bg-gradient-to-br from-pink-300 via-rose-300 to-yellow-300',
    skyClass: 'bg-gradient-to-b from-pink-100 via-rose-100 to-yellow-100',
    groundClass: 'bg-gradient-to-r from-pink-300 via-yellow-200 to-pink-300',
    decoration: '🍬 🧁 🍭 🍬 🧁 🍭',
    clouds: ['🍬', '☁️', '🍭', '☁️'],
    obstacles: [
      { top: '🍭', bottom: '🍭', color: 'from-pink-200 to-rose-400' },
      { top: '🧁', bottom: '🍬', color: 'from-yellow-200 to-pink-400' },
      { top: '🍓', bottom: '🍰', color: 'from-rose-200 to-red-400' },
    ],
  },
]

const initialFrame: Frame = {
  y: 45,
  velocity: 0,
  obstacleX: 108,
  gapY: 44,
  score: 0,
  message: 'Toque para começar!',
  clouds: 0,
  ground: 0,
  particles: [],
}

const animalX = 28
const gapSize = 48
const obstacleWidth = 14

export function FlappyAnimal({ onBack }: FlappyAnimalProps) {
  const [frame, setFrame] = useState<Frame>(initialFrame)
  const [characterIndex, setCharacterIndex] = useState(0)
  const [mapIndex, setMapIndex] = useState(0)
  const [obstacleIndex, setObstacleIndex] = useState(0)
  const frameRef = useRef(initialFrame)
  const isPlayingRef = useRef(false)
  const lastTimeRef = useRef<number | null>(null)
  const particleIdRef = useRef(0)
  const { bestScore, saveBestScore } = useLocalBestScore('flappy-best-score')
  const { isCelebrating, celebrate } = useCelebration()

  const character = characters[characterIndex]
  const map = maps[mapIndex]

  useEffect(() => {
    function handleVisibilityChange() {
      if (document.hidden) {
        isPlayingRef.current = false
        frameRef.current = { ...frameRef.current, message: 'Pausado. Toque para voltar.' }
        setFrame(frameRef.current)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])

  useEffect(() => {
    let animationId = 0

    function loop(time: number) {
      const lastTime = lastTimeRef.current ?? time
      const delta = Math.min((time - lastTime) / 16.67, 2)
      lastTimeRef.current = time

      if (!isPlayingRef.current) {
        animationId = window.requestAnimationFrame(loop)
        return
      }

      const current = frameRef.current
      const nextY = Math.max(8, Math.min(83, current.y + current.velocity * delta))
      const nextVelocity = Math.min(1.25, current.velocity + 0.048 * delta)
      let nextObstacleX = current.obstacleX - 0.58 * delta
      let nextScore = current.score
      let nextGapY = current.gapY
      let nextMessage = current.message
      let nextParticles = current.particles
        .map((particle) => ({ ...particle, x: particle.x - 0.9 * delta, y: particle.y + 0.15 * delta }))
        .filter((particle) => particle.x > -10)

      if (nextObstacleX < -obstacleWidth) {
        nextObstacleX = 108
        nextGapY = 30 + Math.random() * 28
        nextScore += 1
        nextMessage = 'Estrela!'
        setObstacleIndex((index) => (index + 1) % map.obstacles.length)
        playSuccessSound()

        if (nextScore % 3 === 0) {
          celebrate()
          speakKidText('Três estrelas! Você está voando muito bem!')
        }
      }

      const inObstacle = nextObstacleX < animalX + 8 && nextObstacleX + obstacleWidth > animalX - 4
      const outsideGap = nextY < nextGapY - gapSize / 2 || nextY > nextGapY + gapSize / 2
      const touchedEdge = nextY <= 8 || nextY >= 83

      if ((inObstacle && outsideGap) || touchedEdge) {
        saveBestScore(nextScore)
        const resetFrame = {
          ...current,
          y: 45,
          velocity: -0.1,
          obstacleX: 108,
          gapY: 44,
          score: 0,
          message: 'Boa tentativa! Toque para continuar.',
          particles: [],
        }

        frameRef.current = resetFrame
        setFrame(resetFrame)
        isPlayingRef.current = false
        playGentleSound()
        speakKidText('Boa tentativa! Vamos de novo.')
        animationId = window.requestAnimationFrame(loop)
        return
      }

      if (Math.random() > 0.88) {
        nextParticles = [
          ...nextParticles,
          { id: particleIdRef.current++, x: animalX - 2, y: nextY + 5 },
        ].slice(-10)
      }

      const nextFrame = {
        y: nextY,
        velocity: nextVelocity,
        obstacleX: nextObstacleX,
        gapY: nextGapY,
        score: nextScore,
        message: nextMessage,
        clouds: (current.clouds + 0.1 * delta) % 100,
        ground: (current.ground + 0.65 * delta) % 100,
        particles: nextParticles,
      }

      frameRef.current = nextFrame
      setFrame(nextFrame)
      animationId = window.requestAnimationFrame(loop)
    }

    animationId = window.requestAnimationFrame(loop)
    return () => window.cancelAnimationFrame(animationId)
  }, [celebrate, map.obstacles.length, saveBestScore])

  function flap() {
    playTapSound()

    if (!isPlayingRef.current) {
      isPlayingRef.current = true
      frameRef.current = { ...frameRef.current, message: 'Uhuu!', velocity: -1.05 }
      setFrame(frameRef.current)
      return
    }

    const nextFrame = { ...frameRef.current, velocity: -1.08, message: 'Uhuu!' }
    frameRef.current = nextFrame
    setFrame(nextFrame)
  }

  function resetRun(message: string) {
    isPlayingRef.current = false
    const nextFrame = { ...initialFrame, message }
    frameRef.current = nextFrame
    setFrame(nextFrame)
  }

  function chooseCharacter(index: number) {
    playTapSound()
    setCharacterIndex(index)
    resetRun(`${characters[index].name} pronto!`)
  }

  function chooseMap(index: number) {
    playTapSound()
    setMapIndex(index)
    setObstacleIndex(0)
    resetRun(`Mapa ${maps[index].name}!`)
  }

  const rotation = Math.max(-18, Math.min(22, frame.velocity * 22))
  const gapTop = frame.gapY - gapSize / 2
  const gapBottom = 100 - (frame.gapY + gapSize / 2)
  const obstacle = map.obstacles[obstacleIndex % map.obstacles.length]

  return (
    <GameShell title="Flappy Animal" onBack={onBack} className={map.shellClass}>
      <CelebrationOverlay show={isCelebrating} message="Três estrelas!" />
      <section
        className={`relative h-[64dvh] min-h-[500px] touch-none overflow-hidden rounded-[2rem] ${map.skyClass} shadow-2xl ring-4 ring-white/70 sm:h-[calc(100dvh-8rem)] sm:min-h-[560px]`}
        onPointerDown={flap}
      >
        {map.clouds.map((cloud, index) => (
          <div
            key={`${cloud}-${index}`}
            className="absolute text-5xl opacity-80 sm:text-6xl"
            style={{ left: `${(index * 33 - frame.clouds + 110) % 110}%`, top: `${9 + (index % 2) * 16}%` }}
          >
            {cloud}
          </div>
        ))}

        <div className="absolute left-4 top-4 flex max-w-[calc(100%-2rem)] flex-wrap gap-3">
          <ProgressStars value={frame.score % 3} total={3} label={`⭐ ${frame.score}`} />
          <div className="rounded-3xl bg-white/90 px-5 py-3 text-xl font-black text-slate-800 shadow-xl">
            Recorde {Math.max(bestScore, frame.score)}
          </div>
        </div>

        <div
          className="absolute right-3 top-24 grid max-w-[48%] grid-cols-3 gap-2 sm:right-4 sm:top-4 sm:max-w-none sm:grid-cols-6"
          onPointerDown={(event) => event.stopPropagation()}
        >
          {characters.map((item, index) => (
            <button
              key={item.name}
              type="button"
              onClick={() => chooseCharacter(index)}
              className={`rounded-2xl bg-white/90 px-3 py-2 text-3xl shadow-xl active:scale-95 ${
                characterIndex === index ? 'ring-4 ring-yellow-300' : ''
              }`}
              aria-label={`Escolher ${item.name}`}
            >
              {item.emoji}
            </button>
          ))}
        </div>

        <div
          className="absolute left-4 top-28 flex max-w-[48%] flex-col gap-2 sm:top-24 sm:max-w-none sm:flex-row"
          onPointerDown={(event) => event.stopPropagation()}
        >
          {maps.map((item, index) => (
            <button
              key={item.id}
              type="button"
              onClick={() => chooseMap(index)}
              className={`rounded-2xl bg-white/90 px-4 py-3 text-lg font-black text-slate-800 shadow-xl active:scale-95 ${
                mapIndex === index ? 'ring-4 ring-yellow-300' : ''
              }`}
            >
              {item.name}
            </button>
          ))}
        </div>

        <div
          className={`absolute w-16 rounded-b-[2rem] border-x-4 border-white/50 bg-gradient-to-b ${obstacle.color} shadow-xl sm:w-24`}
          style={{ left: `${frame.obstacleX}%`, top: 0, height: `${gapTop}%` }}
        >
          <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-4xl">{obstacle.top}</span>
        </div>
        <div
          className={`absolute bottom-12 w-16 rounded-t-[2rem] border-x-4 border-white/50 bg-gradient-to-b ${obstacle.color} shadow-xl sm:w-24`}
          style={{ left: `${frame.obstacleX}%`, height: `${gapBottom}%` }}
        >
          <span className="absolute left-1/2 top-2 -translate-x-1/2 text-4xl">{obstacle.bottom}</span>
        </div>

        {frame.particles.map((particle) => (
          <span
            key={particle.id}
            className="absolute text-2xl opacity-70"
            style={{ left: `${particle.x}%`, top: `${particle.y}%` }}
          >
            ✨
          </span>
        ))}

        <div
          className="absolute left-[28%] -translate-y-1/2 text-6xl drop-shadow-lg transition-transform duration-75 sm:text-7xl"
          style={{ top: `${frame.y}%`, transform: `translateY(-50%) rotate(${rotation}deg)` }}
        >
          {character.emoji}
        </div>

        <div
          className={`absolute bottom-0 h-14 w-[220%] ${map.groundClass}`}
          style={{ transform: `translateX(-${frame.ground}%)` }}
        />
        <div className="absolute bottom-3 left-0 right-0 flex justify-around text-3xl">{map.decoration}</div>

        <div className="absolute bottom-20 left-1/2 w-[calc(100%-2rem)] -translate-x-1/2 rounded-3xl bg-white/90 px-5 py-3 text-center text-2xl font-black text-slate-800 shadow-xl sm:w-auto sm:px-8 sm:text-3xl">
          {frame.message}
        </div>
      </section>
    </GameShell>
  )
}
