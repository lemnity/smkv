import { useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import { visuallyHidden } from '@mui/utils'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { colors } from '../theme'

/*
 * Stroke-drawn "Simakoov°" preloader.
 * Technique adapted from "Stroke Logo Animation" by Jon Kantner (MIT),
 * https://codepen.io/jkantner/pen/dyZjWvG — three stacked copies of the logo
 * draw themselves with a stagger, the faint ones leaving a trail behind the
 * solid one.
 */

/** Seconds one layer takes to draw the whole word. */
const DRAW = 2
/** Delay of each stacked layer and its opacity. */
const LAYERS = [
  { delay: 0, opacity: 0.2 },
  { delay: 0.33, opacity: 0.2 },
  { delay: 0.67, opacity: 1 },
] as const
/** Pause on the finished logo before the overlay leaves. */
const HOLD = 0.35
const MIN_VISIBLE_MS = (LAYERS[LAYERS.length - 1].delay + DRAW + HOLD) * 1000
/** Never block the page longer than this, even if `load` is slow. */
const MAX_VISIBLE_MS = 6000

/**
 * Letter strokes in a 230×48 box (baseline y=39, x-height y≈17.5).
 * `from`/`to` are the fraction of the layer's draw time the stroke occupies,
 * so multi-stroke letters draw in order (stem, then arch, …).
 */
const STROKES: { d: string; from: number; to: number }[] = [
  // S
  {
    d: 'M22.672,14.012s-1.362-5.62-8.259-5.62c-6.386,0-8.536,4.088-8.6,7.493-.171,9.026,18.051,4.939,18.051,16.008,0,3.321-1.618,7.152-9.452,7.152-7.918,0-9.451-7.663-9.451-7.663',
    from: 0,
    to: 1,
  },
  // i
  { d: 'M33,17.5V39', from: 0, to: 0.6 },
  { d: 'M33,9.5v0.01', from: 0.6, to: 1 },
  // m
  { d: 'M44,17.5V39', from: 0, to: 0.4 },
  { d: 'M44,26c0-5.3,3.2-8.6,7.5-8.6s7.5,3.3,7.5,8.6V39', from: 0.25, to: 0.75 },
  { d: 'M59,26c0-5.3,3.2-8.6,7.5-8.6s7.5,3.3,7.5,8.6V39', from: 0.5, to: 1 },
  // a
  { d: 'M102.5,28.3a9.5,10.6,0,1,0,-19,0a9.5,10.6,0,1,0,19,0', from: 0, to: 0.7 },
  { d: 'M102.5,17.5V39', from: 0.4, to: 1 },
  // k
  { d: 'M113,7.3V39.3', from: 0, to: 0.5 },
  { d: 'M127.1,16.4L117.1,27L127.1,39.2', from: 0.5, to: 1 },
  // o, o
  { d: 'M146.5,18.3a9.9,10.5,0,1,0,0,21a9.9,10.5,0,1,0,0,-21', from: 0, to: 1 },
  { d: 'M176,18.3a9.9,10.5,0,1,0,0,21a9.9,10.5,0,1,0,0,-21', from: 0, to: 1 },
  // v
  { d: 'M194.5,17.5L203.5,39L212.5,17.5', from: 0, to: 1 },
  // ° — same ring as the header wordmark
  { d: 'M221.5,6.5a3,3,0,1,0,0,6a3,3,0,1,0,0,-6', from: 0.6, to: 1 },
]

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

/** Resolves once the window `load` event has fired. */
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
    if (!visible) onDone()
  }, [visible, onDone])

  useScrollLock(visible)

  return (
    <AnimatePresence>
      {visible && (
        <Box
          key="loader"
          component={motion.div}
          role="status"
          aria-live="polite"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: [0.65, 0, 0.35, 1] }}
          sx={{
            position: 'fixed',
            inset: 0,
            // Above the drawer, below the custom cursor (2000).
            zIndex: 1999,
            display: 'grid',
            placeItems: 'center',
            bgcolor: colors.bg,
            '@keyframes loaderDraw': {
              from: { strokeDashoffset: 1 },
              to: { strokeDashoffset: 0 },
            },
          }}
        >
          <Box component="span" sx={visuallyHidden}>
            {label}
          </Box>
          <Box
            component={motion.svg}
            aria-hidden
            viewBox="0 0 230 48"
            fill="none"
            stroke={colors.gold}
            strokeWidth={3.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            exit={{ scale: 1.06, opacity: 0, filter: 'blur(6px)' }}
            transition={{ duration: 0.6, ease: [0.65, 0, 0.35, 1] }}
            sx={{ width: 'clamp(250px, 41vw, 500px)', height: 'auto', overflow: 'visible' }}
          >
            {LAYERS.map((layer) => (
              <g key={layer.delay} opacity={layer.opacity}>
                {STROKES.map((s) => (
                  <Box
                    key={s.d}
                    component="path"
                    d={s.d}
                    pathLength={1}
                    sx={{
                      strokeDasharray: '1 1',
                      strokeDashoffset: 1,
                      animation: 'loaderDraw cubic-bezier(0.5, 0, 0.5, 1) both',
                      animationDuration: `${(s.to - s.from) * DRAW}s`,
                      animationDelay: `${layer.delay + s.from * DRAW}s`,
                    }}
                  />
                ))}
              </g>
            ))}
          </Box>
        </Box>
      )}
    </AnimatePresence>
  )
}
