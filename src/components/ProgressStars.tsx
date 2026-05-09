type ProgressStarsProps = {
  value: number
  total: number
  label?: string
}

export function ProgressStars({ value, total, label = 'Progresso' }: ProgressStarsProps) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 rounded-3xl bg-white/90 px-5 py-3 text-slate-800 shadow-xl">
      <span className="text-lg font-black sm:text-xl">{label}</span>
      <div className="flex gap-1 text-2xl sm:text-3xl" aria-label={`${value} de ${total}`}>
        {Array.from({ length: total }, (_, index) => (
          <span key={index} className={index < value ? 'scale-110' : 'opacity-35 grayscale'}>
            ⭐
          </span>
        ))}
      </div>
    </div>
  )
}
