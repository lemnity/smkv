import { useCallback, useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import { visuallyHidden } from '@mui/utils'
import { AnimatePresence, motion, stagger, useAnimate, useReducedMotion, type AnimationSequence } from 'motion/react'
import { colors, fonts } from '../theme'
import { BASE } from '../utils/base'
import { PORTRAIT_MASK } from './hero/portraitMask'

/*
 * "SIMA | KOOV" preloader: letters rise, the word splits around a window that
 * flicks through a couple of works and settles on the portrait; the portrait
 * then grows out of the window and lands exactly on its place in the hero
 * while the lime screen darkens into the page.
 * Adapted from "Willem Loading Animation" by Osmo (MIT),
 * https://codepen.io/osmosupply/pen/wBGYEMd — GSAP timeline ported to motion.
 */

const START = 'SIMA'
const END = 'KOOV'
/** Works that flash in the window before the portrait, top-most first. */
const FLASH = [`${BASE}works/work-01.webp`, `${BASE}works/work-04.webp`]
const PORTRAIT = `${BASE}assets/portrait-hero.png`

/** Pace relative to the original timeline. */
const T = 0.8
const ease: [number, number, number, number] = [0.87, 0, 0.13, 1] // ≈ GSAP expo.inOut
/** Softer curve for the landing so the hand-over to the page doesn't snap. */
const landEase: [number, number, number, number] = [0.65, 0, 0.35, 1]
const OPEN = 1.25 * T
const FIRST_CUT = OPEN + 1.25 * T - 0.05
const CUT_STEP = 0.5 * T
/** The portrait holds in the window for a beat before it flies out. */
const LAND = FIRST_CUT + CUT_STEP * FLASH.length + 0.35
const FLIGHT = 1.6
/** Never block the page longer than this, even if `load` is slow. */
const MAX_VISIBLE_MS = (LAND + FLIGHT + 2.5) * 1000

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
const coverSx = {
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  pointerEvents: 'none',
  userSelect: 'none',
} as const
const portraitMaskSx = {
  maskImage: PORTRAIT_MASK,
  WebkitMaskImage: PORTRAIT_MASK,
  maskComposite: 'intersect',
  WebkitMaskComposite: 'source-in',
} as const

function Sequence({ onFinished }: { onFinished: () => void }) {
  const [scope, animate] = useAnimate<HTMLDivElement>()

  useEffect(() => {
    let cancelled = false
    const intro: AnimationSequence = [
      ['.ld-letter', { y: ['100%', '0%'] }, { at: 0, duration: 1.25 * T, ease, delay: stagger(0.025) }],
      ['.ld-box', { width: ['0em', '1em'] }, { at: OPEN, duration: 1.25 * T, ease }],
      ['.ld-grow', { width: ['0%', '100%'] }, { at: OPEN, duration: 1.25 * T, ease }],
      ['.ld-start', { x: ['0em', '-0.05em'] }, { at: OPEN, duration: 1.25 * T, ease }],
      ['.ld-end', { x: ['0em', '0.05em'] }, { at: OPEN, duration: 1.25 * T, ease }],
      ...FLASH.map(
        (_, i) =>
          [`.ld-flash-${i}`, { opacity: [1, 0] }, { at: FIRST_CUT + i * CUT_STEP, duration: 0.05, ease: 'linear' }] as AnimationSequence[number],
      ),
      // Hold on the portrait until LAND.
      ['.ld-hold', { opacity: [0, 0] }, { at: LAND - 0.01, duration: 0.01 }],
    ]

    const land = async () => {
      const root = scope.current
      const win = root?.querySelector<HTMLElement>('.ld-grow')
      const photo = root?.querySelector<HTMLElement>('.ld-photo')
      const target = document.querySelector<HTMLElement>('[data-hero-portrait]')?.getBoundingClientRect()
      if (!root || !win || !photo) return

      if (!target || target.width === 0) {
        // No hero portrait to land on: just darken into the page colour.
        await animate('.ld-dark', { opacity: 1 }, { duration: 0.8, ease: landEase })
        return
      }

      const from = win.getBoundingClientRect()
      Object.assign(photo.style, {
        left: `${from.left}px`,
        top: `${from.top}px`,
        width: `${from.width}px`,
        height: `${from.height}px`,
        visibility: 'visible',
      })
      win.style.visibility = 'hidden'

      await Promise.all([
        animate(
          photo,
          { left: target.left, top: target.top, width: target.width, height: target.height, objectPosition: '50% 0%' },
          { duration: FLIGHT, ease: landEase },
        ),
        animate('.ld-dark', { opacity: 1 }, { duration: FLIGHT * 0.8, ease: 'easeInOut' }),
        animate('.ld-start', { x: '-0.6em', opacity: 0 }, { duration: FLIGHT * 0.55, ease }),
        animate('.ld-end', { x: '0.6em', opacity: 0 }, { duration: FLIGHT * 0.55, ease }),
      ])
    }

    const controls = animate(intro)
    controls.then(async () => {
      if (cancelled) return
      await land()
      if (!cancelled) onFinished()
    })
    return () => {
      cancelled = true
      controls.stop()
    }
  }, [animate, scope, onFinished])

  return (
    <Box ref={scope} aria-hidden sx={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
      {/* Page-coloured layer the lime screen darkens into while the portrait lands. */}
      <Box className="ld-dark" sx={{ position: 'absolute', inset: 0, bgcolor: colors.bg, opacity: 0 }} />
      <Box className="ld-hold" sx={{ display: 'none' }} />

      <Box
        sx={{
          // Equal side tracks keep the window exactly at the viewport centre.
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          alignItems: 'center',
          width: '100%',
          whiteSpace: 'nowrap',
          fontFamily: fonts.sans,
          fontWeight: 900, // Gilroy Heavy
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
            <Box className="ld-grow" sx={{ width: 0, height: '100%', position: 'absolute', overflow: 'hidden', bgcolor: colors.bg }}>
              <Box component="img" src={PORTRAIT} alt="" draggable={false} sx={{ ...coverSx, objectPosition: '50% 30%', ...portraitMaskSx }} />
              {FLASH.map((src, i) => (
                <Box
                  key={src}
                  component="img"
                  className={`ld-flash-${i}`}
                  src={src}
                  alt=""
                  draggable={false}
                  sx={{ ...coverSx, zIndex: FLASH.length - i }}
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

      {/* The portrait that flies out of the window onto its place in the hero. */}
      <Box
        component="img"
        className="ld-photo"
        src={PORTRAIT}
        alt=""
        draggable={false}
        sx={{
          position: 'fixed',
          visibility: 'hidden',
          objectFit: 'cover',
          objectPosition: '50% 30%',
          ...portraitMaskSx,
          pointerEvents: 'none',
          zIndex: 2,
        }}
      />
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
          // Opaque from the first frame (nothing of the page shows through); it eases from the
          // page background into lime, and fades out at the end over an identical page.
          initial={{ backgroundColor: colors.bg }}
          animate={{ backgroundColor: colors.gold, transition: { duration: 0.7, ease: 'easeOut' } }}
          exit={{ opacity: 0, transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] } }}
          sx={{
            position: 'fixed',
            inset: 0,
            // Above the drawer, below the custom cursor (2000).
            zIndex: 1999,
            overflow: 'hidden',
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
