import type { ButtonHTMLAttributes, ReactNode } from 'react'

type BigButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode
}

export function BigButton({ children, className = '', ...props }: BigButtonProps) {
  return (
    <button
      className={`rounded-3xl px-8 py-5 text-3xl font-black shadow-xl transition active:scale-95 ${className}`}
      type="button"
      {...props}
    >
      {children}
    </button>
  )
}
