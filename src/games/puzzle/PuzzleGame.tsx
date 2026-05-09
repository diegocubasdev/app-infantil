import { useMemo, useState } from 'react'
import { CelebrationOverlay } from '../../components/CelebrationOverlay'
import { ChoiceTray } from '../../components/ChoiceTray'
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
  image: string
}

type DragState = {
  piece: Piece
  x: number
  y: number
} | null

const openMoji = '/openmoji/'

const rounds: Array<{ title: string; pieces: Piece[] }> = [
  {
    title: 'Animais',
    pieces: [
      { id: 'dog', label: '🐶', match: 'Cachorro', hint: 'au au', color: 'bg-orange-100', image: `${openMoji}dog.svg` },
      { id: 'cat', label: '🐱', match: 'Gato', hint: 'miau', color: 'bg-pink-100', image: `${openMoji}cat.svg` },
      { id: 'bee', label: '🐝', match: 'Abelha', hint: 'zum zum', color: 'bg-amber-100', image: `${openMoji}bee.svg` },
    ],
  },
  {
    title: 'Comidas',
    pieces: [
      { id: 'apple', label: '🍎', match: 'Maca', hint: 'fruta', color: 'bg-red-100', image: `${openMoji}apple.svg` },
      { id: 'banana', label: '🍌', match: 'Banana', hint: 'amarela', color: 'bg-yellow-100', image: `${openMoji}banana.svg` },
      { id: 'carrot', label: '🥕', match: 'Cenoura', hint: 'laranja', color: 'bg-orange-100', image: `${openMoji}carrot.svg` },
      { id: 'cupcake', label: '🧁', match: 'Bolinho', hint: 'festa', color: 'bg-pink-100', image: `${openMoji}cupcake.svg` },
    ],
  },
  {
    title: 'Amigos',
    pieces: [
      { id: 'bear', label: '🐻', match: 'Urso', hint: 'fofinho', color: 'bg-yellow-100', image: `${openMoji}bear.svg` },
      { id: 'dino', label: '🦖', match: 'Dino', hint: 'grande', color: 'bg-lime-100', image: `${openMoji}dino.svg` },
      { id: 'heart', label: '💚', match: 'Coracao', hint: 'amor', color: 'bg-green-100', image: `${openMoji}heart.svg` },
      { id: 'star', label: '⭐', match: 'Estrela', hint: 'brilha', color: 'bg-yellow-100', image: `${openMoji}star.svg` },
      { id: 'water', label: '💧', match: 'Agua', hint: 'azul', color: 'bg-blue-100', image: `${openMoji}water.svg` },
      { id: 'music', label: '🎵', match: 'Musica', hint: 'som', color: 'bg-violet-100', image: `${openMoji}music.svg` },
    ],
  },
]

function Drawing({ piece, muted = false }: { piece: Piece; muted?: boolean }) {
  return (
    <img
      src={piece.image}
      alt={piece.match}
      className={`h-20 w-20 object-contain drop-shadow sm:h-24 sm:w-24 ${muted ? 'opacity-30 grayscale' : ''}`}
      draggable={false}
    />
  )
}

export function PuzzleGame({ onBack }: PuzzleGameProps) {
  const { roundIndex, roundNumber, nextRound } = useGameRound(rounds.length)
  const [selectedPiece, setSelectedPiece] = useState<Piece | null>(null)
  const [dragging, setDragging] = useState<DragState>(null)
  const [done, setDone] = useState<string[]>([])
  const [message, setMessage] = useState('Arraste uma figura ou toque nela.')
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

  function trySlot(pieceId: string, piece = selectedPiece) {
    if (!piece) {
      playGentleSound()
      setMessage('Primeiro pegue uma figura.')
      speakKidText('Primeiro pegue uma figura.')
      return
    }

    if (piece.id === pieceId) {
      const nextDone = [...done, pieceId]
      setDone(nextDone)
      setSelectedPiece(null)
      setDragging(null)
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
    setMessage('Quase! Solte no desenho igual.')
    speakKidText('Quase! Solte no desenho igual.')
  }

  function startPointerDrag(piece: Piece, x: number, y: number) {
    choosePiece(piece)
    setDragging({ piece, x, y })
  }

  function finishPointerDrag(x: number, y: number) {
    if (!dragging) {
      return
    }

    const target = document.elementFromPoint(x, y)?.closest<HTMLElement>('[data-slot-id]')
    const slotId = target?.dataset.slotId

    if (slotId) {
      trySlot(slotId, dragging.piece)
    } else {
      setMessage('Solte em um encaixe.')
      setDragging(null)
    }
  }

  function morePuzzle() {
    playTapSound()
    nextRound()
    setSelectedPiece(null)
    setDragging(null)
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
      <section
        className="relative grid touch-none gap-5 lg:min-h-[calc(100dvh-8rem)] lg:grid-cols-[0.85fr_1.15fr] lg:gap-6"
        onPointerMove={(event) => {
          if (dragging) {
            setDragging({ ...dragging, x: event.clientX, y: event.clientY })
          }
        }}
        onPointerUp={(event) => finishPointerDrag(event.clientX, event.clientY)}
        onPointerCancel={() => setDragging(null)}
      >
        <ChoiceTray title={`${round.title} - Rodada ${roundNumber}`}>
          <div className="mb-4 flex justify-center">
            <ProgressStars value={done.length} total={pieces.length} label="Figuras" />
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-1">
            {remainingPieces.map((piece) => (
              <button
                key={piece.id}
                type="button"
                onClick={() => choosePiece(piece)}
                onPointerDown={(event) => {
                  event.currentTarget.setPointerCapture(event.pointerId)
                  startPointerDrag(piece, event.clientX, event.clientY)
                }}
                onDragStart={(event) => event.preventDefault()}
                className={`flex min-h-32 flex-col items-center justify-center gap-2 rounded-[2rem] p-4 shadow-xl transition active:scale-95 ${
                  selectedPiece?.id === piece.id ? 'scale-105 ring-8 ring-yellow-300' : ''
                } ${piece.color}`}
              >
                <Drawing piece={piece} />
                <span className="text-xl font-black text-slate-800">{piece.match}</span>
              </button>
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
                data-slot-id={piece.id}
                onClick={() => trySlot(piece.id)}
                className={`flex min-h-44 flex-col items-center justify-center gap-3 rounded-[2rem] border-8 border-dashed text-slate-800 shadow-xl transition active:scale-95 ${
                  isDone ? 'border-yellow-300 bg-white ring-8 ring-white/70' : 'border-white/80 bg-white/50'
                } ${isTarget ? 'scale-105 border-yellow-300 bg-yellow-100' : ''}`}
              >
                <Drawing piece={piece} muted={!isDone} />
                <span className="text-2xl font-black">{piece.match}</span>
                <span className="rounded-full bg-white/80 px-4 py-2 text-lg font-black">{piece.hint}</span>
              </button>
            )
          })}
        </div>

        {dragging && (
          <div
            className="pointer-events-none fixed z-40 -translate-x-1/2 -translate-y-1/2 rounded-[2rem] bg-white/95 p-4 shadow-2xl ring-8 ring-yellow-300"
            style={{ left: dragging.x, top: dragging.y }}
          >
            <Drawing piece={dragging.piece} />
          </div>
        )}
      </section>

      <div className="mx-auto mt-4 max-w-3xl rounded-3xl bg-white/95 px-6 py-4 text-center text-2xl font-black text-slate-800 shadow-xl sm:text-3xl">
        {message}
      </div>
    </GameShell>
  )
}
