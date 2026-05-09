import { useState } from 'react'
import { ChoiceTray } from '../../components/ChoiceTray'
import { GameShell } from '../../components/GameShell'
import { KidCard } from '../../components/KidCard'
import { playSuccessSound, playTapSound } from '../../lib/kidAudio'
import { generateKidStory } from '../../lib/gemini'
import { speakKidText, stopSpeaking } from '../../lib/speech'

type StoryMusicProps = {
  onBack: () => void
}

type StoryStatus = 'choosing' | 'creating' | 'ready' | 'listening'

const categories = [
  { id: 'animals', title: 'Animais', emojis: ['🐶', '🐱', '🦖', '🐻', '🐝'] },
  { id: 'places', title: 'Lugares', emojis: ['🌙', '🏰', '🌈', '🌳', '🚀'] },
  { id: 'things', title: 'Objetos', emojis: ['🍎', '⭐', '🎵', '🧁', '💧'] },
]

const fallbackStory =
  'Era uma vez uma brincadeira muito feliz. Os amigos deram as maos, sorriram e foram passear devagar.\n\nNo final, todos cantaram uma musica baixinha e descansaram felizes. Foi um dia cheio de carinho.'

const storageKey = 'kid-last-stories'

export function StoryMusic({ onBack }: StoryMusicProps) {
  const [categoryId, setCategoryId] = useState(categories[0].id)
  const [selected, setSelected] = useState<string[]>([])
  const [story, setStory] = useState('Escolha 3 emojis para criar uma historinha.')
  const [status, setStatus] = useState<StoryStatus>('choosing')
  const [lastStories, setLastStories] = useState<string[]>(() => {
    const saved = window.localStorage.getItem(storageKey)
    return saved ? (JSON.parse(saved) as string[]) : []
  })

  const category = categories.find((item) => item.id === categoryId) ?? categories[0]

  function saveStory(nextStory: string) {
    setLastStories((current) => {
      const next = [nextStory, ...current.filter((item) => item !== nextStory)].slice(0, 3)
      window.localStorage.setItem(storageKey, JSON.stringify(next))
      return next
    })
  }

  function toggleEmoji(emoji: string) {
    playTapSound()
    setStatus('choosing')
    setSelected((current) => {
      if (current.includes(emoji)) {
        return current.filter((item) => item !== emoji)
      }

      if (current.length === 3) {
        return [current[1], current[2], emoji]
      }

      return [...current, emoji]
    })
  }

  async function createStory() {
    if (selected.length < 3 || status === 'creating') {
      setStory('Escolha 3 emojis primeiro.')
      speakKidText('Escolha tres emojis primeiro.')
      return
    }

    playTapSound()
    setStatus('creating')
    setStory('Criando uma historinha...')

    try {
      const text = await generateKidStory(selected)
      setStory(text)
      saveStory(text)
      setStatus('ready')
      playSuccessSound()
      speakKidText('Sua historia ficou pronta!')
    } catch {
      setStory(fallbackStory)
      saveStory(fallbackStory)
      setStatus('ready')
      playSuccessSound()
      speakKidText('Criei uma historinha especial para voce.')
    }
  }

  function listenStory() {
    playTapSound()
    setStatus('listening')
    speakKidText(story, () => setStatus('ready'))
  }

  function stopStory() {
    playTapSound()
    stopSpeaking()
    setStatus('ready')
  }

  function newStory() {
    playTapSound()
    stopSpeaking()
    setSelected([])
    setStory('Escolha 3 emojis para criar uma historinha.')
    setStatus('choosing')
  }

  return (
    <GameShell
      title="História e Música"
      onBack={onBack}
      className="bg-gradient-to-br from-violet-300 via-indigo-400 to-blue-500"
    >
      <section className="grid gap-5 lg:min-h-[calc(100dvh-8rem)] lg:grid-cols-[0.9fr_1.1fr] lg:gap-6">
        <ChoiceTray title="Escolha 3 amigos">
          <div className="mb-4 grid grid-cols-3 gap-3">
            {categories.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  playTapSound()
                  setCategoryId(item.id)
                }}
                className={`rounded-3xl px-4 py-3 text-xl font-black shadow-xl active:scale-95 ${
                  item.id === categoryId ? 'bg-yellow-300 text-slate-800' : 'bg-white/90 text-slate-700'
                }`}
              >
                {item.title}
              </button>
            ))}
          </div>

          <div className="grid flex-1 grid-cols-3 gap-4 sm:grid-cols-5">
            {category.emojis.map((emoji) => (
              <KidCard
                key={emoji}
                active={selected.includes(emoji)}
                onClick={() => toggleEmoji(emoji)}
                className="min-h-20 text-4xl sm:text-5xl"
              >
                {emoji}
              </KidCard>
            ))}
          </div>

          <div className="mt-4 rounded-[2rem] bg-white/90 p-4 text-center text-slate-800 shadow-xl">
            <p className="mb-3 text-xl font-black sm:text-2xl">Na história</p>
            <p className="min-h-14 text-4xl sm:text-5xl">{selected.join(' ')}</p>
          </div>

          <button
            type="button"
            onClick={createStory}
            className="mt-4 w-full rounded-3xl bg-yellow-300 px-7 py-4 text-2xl font-black text-slate-800 shadow-xl active:scale-95 disabled:opacity-70 sm:text-3xl"
            disabled={status === 'creating'}
          >
            {status === 'creating' ? 'Criando...' : 'Criar história'}
          </button>
        </ChoiceTray>

        <article className="flex min-h-80 flex-col justify-center rounded-[2rem] bg-white/90 p-5 text-slate-800 shadow-2xl ring-4 ring-white/70 sm:p-8">
          <div className="mb-4 text-center text-6xl sm:text-7xl">
            {status === 'creating' ? '✨' : status === 'listening' ? '🎧' : '📖'}
          </div>
          <p className="whitespace-pre-line text-2xl font-bold leading-snug sm:text-3xl">{story}</p>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <button
              type="button"
              onClick={listenStory}
              className="rounded-3xl bg-pink-200 px-6 py-4 text-2xl font-black text-slate-800 shadow-xl active:scale-95"
            >
              {status === 'listening' ? 'Escutando...' : 'Ler de novo'}
            </button>
            <button
              type="button"
              onClick={stopStory}
              className="rounded-3xl bg-sky-200 px-6 py-4 text-2xl font-black text-slate-800 shadow-xl active:scale-95"
            >
              Parar voz
            </button>
            <button
              type="button"
              onClick={newStory}
              className="rounded-3xl bg-yellow-300 px-6 py-4 text-2xl font-black text-slate-800 shadow-xl active:scale-95"
            >
              Nova
            </button>
          </div>

          {!!lastStories.length && (
            <div className="mt-5 rounded-[2rem] bg-violet-100 p-4">
              <p className="mb-3 text-xl font-black">Últimas histórias</p>
              <div className="grid gap-3">
                {lastStories.map((item, index) => (
                  <button
                    key={`${item}-${index}`}
                    type="button"
                    onClick={() => {
                      playTapSound()
                      setStory(item)
                      setStatus('ready')
                    }}
                    className="rounded-2xl bg-white px-4 py-3 text-left text-lg font-bold shadow"
                  >
                    {item.slice(0, 80)}...
                  </button>
                ))}
              </div>
            </div>
          )}
        </article>
      </section>
    </GameShell>
  )
}
