import { useEffect, useId, useMemo, useState } from 'react'
import Box from '@mui/material/Box'
import { visuallyHidden } from '@mui/utils'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { colors, fonts } from '../theme'

/*
 * "SIMAKOOV°" preloader: wavy ribbons flow diagonally inside the letterforms.
 * Effect adapted from "The Xandali Effect: Animated Logo" by Gray Ghost (MIT),
 * https://codepen.io/grayghostvisuals/pen/pjbNQY — the word is a clipPath and
 * a stack of wave bands slides through it. The original GreenSock timeline is
 * replaced by a CSS transform loop; the palette follows the site's accent.
 */

/** viewBox size; the word is stretched to fill `TEXT_WIDTH`. */
const W = 760
const H = 150
const TEXT_X = 10
const TEXT_WIDTH = 690
const BASELINE = 128

/** Wave band geometry. One loop moves the stack by one colour period. */
const BAND = 20
const AMPLITUDE = 9
const WAVELENGTH = 190
const BAND_COLORS = [colors.gold, colors.goldLight, '#3d4a08', colors.goldDark, colors.text, '#161c02']
const PERIOD = BAND * BAND_COLORS.length
/** Seconds per seamless loop. */
const LOOP = 2.4

/** Shortest time the logo stays up, and a hard cap so a slow `load` never blocks the page. */
const MIN_VISIBLE_MS = 2600
const MAX_VISIBLE_MS = 6000

/** Closed path for one wavy band whose top edge sits at `y`. */
function bandPath(y: number) {
  const x0 = -WAVELENGTH * 2
  const x1 = W + WAVELENGTH * 2
  const step = 10
  const top: string[] = []
  const bottom: string[] = []
  for (let x = x0; x <= x1; x += step) {
    const dy = Math.sin((x / WAVELENGTH) * Math.PI * 2) * AMPLITUDE
    top.push(`${x},${(y + dy).toFixed(2)}`)
    bottom.unshift(`${x},${(y + BAND + dy).toFixed(2)}`)
  }
  return `M${top.join('L')}L${bottom.join('L')}Z`
}

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

type LoaderProps = {
  /** Accessible status text while loading. */
  label: string
  /** Word drawn as the logo. */
  logo?: string
  /** Called once the overlay has started leaving — start page intros here. */
  onDone: () => void
}

export default function Loader({ label, logo = 'SIMAKOOV', onDone }: LoaderProps) {
  const reduce = useReducedMotion()
  const loaded = useWindowLoaded()
  const [minElapsed, setMinElapsed] = useState(false)
  const [maxElapsed, setMaxElapsed] = useState(false)
  // Reduced motion: no loader at all, the page appears immediately.
  const visible = !reduce && !((loaded && minElapsed) || maxElapsed)
  const clipId = `loader-clip-${useId().replace(/:/g, '')}`

  // Enough bands to cover the word plus one full period of travel.
  const bands = useMemo(() => {
    const count = Math.ceil((H + PERIOD + AMPLITUDE * 2) / BAND) + BAND_COLORS.length
    return Array.from({ length: count }, (_, i) => ({
      d: bandPath(i * BAND - PERIOD - AMPLITUDE),
      fill: BAND_COLORS[i % BAND_COLORS.length],
    }))
  }, [])

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

  const textProps = {
    x: TEXT_X,
    y: BASELINE,
    textLength: TEXT_WIDTH,
    lengthAdjust: 'spacingAndGlyphs',
    fontFamily: fonts.sans,
    fontWeight: 700,
    fontSize: 150,
  } as const

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
            '@keyframes loaderFlow': {
              from: { transform: 'translate(0px, 0px)' },
              to: { transform: `translate(${WAVELENGTH}px, ${PERIOD}px)` },
            },
          }}
        >
          <Box component="span" sx={visuallyHidden}>
            {label}
          </Box>
          <Box
            component={motion.svg}
            aria-hidden
            viewBox={`0 0 ${W} ${H}`}
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ scale: 1.08, opacity: 0, filter: 'blur(8px)' }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            sx={{
              width: 'clamp(280px, 56vw, 720px)',
              height: 'auto',
              overflow: 'visible',
              filter: `drop-shadow(0 0 18px ${colors.gold}22)`,
            }}
          >
            <defs>
              <clipPath id={clipId}>
                <text {...textProps}>{logo}</text>
              </clipPath>
            </defs>

            <g clipPath={`url(#${clipId})`}>
              <rect width={W} height={H} fill="#0d0d0d" />
              <Box component="g" sx={{ animation: `loaderFlow ${LOOP}s linear infinite` }}>
                {bands.map((b, i) => (
                  <path key={i} d={b.d} fill={b.fill} stroke="rgba(255,255,255,0.06)" strokeWidth={3} />
                ))}
              </Box>
            </g>

            {/* Hairline outline keeps the letter edges crisp against the dark bg. */}
            <text {...textProps} fill="none" stroke={colors.goldDark} strokeWidth={1} strokeOpacity={0.6}>
              {logo}
            </text>

            {/* ° — same ring as the header wordmark */}
            <circle cx={TEXT_X + TEXT_WIDTH + 30} cy={30} r={11} fill="none" stroke={colors.gold} strokeWidth={6} />
          </Box>
        </Box>
      )}
    </AnimatePresence>
  )
}
