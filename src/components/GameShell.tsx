import type { ReactNode } from 'react'
import { useKidAudio } from '../lib/kidAudio'
import { stopSpeaking } from '../lib/speech'

type GameShellProps = {
  children: ReactNode
  className?: string
  title: string
  onBack: () => void
}

export function GameShell({ children, className = '', title, onBack }: GameShellProps) {
  const { isMusicOn, toggleMusic, playTapSound } = useKidAudio()

  function handleBack() {
    playTapSound()
    stopSpeaking()
    onBack()
  }

  return (
    <main className={`min-h-dvh overflow-x-hidden p-3 text-white sm:p-4 lg:p-6 ${className}`}>
      <header className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleBack}
            className="flex-1 rounded-3xl bg-white/90 px-6 py-4 text-2xl font-black text-slate-800 shadow-xl transition active:scale-95 sm:flex-none sm:px-8 sm:text-3xl"
          >
            ← Menu
          </button>
          <button
            type="button"
            onClick={toggleMusic}
            aria-pressed={isMusicOn}
            className="rounded-3xl bg-yellow-300 px-5 py-4 text-2xl font-black text-slate-800 shadow-xl transition active:scale-95 sm:text-3xl"
          >
            {isMusicOn ? '♪' : 'Som'}
          </button>
        </div>
        <h1 className="text-center text-3xl font-black drop-shadow sm:text-right sm:text-4xl">
          {title}
        </h1>
      </header>
      {children}
    </main>
  )
}
