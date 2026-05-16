import { useEffect, useRef, useState } from 'react'
import { GoMute, GoUnmute } from 'react-icons/go'

interface BackgroundMusicProps {
  src: string
  volume?: number // 0 to 1
}

function BackgroundMusic({ src, volume = 0.3 }: BackgroundMusicProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [hasInteracted, setHasInteracted] = useState(false)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    audio.volume = volume

    // Try to autoplay
    const playAudio = async () => {
      try {
        await audio.play()
        setIsPlaying(true)
        setHasInteracted(true)
      } catch (error) {
        // Autoplay blocked - wait for user interaction
        console.log('Autoplay blocked, waiting for user interaction')
      }
    }

    playAudio()

    // Fallback: play on first user interaction
    const handleInteraction = async () => {
      if (!hasInteracted && audio.paused) {
        try {
          await audio.play()
          setIsPlaying(true)
          setHasInteracted(true)
        } catch (error) {
          console.error('Failed to play audio:', error)
        }
      }
    }

    // Listen for any user interaction
    document.addEventListener('click', handleInteraction, { once: true })
    document.addEventListener('touchstart', handleInteraction, { once: true })
    document.addEventListener('keydown', handleInteraction, { once: true })

    return () => {
      document.removeEventListener('click', handleInteraction)
      document.removeEventListener('touchstart', handleInteraction)
      document.removeEventListener('keydown', handleInteraction)
    }
  }, [volume, hasInteracted])

  const toggleMute = () => {
    const audio = audioRef.current
    if (!audio) return

    if (isMuted) {
      audio.muted = false
      setIsMuted(false)
    } else {
      audio.muted = true
      setIsMuted(true)
    }
  }

  return (
    <>
      <audio
        ref={audioRef}
        src={src}
        loop
        preload="auto"
      />
      
      {/* Floating music control button */}
      <div className="fixed bottom-6 right-6 z-50 flex gap-2">
        <button
          onClick={toggleMute}
          className="group flex items-center gap-2 rounded-full border border-white/20 bg-slate-900/80 px-4 py-3 text-white shadow-lg backdrop-blur-sm transition-all hover:border-white/30 hover:bg-slate-800/90"
          aria-label={isMuted ? 'Unmute music' : 'Mute music'}
        >
          {isMuted ? (
            <GoMute className="text-xl" />
          ) : (
            <GoUnmute className="text-xl" />
          )}
          <span className="text-sm">
            {isMuted ? 'Unmuted' : 'Music'}
          </span>
          
          {/* Sound wave animation when playing and not muted */}
          {isPlaying && !isMuted && (
            <div className="flex items-center gap-0.5">
              <div className="h-3 w-0.5 animate-pulse bg-sky-400 [animation-delay:0ms]"></div>
              <div className="h-4 w-0.5 animate-pulse bg-sky-400 [animation-delay:150ms]"></div>
              <div className="h-2 w-0.5 animate-pulse bg-sky-400 [animation-delay:300ms]"></div>
            </div>
          )}
        </button>
      </div>
    </>
  )
}

export default BackgroundMusic