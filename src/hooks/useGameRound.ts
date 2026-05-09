import { useState } from 'react'

export function useGameRound(maxRounds: number) {
  const [roundIndex, setRoundIndex] = useState(0)

  function nextRound() {
    setRoundIndex((current) => (current + 1) % maxRounds)
  }

  function resetRounds() {
    setRoundIndex(0)
  }

  return {
    roundIndex,
    roundNumber: roundIndex + 1,
    nextRound,
    resetRounds,
  }
}
