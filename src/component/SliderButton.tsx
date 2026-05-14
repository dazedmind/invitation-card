
import { useCallback, useEffect, useRef, useState } from 'react'
import { GiStarKey } from 'react-icons/gi'

const SLIDE_THUMB = 52
const SLIDE_PAD = 6
const SLIDE_THRESHOLD = 0.88

type SlideToOpenProps = {
  /** Return `false` (or a Promise that resolves to `false`) to snap the thumb back without marking opened. */
  onOpen?: () => boolean | void | Promise<boolean | void>
  disabled?: boolean
  /** When false, a full slide snaps back and shows `blockedMessage` instead of calling `onOpen`. */
  canOpen?: boolean
  blockedMessage?: string
}

export default function SlideToOpen({
  onOpen,
  disabled,
  canOpen = true,
  blockedMessage = 'Please input invitation code',
}: SlideToOpenProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [offset, setOffset] = useState(0)
  const [trackMax, setTrackMax] = useState(0)
  const [sliding, setSliding] = useState(false)
  const [done, setDone] = useState(false)
  const [blockedHint, setBlockedHint] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const canOpenRef = useRef(canOpen)
  canOpenRef.current = canOpen
  const onOpenRef = useRef(onOpen)
  onOpenRef.current = onOpen
  const maxOffsetRef = useRef(0)
  const offsetRef = useRef(0)
  const dragRef = useRef<{
    pointerId: number
    startClientX: number
    startOffset: number
  } | null>(null)

  const recomputeMax = useCallback(() => {
    const el = trackRef.current
    if (!el) return
    const w = el.getBoundingClientRect().width
    const max = Math.max(0, w - SLIDE_PAD * 2 - SLIDE_THUMB)
    maxOffsetRef.current = max
    setTrackMax(max)
    setOffset((o) => Math.min(o, max))
  }, [])

  useEffect(() => {
    recomputeMax()
    const el = trackRef.current
    if (!el || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(recomputeMax)
    ro.observe(el)
    return () => ro.disconnect()
  }, [recomputeMax])

  const setOffsetClamped = useCallback((v: number) => {
    const max = maxOffsetRef.current
    const next = Math.max(0, Math.min(v, max))
    offsetRef.current = next
    setOffset(next)
  }, [])

  const tryFinishOpen = useCallback(() => {
    setOffsetClamped(maxOffsetRef.current)
    setConfirming(true)
    void (async () => {
      let ok = true
      try {
        const result = await onOpenRef.current?.()
        if (result === false) ok = false
      } catch {
        ok = false
      }
      setConfirming(false)
      if (ok) setDone(true)
      else setOffsetClamped(0)
    })()
  }, [setOffsetClamped])

  useEffect(() => {
    if (canOpen) setBlockedHint(false)
  }, [canOpen])

  const onThumbPointerDown = (e: React.PointerEvent) => {
    if (disabled || done || confirming) return
    setBlockedHint(false)
    e.preventDefault()
    ;(e.currentTarget as HTMLButtonElement).setPointerCapture(e.pointerId)
    dragRef.current = {
      pointerId: e.pointerId,
      startClientX: e.clientX,
      startOffset: offsetRef.current,
    }
    setSliding(true)
  }

  const onThumbPointerMove = (e: React.PointerEvent) => {
    const d = dragRef.current
    if (!d || e.pointerId !== d.pointerId) return
    const dx = e.clientX - d.startClientX
    setOffsetClamped(d.startOffset + dx)
  }

  const onThumbPointerEnd = (e: React.PointerEvent) => {
    const d = dragRef.current
    if (!d || e.pointerId !== d.pointerId) return
    try {
      ;(e.currentTarget as HTMLButtonElement).releasePointerCapture(e.pointerId)
    } catch {
      /* already released */
    }
    dragRef.current = null
    setSliding(false)

    const max = maxOffsetRef.current
    if (done) return
    if (max <= 0) {
      setOffsetClamped(0)
      return
    }
    if (offsetRef.current >= max * SLIDE_THRESHOLD) {
      if (canOpenRef.current) tryFinishOpen()
      else {
        setOffsetClamped(0)
        setBlockedHint(true)
      }
    } else setOffsetClamped(0)
  }

  const progress = trackMax > 0 ? offset / trackMax : 0
  const hintOpacity = Math.max(0.2, 0.55 - progress * 0.55)

  return (
    <div
      ref={trackRef}
      className={[
        'relative h-14 w-full max-w-md select-none rounded-full border border-white/15 bg-black/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-sm transition-[opacity,box-shadow,border-color] duration-200',
        disabled ? 'pointer-events-none opacity-50' : '',
        confirming ? 'opacity-90' : '',
      ].join(' ')}
    >
      <div className='pointer-events-none absolute inset-0 flex items-center justify-center px-14'>
        {done ? (
          <span
            className='text-sm font-medium tracking-wide text-emerald-300/95'
            aria-live='polite'
          >
            Opened
          </span>
        ) : confirming ? (
          <span className='text-sm font-medium tracking-wide text-sky-200/90' aria-live='polite'>
            Checking…
          </span>
        ) : blockedHint ? (
          <span
            className='text-sm font-medium tracking-wide text-red-400'
            aria-live='assertive'
          >
            {blockedMessage}
          </span>
        ) : (
          <span
            className='slide-to-open__hint text-sm font-medium tracking-wide'
            style={{ opacity: hintOpacity }}
          >
            Slide to open
          </span>
        )}
      </div>

      <button
        type='button'
        disabled={disabled || done || confirming}
        aria-label={done ? 'Opened' : confirming ? 'Checking invitation' : 'Slide to open'}
        className={[
          'touch-none absolute top-1/2 flex h-[calc(100%-12px)] -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-linear-to-b from-slate-100 to-slate-300 text-amber-700 shadow-lg outline-none ring-sky-400/50 focus-visible:ring-2',
          sliding ? 'cursor-grabbing scale-[1.02]' : 'cursor-grab',
          done ? 'cursor-default border-emerald-400/40 from-emerald-100 to-emerald-300 text-emerald-800' : '',
          !sliding && !done
            ? 'transition-[left,transform,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]'
            : 'transition-shadow duration-150',
        ].join(' ')}
        style={{ left: SLIDE_PAD + offset, width: SLIDE_THUMB }}
        onPointerDown={onThumbPointerDown}
        onPointerMove={onThumbPointerMove}
        onPointerUp={onThumbPointerEnd}
        onPointerCancel={onThumbPointerEnd}
      >
        <GiStarKey size={22} className='drop-shadow-sm' aria-hidden />
      </button>
    </div>
  )
}