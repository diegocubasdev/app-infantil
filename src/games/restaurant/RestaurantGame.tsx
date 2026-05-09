import { useMemo, useState } from 'react'
import { CelebrationOverlay } from '../../components/CelebrationOverlay'
import { ChoiceTray } from '../../components/ChoiceTray'
import { GameShell } from '../../components/GameShell'
import { KidCard } from '../../components/KidCard'
import { ProgressStars } from '../../components/ProgressStars'
import { useCelebration } from '../../hooks/useCelebration'
import { useGameRound } from '../../hooks/useGameRound'
import { playGentleSound, playSuccessSound, playTapSound } from '../../lib/kidAudio'
import { speakKidText } from '../../lib/speech'

type RestaurantGameProps = {
  onBack: () => void
}

type Customer = {
  id: string
  animal: string
  wants: string[]
  name: string
}

const foods = ['🍎', '🥕', '🍌', '🧁', '💧', '🥛']

const rounds: Customer[][] = [
  [
    { id: 'dog', animal: '🐶', wants: ['🍎'], name: 'Toto' },
    { id: 'cat', animal: '🐱', wants: ['🥕'], name: 'Mimi' },
    { id: 'bear', animal: '🐻', wants: ['🍌'], name: 'Bubu' },
  ],
  [
    { id: 'dino', animal: '🦖', wants: ['🧁', '🥛'], name: 'Dino' },
    { id: 'rabbit', animal: '🐰', wants: ['🥕', '💧'], name: 'Lili' },
    { id: 'monkey', animal: '🐵', wants: ['🍌', '💧'], name: 'Nino' },
  ],
]

export function RestaurantGame({ onBack }: RestaurantGameProps) {
  const { roundIndex, roundNumber, nextRound } = useGameRound(rounds.length)
  const [tray, setTray] = useState<string[]>([])
  const [served, setServed] = useState<string[]>([])
  const [message, setMessage] = useState('Coloque comida na bandeja.')
  const { isCelebrating, celebrate } = useCelebration()
  const customers = rounds[roundIndex]

  const happyCount = served.length
  const trayLabel = useMemo(() => (tray.length ? tray.join(' ') : 'vazia'), [tray])

  function chooseFood(food: string) {
    playTapSound()
    setTray((current) => {
      const next = [...current, food].slice(-2)
      setMessage(`Bandeja: ${next.join(' ')}`)
      return next
    })
  }

  function wantsMatch(customer: Customer) {
    return customer.wants.length === tray.length && customer.wants.every((food) => tray.includes(food))
  }

  function serve(customer: Customer) {
    if (served.includes(customer.id)) {
      return
    }

    if (!tray.length) {
      playGentleSound()
      setMessage(`Veja o pedido do ${customer.name}.`)
      speakKidText(`${customer.name} quer ${customer.wants.join(' e ')}.`)
      return
    }

    if (wantsMatch(customer)) {
      const nextServed = [...served, customer.id]
      setServed(nextServed)
      setTray([])
      playSuccessSound()

      if (nextServed.length === customers.length) {
        celebrate()
        setMessage('Todos os amigos estão felizes!')
        speakKidText('Todos os amigos estao felizes!')
        return
      }

      setMessage(`${customer.name} ficou feliz!`)
      speakKidText(`${customer.name} ficou feliz!`)
      return
    }

    playGentleSound()
    setMessage('Quase! Confira o balão do pedido.')
    speakKidText('Quase! Confira o pedido.')
  }

  function newOrders() {
    playTapSound()
    nextRound()
    setTray([])
    setServed([])
    setMessage('Novos amigos chegaram!')
  }

  return (
    <GameShell
      title="Restaurante"
      onBack={onBack}
      className="bg-gradient-to-br from-orange-300 via-amber-400 to-red-400"
    >
      <CelebrationOverlay show={isCelebrating} message="Restaurante feliz!" />
      <section className="grid gap-5 lg:min-h-[calc(100dvh-8rem)] lg:grid-rows-[1fr_auto]">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:gap-5">
          {customers.map((customer) => {
            const isServed = served.includes(customer.id)

            return (
              <KidCard
                key={customer.id}
                active={isServed}
                onClick={() => serve(customer)}
                className="relative flex min-h-56 flex-col items-center justify-center gap-3 sm:min-h-72"
              >
                <div className="absolute right-4 top-4 rounded-[2rem] bg-white px-4 py-2 text-3xl shadow-lg sm:text-4xl">
                  {isServed ? '💛' : customer.wants.join(' ')}
                </div>
                <div className="absolute left-4 top-4 rounded-full bg-yellow-200 px-4 py-2 text-lg font-black">
                  {isServed ? 'feliz' : 'pedido'}
                </div>
                <span className={`text-7xl transition sm:text-8xl ${isServed ? 'scale-110' : ''}`}>
                  {isServed ? '😄' : customer.animal}
                </span>
                <span className="text-3xl font-black">{isServed ? 'Obrigado!' : customer.name}</span>
              </KidCard>
            )
          })}
        </div>

        <ChoiceTray title={`Bandeja: ${trayLabel}`}>
          <div className="mb-4 flex justify-center">
            <ProgressStars value={happyCount} total={customers.length} label="Felizes" />
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-7">
            {foods.map((food) => (
              <button
                key={food}
                type="button"
                onClick={() => chooseFood(food)}
                draggable
                onDragStart={(event) => event.dataTransfer.setData('text/plain', food)}
                className="rounded-[2rem] bg-white px-5 py-4 text-5xl shadow-xl transition active:scale-95 lg:text-6xl"
              >
                {food}
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                playTapSound()
                setTray([])
                setMessage('Bandeja limpinha.')
              }}
              className="rounded-3xl bg-white px-5 py-4 text-xl font-black text-slate-800 shadow-xl active:scale-95"
            >
              Limpar
            </button>
            <button
              type="button"
              onClick={newOrders}
              className="rounded-3xl bg-yellow-300 px-5 py-4 text-xl font-black text-slate-800 shadow-xl active:scale-95"
            >
              Rodada {roundNumber + 1}
            </button>
          </div>
        </ChoiceTray>
      </section>

      <div className="mx-auto mt-4 max-w-3xl rounded-3xl bg-white/95 px-6 py-4 text-center text-2xl font-black text-slate-800 shadow-xl sm:text-3xl">
        {message}
      </div>
    </GameShell>
  )
}
