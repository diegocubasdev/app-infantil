import type { ButtonHTMLAttributes, ReactNode } from 'react'

type KidCardProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode
  active?: boolean
}

export function KidCard({ children, active = false, className = '', ...props }: KidCardProps) {
  return (
    <button
      type="button"
      className={`rounded-[2rem] bg-white/90 p-4 text-slate-800 shadow-xl transition hover:scale-[1.02] active:scale-95 ${
        active ? 'scale-105 ring-8 ring-yellow-300' : 'ring-4 ring-white/60'
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
