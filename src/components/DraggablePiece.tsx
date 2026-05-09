import type { ButtonHTMLAttributes, ReactNode } from 'react'

type DraggablePieceProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode
  active?: boolean
  dragging?: boolean
}

export function DraggablePiece({
  children,
  active = false,
  dragging = false,
  className = '',
  ...props
}: DraggablePieceProps) {
  return (
    <button
      type="button"
      draggable
      className={`touch-none rounded-[2rem] bg-white p-4 text-6xl shadow-xl transition active:scale-95 sm:text-7xl ${
        active ? 'scale-105 ring-8 ring-yellow-300' : ''
      } ${dragging ? 'opacity-70' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
