import { useRef, useState } from 'react'

export function useCelebration(duration = 1200) {
  const [isCelebrating, setIsCelebrating] = useState(false)
  const timerRef = useRef<number | null>(null)

  function celebrate() {
    setIsCelebrating(true)

    if (timerRef.current) {
      window.clearTimeout(timerRef.current)
    }

    timerRef.current = window.setTimeout(() => {
      setIsCelebrating(false)
    }, duration)
  }

  return { isCelebrating, celebrate }
}
