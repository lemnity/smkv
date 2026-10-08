import { useEffect, useRef, useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import AllInclusive from '@mui/icons-material/AllInclusive'
import { animate, motion, useInView, useReducedMotion } from 'motion/react'
import { colors, microLabel } from '../theme'
import type { Stat } from '../data/content'

const numberSx = {
  fontSize: { xs: 36, md: 40 },
  fontWeight: 400,
  lineHeight: 1,
  letterSpacing: '-0.02em',
  height: 44,
  display: 'flex',
  alignItems: 'center',
} as const

function CountUp({ value, suffix }: { value: number; suffix: string }) {
  const ref = useRef<HTMLParagraphElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.6 })
  const reduce = useReducedMotion()
  const [n, setN] = useState(0)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!inView) return
    if (reduce) {
      setN(value)
      setDone(true)
      return
    }
    const controls = animate(0, value, {
      duration: 1.6,
      ease: 'easeOut',
      onUpdate: (v) => setN(Math.round(v)),
      onComplete: () => setDone(true),
    })
    return () => controls.stop()
  }, [inView, reduce, value])

  // Static final value when reduced motion is on (also before the first effect runs).
  const shown = reduce ? value : n
  const suffixOn = reduce || done

  return (
    <Typography ref={ref} sx={numberSx} aria-label={`${value}${suffix}`}>
      <Box component="span" aria-hidden>
        {shown}
      </Box>
      {suffix && (
        <Box
          component="span"
          aria-hidden
          sx={{
            display: 'inline-block',
            opacity: suffixOn ? 1 : 0,
            transform: suffixOn ? 'none' : 'translateY(6px)',
            transition: reduce ? 'none' : 'opacity .4s ease, transform .4s ease',
          }}
        >
          {suffix}
        </Box>
      )}
    </Typography>
  )
}

function InfinityMark() {
  const reduce = useReducedMotion()
  // Observe the unclipped wrapper: IntersectionObserver treats a fully clipped target as not visible.
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.6 })
  return (
    <Box ref={ref} sx={numberSx} role="img" aria-label="∞">
      <motion.span
        aria-hidden
        initial={reduce ? false : { clipPath: 'inset(0 100% 0 0)' }}
        animate={inView || reduce ? { clipPath: 'inset(0 0% 0 0)' } : undefined}
        transition={{ duration: 1.4, ease: 'easeInOut' }}
        style={{ display: 'inline-flex' }}
      >
        <AllInclusive
          sx={{
            fontSize: 44,
            color: colors.gold,
            '@keyframes infPulse': {
              '0%, 100%': { opacity: 0.85, filter: 'drop-shadow(0 0 0 rgba(201,161,115,0))' },
              '50%': { opacity: 1, filter: 'drop-shadow(0 0 8px rgba(201,161,115,0.55))' },
            },
            animation: 'infPulse 3.2s ease-in-out 1.4s infinite',
            '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
          }}
        />
      </motion.span>
    </Box>
  )
}

export default function StatCounter({ stat }: { stat: Stat }) {
  return (
    <Box>
      {stat.kind === 'number' ? <CountUp value={stat.value} suffix={stat.suffix} /> : <InfinityMark />}
      <Typography sx={{ ...microLabel, fontSize: 10, letterSpacing: '0.2em', color: colors.text, opacity: 0.8, mt: 1.5, whiteSpace: 'nowrap' }}>
        {stat.label}
      </Typography>
    </Box>
  )
}
