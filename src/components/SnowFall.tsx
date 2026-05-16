import { useEffect, useState } from 'react'

interface Snowflake {
  id: number
  left: number
  animationDuration: number
  opacity: number
  size: number
  delay: number
}

function FallingSnow() {
  const [snowflakes, setSnowflakes] = useState<Snowflake[]>([])

  useEffect(() => {
    // Generate snowflakes
    const flakes: Snowflake[] = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: Math.random() * 100, // Random horizontal position (%)
      animationDuration: 5 + Math.random() * 30, // 5-15 seconds fall time
      opacity: 0.3 + Math.random() * 0.7, // 0.3-1.0 opacity
      size: 2 + Math.random() * 4, // 2-6px size
      delay: Math.random() * 5, // 0-5s delay
    }))
    setSnowflakes(flakes)
  }, [])

  return (
    <div className="pointer-events-none fixed inset-0 z-10 overflow-hidden">
      {snowflakes.map((flake) => (
        <div
          key={flake.id}
          className="absolute animate-fall"
          style={{
            left: `${flake.left}%`,
            top: '-10px',
            width: `${flake.size}px`,
            height: `${flake.size}px`,
            opacity: flake.opacity,
            animationDuration: `${flake.animationDuration}s`,
            animationDelay: `${flake.delay}s`,
          }}
        >
          {/* Ice crystal / snowflake */}
          <div className="size-full rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]"></div>
        </div>
      ))}
    </div>
  )
}

export default FallingSnow