import type { ReactNode } from 'react'

type ChoiceTrayProps = {
  title: string
  children: ReactNode
}

export function ChoiceTray({ title, children }: ChoiceTrayProps) {
  return (
    <div className="rounded-[2rem] bg-white/35 p-4 shadow-2xl ring-4 ring-white/60 lg:p-6">
      <div className="mb-4 rounded-3xl bg-white/90 px-5 py-3 text-center text-2xl font-black text-slate-800 shadow-xl">
        {title}
      </div>
      {children}
    </div>
  )
}
