type CelebrationOverlayProps = {
  show: boolean
  message?: string
}

const sparkles = ['✨', '⭐', '💛', '🌟', '✨', '⭐']

export function CelebrationOverlay({ show, message = 'Muito bem!' }: CelebrationOverlayProps) {
  if (!show) {
    return null
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-30 flex items-center justify-center bg-white/10">
      <div className="relative rounded-[2rem] bg-white/95 px-8 py-6 text-center text-slate-800 shadow-2xl ring-8 ring-yellow-300">
        <div className="mb-2 text-6xl">🎉</div>
        <p className="text-3xl font-black sm:text-4xl">{message}</p>
        {sparkles.map((sparkle, index) => (
          <span
            key={`${sparkle}-${index}`}
            className="absolute animate-ping text-3xl"
            style={{
              left: `${-20 + index * 26}%`,
              top: `${index % 2 === 0 ? -25 : 92}%`,
              animationDelay: `${index * 90}ms`,
            }}
          >
            {sparkle}
          </span>
        ))}
      </div>
    </div>
  )
}
