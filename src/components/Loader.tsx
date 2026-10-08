import { useCallback, useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import { visuallyHidden } from '@mui/utils'
import { AnimatePresence, motion, stagger, useAnimate, useReducedMotion, type AnimationSequence } from 'motion/react'
import { colors, fonts } from '../theme'
import { BASE } from '../utils/base'

/*
 * "SIMA | KOOV" preloader: letters rise, the word splits around a window that
 * flicks through a few works, then the window grows to fill the screen in the
 * page background colour and hands over to the site.
 * Adapted from "Willem Loading Animation" by Osmo (MIT),
 * https://codepen.io/osmosupply/pen/wBGYEMd — GSAP timeline ported to motion.
 */

const START = 'SIMA'
const END = 'KOOV'
/** Works that flash in the window, top-most first. */
const FLASH = [`${BASE}works/work-01.webp`, `${BASE}works/work-04.webp`, `${BASE}works/work-10.webp`]

/** Pace relative to the original timeline. */
const T = 0.8
const ease: [number, number, number, number] = [0.87, 0, 0.13, 1] // ≈ GSAP expo.inOut
const OPEN = 1.25 * T
const FIRST_CUT = OPEN + 1.25 * T - 0.05
const CUT_STEP = 0.5 * T
const GROW = FIRST_CUT + CUT_STEP * (FLASH.length - 1) + 1.25 * T
const TOTAL_MS = (GROW + 2 * T) * 1000
/** Never block the page longer than this, even if `load` is slow. */
const MAX_VISIBLE_MS = TOTAL_MS + 2500

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

const half = { display: 'flex', overflow: 'hidden', position: 'relative' } as const
const letterSx = { display: 'block', transform: 'translateY(100%)' } as const

function Sequence({ onFinished }: { onFinished: () => void }) {
  const [scope, animate] = useAnimate()

  useEffect(() => {
    const flashes: AnimationSequence = FLASH.map((_, i) => [
      `.ld-flash-${i}`,
      { opacity: [1, 0] },
      { at: FIRST_CUT + i * CUT_STEP, duration: 0.05, ease: 'linear' },
    ])
    const sequence: AnimationSequence = [
      ['.ld-letter', { y: ['100%', '0%'] }, { at: 0, duration: 1.25 * T, ease, delay: stagger(0.025) }],
      ['.ld-box', { width: ['0em', '1em'] }, { at: OPEN, duration: 1.25 * T, ease }],
      ['.ld-grow', { width: ['0%', '100%'] }, { at: OPEN, duration: 1.25 * T, ease }],
      ['.ld-start', { x: ['0em', '-0.05em'] }, { at: OPEN, duration: 1.25 * T, ease }],
      ['.ld-end', { x: ['0em', '0.05em'] }, { at: OPEN, duration: 1.25 * T, ease }],
      ...flashes,
      // Grow well past the viewport (any aspect ratio) so no lime edge survives the fade.
      ['.ld-grow', { width: '300vmax', height: '300vmax' }, { at: GROW, duration: 2 * T, ease }],
      ['.ld-box', { width: '300vmax' }, { at: GROW, duration: 2 * T, ease }],
    ]
    const controls = animate(sequence)
    controls.then(onFinished)
    return () => controls.stop()
  }, [animate, onFinished])

  return (
    <Box
      ref={scope}
      aria-hidden
      sx={{
        // Equal side tracks keep the window exactly at the viewport centre, so it grows
        // out symmetrically and covers every edge at the same moment.
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr',
        alignItems: 'center',
        width: '100%',
        whiteSpace: 'nowrap',
        fontFamily: fonts.sans,
        fontWeight: 600,
        fontSize: 'clamp(56px, 12.5vw, 190px)',
        lineHeight: 0.75,
        letterSpacing: '-0.02em',
        color: colors.bg,
        position: 'relative',
      }}
    >
      <Box className="ld-start" sx={{ ...half, justifySelf: 'end' }}>
        {[...START].map((ch, i) => (
          <Box key={i} component="span" className="ld-letter" sx={letterSx}>
            {ch}
          </Box>
        ))}
      </Box>

      <Box
        className="ld-box"
        // Stretch to the row height (the letters' line box) so the window has a real height.
        sx={{ width: 0, alignSelf: 'stretch', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', position: 'relative' }}
      >
        <Box sx={{ minWidth: '1em', height: '95%', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
          <Box
            className="ld-grow"
            sx={{ width: 0, height: '100%', position: 'absolute', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
          >
            {/* Final frame is the page background, so the grown window becomes the site. */}
            <Box sx={{ position: 'absolute', inset: 0, bgcolor: colors.bg }} />
            {FLASH.map((src, i) => (
              <Box
                key={src}
                component="img"
                className={`ld-flash-${i}`}
                src={src}
                alt=""
                draggable={false}
                sx={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  zIndex: FLASH.length - i,
                  pointerEvents: 'none',
                  userSelect: 'none',
                }}
              />
            ))}
          </Box>
        </Box>
      </Box>

      <Box className="ld-end" sx={{ ...half, justifySelf: 'start' }}>
        {[...END].map((ch, i) => (
          <Box key={i} component="span" className="ld-letter" sx={letterSx}>
            {ch}
          </Box>
        ))}
      </Box>
    </Box>
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
  const [finished, setFinished] = useState(false)
  const [maxElapsed, setMaxElapsed] = useState(false)
  const handleFinished = useCallback(() => setFinished(true), [])
  // Reduced motion: no loader at all, the page appears immediately.
  const visible = !reduce && !((loaded && finished) || maxElapsed)

  useEffect(() => {
    if (reduce) return
    const max = window.setTimeout(() => setMaxElapsed(true), MAX_VISIBLE_MS)
    return () => window.clearTimeout(max)
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
          transition={{ duration: 0.45, ease: 'easeOut' }}
          sx={{
            position: 'fixed',
            inset: 0,
            // Above the drawer, below the custom cursor (2000).
            zIndex: 1999,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'hidden',
            bgcolor: colors.gold,
          }}
        >
          <Box component="span" sx={visuallyHidden}>
            {label}
          </Box>
          <Sequence onFinished={handleFinished} />
        </Box>
      )}
    </AnimatePresence>
  )
}
