import { useCallback, useEffect, useRef, useState } from 'react'
import Box from '@mui/material/Box'
import { visuallyHidden } from '@mui/utils'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { colors } from '../theme'
import { LOGO_INFINITY, LOGO_INFINITY_TRACK, LOGO_LETTERS } from './logoArtwork'

/*
 * SIMAKOOV preloader: the logo, with a comet of glowing dots running endlessly
 * along the ∞ that replaces the double O.
 * Adapted from "Infinite loading" by Charles Strube (MIT),
 * https://codepen.io/Goldskin/pen/zYmdOpX — the 50-dot trail is kept, but it
 * follows the logo's own ∞ centre line instead of two hard-coded circles.
 */

const DOTS = 50
/** Seconds for the head to complete one loop of the ∞. */
const LOOP = 2.2
/** Fraction of the loop the trail covers, head to tail. */
const TRAIL = 0.42
const HEAD_R = 5.4
const TAIL_R = 1.2
/** Shortest time the logo stays up, and a hard cap so a slow `load` never blocks the page. */
const MIN_VISIBLE_MS = 2600
const MAX_VISIBLE_MS = 6000

/** Lock page scroll while the overlay is up. */
function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return
    const root = document.documentElement
    const prev = root.style.overflow
    root.style.overflow = 'hidden'
    return () => {
      root.style.overflow = prev
    }
  }, [active])
}

/** True once the window `load` event has fired. */
function useWindowLoaded() {
  const [loaded, setLoaded] = useState(() => document.readyState === 'complete')
  useEffect(() => {
    if (loaded) return
    const onLoad = () => setLoaded(true)
    window.addEventListener('load', onLoad, { once: true })
    return () => window.removeEventListener('load', onLoad)
  }, [loaded])
  return loaded
}

/** The dot trail: positions are sampled from the ∞ centre line every frame. */
function InfinityTrail() {
  const trackRef = useRef<SVGPathElement>(null)
  const dotsRef = useRef<(SVGCircleElement | null)[]>([])

  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    const length = track.getTotalLength()
    let frame = 0
    const start = performance.now()
    const tick = (now: number) => {
      const head = (((now - start) / 1000) % LOOP) / LOOP
      dotsRef.current.forEach((dot, i) => {
        if (!dot) return
        const at = (head - (i / (DOTS - 1)) * TRAIL + 1) % 1
        const p = track.getPointAtLength(at * length)
        dot.setAttribute('cx', p.x.toFixed(2))
        dot.setAttribute('cy', p.y.toFixed(2))
      })
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [])

  return (
    <g>
      <path ref={trackRef} d={LOGO_INFINITY_TRACK} fill="none" stroke="none" />
      {/* Paint tail first so the head sits on top. */}
      {Array.from({ length: DOTS }, (_, i) => DOTS - 1 - i).map((i) => {
        const k = i / (DOTS - 1) // 0 = head, 1 = tail end
        return (
          <circle
            key={i}
            ref={(el) => {
              dotsRef.current[i] = el
            }}
            r={HEAD_R + (TAIL_R - HEAD_R) * k}
            fill={i === 0 ? colors.goldLight : colors.gold}
            opacity={1 - k * 0.92}
          />
        )
      })}
    </g>
  )
}

type LoaderProps = {
  /** Accessible status text while loading. */
  label: string
  /** Called once the overlay has started leaving — start page intros here. */
  onDone: () => void
}

export default function Loader({ label, onDone }: LoaderProps) {
  const reduce = useReducedMotion()
  const loaded = useWindowLoaded()
  const [minElapsed, setMinElapsed] = useState(false)
  const [maxElapsed, setMaxElapsed] = useState(false)
  // Reduced motion: no loader at all, the page appears immediately.
  const visible = !reduce && !((loaded && minElapsed) || maxElapsed)
  const done = useCallback(() => onDone(), [onDone])

  useEffect(() => {
    if (reduce) return
    const min = window.setTimeout(() => setMinElapsed(true), MIN_VISIBLE_MS)
    const max = window.setTimeout(() => setMaxElapsed(true), MAX_VISIBLE_MS)
    return () => {
      window.clearTimeout(min)
      window.clearTimeout(max)
    }
  }, [reduce])

  useEffect(() => {
    if (!visible) done()
  }, [visible, done])

  useScrollLock(visible)

  return (
    <AnimatePresence>
      {visible && (
        <Box
          key="loader"
          component={motion.div}
          role="status"
          aria-live="polite"
          exit={{ opacity: 0, transition: { duration: 0.8, ease: [0.4, 0, 0.2, 1] } }}
          sx={{
            position: 'fixed',
            inset: 0,
            // Above the drawer, below the custom cursor (2000).
            zIndex: 1999,
            display: 'grid',
            placeItems: 'center',
            bgcolor: colors.bg,
          }}
        >
          <Box component="span" sx={visuallyHidden}>
            {label}
          </Box>
          <Box
            component={motion.svg}
            aria-hidden
            viewBox="-6 -8 412 71"
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.06, filter: 'blur(6px)' }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            sx={{ width: 'clamp(260px, 44vw, 600px)', height: 'auto', overflow: 'visible' }}
          >
            <defs>
              <filter id="loaderGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="2.4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            {LOGO_LETTERS.map((d) => (
              <path key={d.slice(0, 12)} d={d} fill={colors.text} />
            ))}
            {/* The ∞ ribbon is a dim rail; the dots light it up as they pass. */}
            <path d={LOGO_INFINITY} fill={colors.gold} opacity={0.16} />
            <g filter="url(#loaderGlow)">
              <InfinityTrail />
            </g>
          </Box>
        </Box>
      )}
    </AnimatePresence>
  )
}
