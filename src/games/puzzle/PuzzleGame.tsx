import { useMemo, useState } from 'react'
import { CelebrationOverlay } from '../../components/CelebrationOverlay'
import { ChoiceTray } from '../../components/ChoiceTray'
import { DraggablePiece } from '../../components/DraggablePiece'
import { GameShell } from '../../components/GameShell'
import { ProgressStars } from '../../components/ProgressStars'
import { useCelebration } from '../../hooks/useCelebration'
import { useGameRound } from '../../hooks/useGameRound'
import { playGentleSound, playSuccessSound, playTapSound } from '../../lib/kidAudio'
import { speakKidText } from '../../lib/speech'

type PuzzleGameProps = {
  onBack: () => void
}

type Piece = {
  id: string
  label: string
  match: string
  hint: string
  color: string
}

const rounds: Array<{ title: string; pieces: Piece[] }> = [
  {
    title: 'Formas',
    pieces: [
      { id: 'circle', label: '🔴', match: 'Circulo', hint: 'redondo', color: 'bg-red-100' },
      { id: 'star', label: '⭐', match: 'Estrela', hint: 'brilha', color: 'bg-yellow-100' },
      { id: 'heart', label: '💚', match: 'Coracao', hint: 'amor', color: 'bg-green-100' },
    ],
  },
  {
    title: 'Animais',
    pieces: [
      { id: 'dog', label: '🐶', match: 'Cachorro', hint: 'au au', color: 'bg-orange-100' },
      { id: 'cat', label: '🐱', match: 'Gato', hint: 'miau', color: 'bg-pink-100' },
      { id: 'bee', label: '🐝', match: 'Abelha', hint: 'zum zum', color: 'bg-amber-100' },
      { id: 'dino', label: '🦖', match: 'Dino', hint: 'grande', color: 'bg-lime-100' },
    ],
  },
  {
    title: 'Comidas',
    pieces: [
      { id: 'apple', label: '🍎', match: 'Maca', hint: 'fruta', color: 'bg-red-100' },
      { id: 'banana', label: '🍌', match: 'Banana', hint: 'amarela', color: 'bg-yellow-100' },
      { id: 'carrot', label: '🥕', match: 'Cenoura', hint: 'laranja', color: 'bg-orange-100' },
      { id: 'cake', label: '🧁', match: 'Bolinho', hint: 'festa', color: 'bg-pink-100' },
      { id: 'water', label: '💧', match: 'Agua', hint: 'azul', color: 'bg-blue-100' },
      { id: 'music', label: '🎵', match: 'Musica', hint: 'som', color: 'bg-violet-100' },
    ],
  },
]

