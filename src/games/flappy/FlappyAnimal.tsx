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

type Obstacle = {
  top: string
  bottom: string
  color: string
}

const animals = ['🐦', '🐶', '🦆', '🐝']
const obstacles: Obstacle[] = [
  { top: '🌳', bottom: '🌳', color: 'from-emerald-300 to-emerald-600' },
  { top: '☁️', bottom: '🌈', color: 'from-sky-200 to-blue-400' },
  { top: '🌼', bottom: '🌿', color: 'from-lime-300 to-green-500' },
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
  const [isPlaying, setIsPlaying] = useState(false)
  const [animalIndex, setAnimalIndex] = useState(0)
  const [obstacleIndex, setObstacleIndex] = useState(0)
  const frameRef = useRef(initialFrame)
  const isPlayingRef = useRef(false)
  const lastTimeRef = useRef<number | null>(null)
  const particleIdRef = useRef(0)
  const { bestScore, saveBestScore } = useLocalBestScore('flappy-best-score')
  const { isCelebrating, celebrate } = useCelebration()

  useEffect(() => {
    function handleVisibilityChange() {
      if (document.hidden) {
        setIsPlaying(false)
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
        setObstacleIndex((index) => (index + 1) % obstacles.length)
        playSuccessSound()

        if (nextScore % 3 === 0) {
          celebrate()
          speakKidText('Tres estrelas! Voce esta voando muito bem!')
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
        setIsPlaying(false)
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
  }, [celebrate, saveBestScore])

  function flap() {
    playTapSound()

    if (!isPlayingRef.current) {
      setIsPlaying(true)
      isPlayingRef.current = true
      frameRef.current = { ...frameRef.current, message: 'Uhuu!', velocity: -1.05 }
      setFrame(frameRef.current)
      return
    }

    const nextFrame = { ...frameRef.current, velocity: -1.08, message: 'Uhuu!' }
    frameRef.current = nextFrame
    setFrame(nextFrame)
  }

  function changeAnimal() {
    playTapSound()
    setAnimalIndex((index) => (index + 1) % animals.length)
  }

  const rotation = Math.max(-18, Math.min(22, frame.velocity * 22))
  const gapTop = frame.gapY - gapSize / 2
  const gapBottom = 100 - (frame.gapY + gapSize / 2)
  const obstacle = obstacles[obstacleIndex]

  return (
    <GameShell
      title="Flappy Animal"
      onBack={onBack}
      className="bg-gradient-to-br from-sky-300 via-cyan-400 to-teal-400"
    >
      <CelebrationOverlay show={isCelebrating} message="Três estrelas!" />
      <section
        className="relative h-[62dvh] min-h-[450px] touch-none overflow-hidden rounded-[2rem] bg-gradient-to-b from-sky-100 to-sky-300 shadow-2xl ring-4 ring-white/70 sm:h-[calc(100dvh-8rem)] sm:min-h-[520px]"
        onPointerDown={flap}
      >
        {[0, 1, 2, 3].map((cloud) => (
          <div
            key={cloud}
            className="absolute text-5xl opacity-80 sm:text-6xl"
            style={{ left: `${(cloud * 33 - frame.clouds + 110) % 110}%`, top: `${9 + (cloud % 2) * 16}%` }}
          >
            ☁️
          </div>
        ))}

        <div className="absolute left-4 top-4 flex flex-wrap gap-3">
          <ProgressStars value={frame.score % 3} total={3} label={`⭐ ${frame.score}`} />
          <div className="rounded-3xl bg-white/90 px-5 py-3 text-xl font-black text-slate-800 shadow-xl">
            Recorde {Math.max(bestScore, frame.score)}
          </div>
        </div>

        <button
          type="button"
          onPointerDown={(event) => event.stopPropagation()}
          onClick={changeAnimal}
          className="absolute right-4 top-4 rounded-3xl bg-yellow-300 px-5 py-3 text-xl font-black text-slate-800 shadow-xl active:scale-95"
        >
          Trocar {animals[animalIndex]}
        </button>

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
          {animals[animalIndex]}
        </div>

        <div
          className="absolute bottom-0 h-14 w-[220%] bg-gradient-to-r from-lime-400 via-green-300 to-lime-400"
          style={{ transform: `translateX(-${frame.ground}%)` }}
        />
        <div className="absolute bottom-3 left-0 right-0 flex justify-around text-3xl">🌼 🌷 🌼 🌱 🌷 🌼</div>

        <div className="absolute bottom-20 left-1/2 w-[calc(100%-2rem)] -translate-x-1/2 rounded-3xl bg-white/90 px-5 py-3 text-center text-2xl font-black text-slate-800 shadow-xl sm:w-auto sm:px-8 sm:text-3xl">
          {isPlaying ? frame.message : frame.message}
        </div>
      </section>
    </GameShell>
  )
}
