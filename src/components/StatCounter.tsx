import { useEffect, useRef, useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { visuallyHidden } from '@mui/utils'
import { animate, motion, useInView, useReducedMotion } from 'motion/react'
import { colors, microLabel } from '../theme'
import type { Stat } from '../data/content'
import { useLang } from '../i18n'

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
    <Typography ref={ref} sx={numberSx}>
      <Box component="span" sx={visuallyHidden}>
        {`${value}${suffix}`}
      </Box>
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

/** Figure-eight drawn as one continuous stroke through the centre (viewBox 48×24). */
const LEMNISCATE =
  'M24,12 C28,6 33,4 37,4 C42,4 45,8 45,12 C45,16 42,20 37,20 C33,20 28,18 24,12 ' +
  'C20,6 15,4 11,4 C6,4 3,8 3,12 C3,16 6,20 11,20 C15,20 20,18 24,12 Z'

function InfinityMark() {
  const reduce = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.6 })
  const { about } = useLang().t
  const stroke = { fill: 'none', strokeWidth: 3.6, strokeLinecap: 'round', strokeLinejoin: 'round' } as const
  return (
    <Box ref={ref} sx={numberSx} role="img" aria-label={about.infinityLabel}>
      <Box component="svg" aria-hidden viewBox="0 0 48 24" sx={{ width: 48, height: 24, overflow: 'visible' }}>
        {/* Track: draws itself in, then stays as a dim rail. */}
        <motion.path
          d={LEMNISCATE}
          {...stroke}
          stroke={colors.gold}
          initial={reduce ? false : { pathLength: 0, opacity: 1 }}
          animate={inView || reduce ? { pathLength: 1, opacity: reduce ? 1 : 0.32 } : undefined}
          transition={{ pathLength: { duration: 1.4, ease: 'easeInOut' }, opacity: { duration: 0.8, delay: 1.4 } }}
        />
        {/* Comet: a bright segment that keeps running around the loop. */}
        {!reduce && inView && (
          <Box
            component="path"
            d={LEMNISCATE}
            {...stroke}
            stroke={colors.gold}
            pathLength={1}
            sx={{
              strokeDasharray: '0.3 0.7',
              filter: 'drop-shadow(0 0 4px rgba(196,238,24,0.7))',
              opacity: 0,
              '@keyframes infRun': {
                from: { strokeDashoffset: 0 },
                to: { strokeDashoffset: -1 },
              },
              '@keyframes infIn': { to: { opacity: 1 } },
              animation: 'infRun 2.6s linear 1.2s infinite, infIn 0.6s ease 1.2s forwards',
            }}
          />
        )}
      </Box>
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