export function PuzzleGame({ onBack }: PuzzleGameProps) {
  const { roundIndex, roundNumber, nextRound } = useGameRound(rounds.length)
  const [selectedPiece, setSelectedPiece] = useState<Piece | null>(null)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [done, setDone] = useState<string[]>([])
  const [message, setMessage] = useState('Pegue uma peça.')
  const { isCelebrating, celebrate } = useCelebration()

  const round = rounds[roundIndex]
  const pieces = round.pieces
  const remainingPieces = useMemo(
    () => pieces.filter((piece) => !done.includes(piece.id)),
    [done, pieces],
  )

  function choosePiece(piece: Piece) {
    playTapSound()
    setSelectedPiece(piece)
    setMessage(`Leve ${piece.label} ate ${piece.match}.`)
    speakKidText(`Pegou ${piece.match}.`)
  }

  function completeRound() {
    celebrate()
    playSuccessSound()
    setMessage('Tudo encaixado! Ficou lindo!')
    speakKidText('Tudo encaixado! Ficou lindo!')
  }

  function trySlot(pieceId: string) {
    const piece = selectedPiece ?? pieces.find((item) => item.id === draggingId) ?? null

    if (!piece) {
      playGentleSound()
      setMessage('Primeiro pegue uma peça.')
      speakKidText('Primeiro pegue uma peça.')
      return
    }

    if (piece.id === pieceId) {
      const nextDone = [...done, pieceId]
      setDone(nextDone)
      setSelectedPiece(null)
      setDraggingId(null)
      playSuccessSound()

      if (nextDone.length === pieces.length) {
        completeRound()
        return
      }

      setMessage('Encaixou! Pegue outra.')
      speakKidText('Encaixou! Pegue outra.')
      return
    }

    playGentleSound()
    setMessage('Quase! O desenho igual ajuda.')
    speakKidText('Quase! O desenho igual ajuda.')
  }

  function morePuzzle() {
    playTapSound()
    nextRound()
    setSelectedPiece(null)
    setDraggingId(null)
    setDone([])
    setMessage('Nova rodada!')
  }

  return (
    <GameShell
      title="Quebra-Cabeça"
      onBack={onBack}
      className="bg-gradient-to-br from-fuchsia-300 via-pink-400 to-rose-400"
    >
      <CelebrationOverlay show={isCelebrating} message="Puzzle completo!" />
      <section className="grid gap-5 lg:min-h-[calc(100dvh-8rem)] lg:grid-cols-[0.85fr_1.15fr] lg:gap-6">
        <ChoiceTray title={`${round.title} - Rodada ${roundNumber}`}>
          <div className="mb-4 flex justify-center">
            <ProgressStars value={done.length} total={pieces.length} label="Peças" />
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-1">
            {remainingPieces.map((piece) => (
              <DraggablePiece
                key={piece.id}
                active={selectedPiece?.id === piece.id}
                dragging={draggingId === piece.id}
                onClick={() => choosePiece(piece)}
                onDragStart={(event) => {
                  setDraggingId(piece.id)
                  setSelectedPiece(piece)
                  event.dataTransfer.setData('text/plain', piece.id)
                }}
                onDragEnd={() => setDraggingId(null)}
                className={piece.color}
              >
                {piece.label}
              </DraggablePiece>
            ))}
            <button
              type="button"
              onClick={morePuzzle}
              className="rounded-3xl bg-yellow-300 px-5 py-4 text-xl font-black text-slate-800 shadow-xl active:scale-95 sm:text-2xl"
            >
              Mais um
            </button>
          </div>
        </ChoiceTray>

        <div className="grid grid-cols-1 gap-4 rounded-[2rem] bg-white/35 p-4 shadow-2xl ring-4 ring-white/60 sm:grid-cols-2 lg:grid-cols-3 lg:p-6">
          {pieces.map((piece) => {
            const isDone = done.includes(piece.id)
            const isTarget = selectedPiece?.id === piece.id

            return (
              <button
                key={piece.id}
                type="button"
                onClick={() => trySlot(piece.id)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault()
                  setDraggingId(event.dataTransfer.getData('text/plain'))
                  trySlot(piece.id)
                }}
                className={`flex min-h-40 flex-col items-center justify-center gap-3 rounded-[2rem] border-8 border-dashed text-slate-800 shadow-xl transition active:scale-95 ${
                  isDone ? 'border-yellow-300 bg-white ring-8 ring-white/70' : 'border-white/80 bg-white/50'
                } ${isTarget ? 'scale-105 border-yellow-300 bg-yellow-100' : ''}`}
              >
                <span className={`text-6xl transition ${isDone ? 'scale-110' : 'opacity-35'}`}>
                  {isDone ? piece.label : '⬚'}
                </span>
                <span className="text-2xl font-black">{piece.match}</span>
                <span className="rounded-full bg-white/80 px-4 py-2 text-lg font-black">{piece.hint}</span>
              </button>
            )
          })}
        </div>
      </section>

      <div className="mx-auto mt-4 max-w-3xl rounded-3xl bg-white/95 px-6 py-4 text-center text-2xl font-black text-slate-800 shadow-xl sm:text-3xl">
        {message}
      </div>
    </GameShell>
  )
}
