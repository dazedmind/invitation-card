import React from 'react'
import StarryBackground from './StarryBackground'

function Loading() {
  return (
    <Shell>
      <div className="flex flex-col items-center justify-center gap-4">
        <div className="relative">
          {/* Spinning ring */}
          <div className="size-16 animate-spin rounded-full border-4 border-gray-700 border-t-sky-500"></div>
          {/* Inner glow */}
          <div className="absolute inset-0 size-16 animate-pulse rounded-full bg-sky-500/20 blur-xl"></div>
        </div>
        <p className="animate-pulse text-lg text-gray-400">Loading...</p>
      </div>
    </Shell>
  )
}

function Shell({
  children,
  wide = false,
  className,
}: {
  children: React.ReactNode
  wide?: boolean
  className?: string
}) {
  return (
    <main
      className={`relative flex min-h-screen flex-col items-center justify-center overflow-y-auto bg-linear-to-b from-slate-950 to-gray-900 px-4 py-10 text-white ${className}`}
    >
      <StarryBackground />
      <div
        className={`relative z-10 flex w-full flex-col items-center ${wide ? 'max-w-5xl' : 'max-w-md'}`}
      >
        {children}
      </div>
    </main>
  )
}

export default Loading