import { useState } from 'react'

export function useLocalBestScore(key: string) {
  const [bestScore, setBestScore] = useState(() => {
    const saved = window.localStorage.getItem(key)
    return saved ? Number(saved) || 0 : 0
  })

  function saveBestScore(score: number) {
    setBestScore((current) => {
      const next = Math.max(current, score)
      window.localStorage.setItem(key, String(next))
      return next
    })
  }

  return { bestScore, saveBestScore }
}
