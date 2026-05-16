import { useMemo } from 'react'

function starProps(seed: number) {
  const r = (n: number) => {
    const x = Math.sin(seed * 12.9898 + n * 78.233) * 43758.5453
    return x - Math.floor(x)
  }
  return {
    left: `${r(1) * 100}%`,
    top: `${r(2) * 100}%`,
    size: r(3) * 2 + 0.5,
    duration: 2 + r(4) * 4,
    delay: r(5) * 6,
    blur: r(6) > 0.85,
  }
}

export default function StarryBackground() {
  const stars = useMemo(
    () =>
      Array.from({ length: 140 }, (_, i) => ({
        id: i,
        ...starProps(i + 1),
      })),
    [],
  )

  return (
    <div
      className="pointer-events-none absolute inset-0 z-0 min-h-full"
      aria-hidden
    >
      {stars.map((s) => (
        <span
          key={s.id}
          className={s.blur ? 'star star-glow' : 'star'}
          style={{
            left: s.left,
            top: s.top,
            width: s.size,
            height: s.size,
            animationDuration: `${s.duration}s`,
            animationDelay: `${-s.delay}s`,
          }}
        />
      ))}
    </div>
  )
}
