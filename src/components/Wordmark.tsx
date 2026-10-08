import { useEffect, useRef } from 'react'
import Box from '@mui/material/Box'
import useMediaQuery from '@mui/material/useMediaQuery'
import { animate, motion, useMotionValue, useReducedMotion, useSpring } from 'motion/react'
import { colors, fonts } from '../theme'

/** How far a pupil may travel from the centre of its "O", in em. */
const REACH = 0.085
/** Pupil diameter, in em. */
const PUPIL = 0.16
const spring = { stiffness: 260, damping: 22, mass: 0.6 }

type Eyes = { tracking: boolean; blink: ReturnType<typeof useMotionValue<number>> }

/** One "O" glyph with a pupil that looks toward the pointer. */
function Eye({ size, tracking, blink }: { size: number } & Eyes) {
  const ref = useRef<HTMLSpanElement>(null)
  const x = useSpring(0, spring)
  const y = useSpring(0, spring)

  useEffect(() => {
    if (!tracking) {
      x.set(0)
      y.set(0)
      return
    }
    const reach = size * REACH
    const onMove = (e: PointerEvent) => {
      const el = ref.current
      if (!el) return
      const r = el.getBoundingClientRect()
      const dx = e.clientX - (r.left + r.width / 2)
      const dy = e.clientY - (r.top + r.height / 2)
      const dist = Math.hypot(dx, dy) || 1
      // Ease in over the first ~120px so the pupil doesn't snap when the cursor is close.
      const k = Math.min(1, dist / 120) * reach
      x.set((dx / dist) * k)
      y.set((dy / dist) * k)
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [tracking, size, x, y])

  return (
    <Box component="span" ref={ref} sx={{ position: 'relative', display: 'inline-block' }}>
      O
      <Box
        component={motion.span}
        aria-hidden
        style={{ x, y, scaleY: blink }}
        sx={{
          position: 'absolute',
          // Centre of the O's counter (Gilroy at line-height 1; tuned visually).
          left: '50%',
          top: '41%',
          width: `${PUPIL}em`,
          height: `${PUPIL}em`,
          ml: `${-PUPIL / 2}em`,
          mt: `${-PUPIL / 2}em`,
          borderRadius: '50%',
          bgcolor: colors.gold,
          pointerEvents: 'none',
        }}
      />
    </Box>
  )
}

/** Occasional blink shared by both eyes; off under reduced motion. */
function useBlink(enabled: boolean) {
  const blink = useMotionValue(1)
  useEffect(() => {
    if (!enabled) return
    let timer = 0
    const schedule = () => {
      timer = window.setTimeout(() => {
        animate(blink, [1, 0.1, 1], { duration: 0.22, ease: 'easeInOut' })
        schedule()
      }, 2800 + Math.random() * 3600)
    }
    schedule()
    return () => window.clearTimeout(timer)
  }, [enabled, blink])
  return blink
}

/**
 * Text wordmark (Gilroy Bold). Every "O" gets a pupil that
 * follows the pointer (fine pointers only); on touch or reduced motion they
 * look straight ahead.
 */
export default function Wordmark({ text, size = 26 }: { text: string; size?: number }) {
  const reduce = useReducedMotion()
  const finePointer = useMediaQuery('(pointer: fine)', { noSsr: true })
  const tracking = !reduce && finePointer
  const blink = useBlink(!reduce)

  return (
    <Box
      component="span"
      aria-label={text}
      sx={{
        position: 'relative',
        display: 'inline-block',
        fontSize: size,
        fontFamily: fonts.sans,
        fontWeight: 700,
        letterSpacing: '-0.02em',
        lineHeight: 1,
        color: colors.text,
        whiteSpace: 'nowrap',
      }}
    >
      <span aria-hidden>
        {[...text].map((ch, i) =>
          ch === 'O' ? <Eye key={i} size={size} tracking={tracking} blink={blink} /> : ch,
        )}
      </span>
    </Box>
  )
}
