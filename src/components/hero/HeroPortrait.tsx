import Box from '@mui/material/Box'
import { motion, useTransform, type MotionValue } from 'motion/react'
import { colors } from '../../theme'
import { hero } from '../../data/content'
import { useIntroReady } from '../intro'

const ease = [0.22, 1, 0.36, 1] as const

// Arc on the left side of the head (portrait viewBox = native image size 344×572).
const ARC = 'M 112 96 A 196 196 0 0 0 4 392'

interface Props {
  /** Scroll parallax offset (px). */
  scrollY: MotionValue<number>
  /** Pointer offsets in range −1…1 (springed). */
  px: MotionValue<number>
  py: MotionValue<number>
  /** prefers-reduced-motion: render entrance effects in their final state. */
  reduce: boolean | null
  /** Extra overlay (e.g. mobile signature). */
  children?: React.ReactNode
}

function Halo({ px, py, reduce }: { px: MotionValue<number>; py: MotionValue<number>; reduce: boolean | null }) {
  const ready = useIntroReady()
  const x = useTransform(px, (v) => v * -8)
  const y = useTransform(py, (v) => v * -8)
  return (
    <motion.svg
      viewBox="0 0 344 572"
      aria-hidden
      style={{ x, y, position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible', zIndex: 0 }}
    >
      <defs>
        <linearGradient id="haloStroke" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={colors.goldLight} stopOpacity="0" />
          <stop offset="0.35" stopColor={colors.goldLight} stopOpacity="0.95" />
          <stop offset="0.75" stopColor={colors.gold} stopOpacity="0.7" />
          <stop offset="1" stopColor={colors.goldDark} stopOpacity="0" />
        </linearGradient>
        <filter id="haloGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
      </defs>
      {/* soft glow copy — pulses after drawing */}
      <Box
        component={motion.path}
        d={ARC}
        fill="none"
        stroke={colors.gold}
        strokeWidth={6}
        filter="url(#haloGlow)"
        initial={reduce ? false : { pathLength: 0, opacity: 0 }}
        animate={ready ? { pathLength: 1, opacity: 0.55 } : undefined}
        transition={{ duration: 1.2, delay: 0.6, ease }}
        sx={{
          '@keyframes haloPulse': { '0%, 100%': { strokeOpacity: 1 }, '50%': { strokeOpacity: 0.35 } },
          animation: 'haloPulse 4s ease-in-out 1.8s infinite',
          '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
        }}
      />
      <motion.path
        d={ARC}
        fill="none"
        stroke="url(#haloStroke)"
        strokeWidth={1.4}
        strokeLinecap="round"
        initial={reduce ? false : { pathLength: 0 }}
        animate={ready ? { pathLength: 1 } : undefined}
        transition={{ duration: 1.2, delay: 0.6, ease }}
      />
    </motion.svg>
  )
}

export default function HeroPortrait({ scrollY, px, py, reduce, children }: Props) {
  const ready = useIntroReady()
  const x = useTransform(px, (v) => v * 12)
  const y = useTransform(py, (v) => v * 12)

  return (
    <Box
      sx={{
        position: { xs: 'relative', md: 'absolute' },
        zIndex: 1,
        bottom: { md: 0 },
        // md (900–1199): start further right so the halo arc clears the headline and lead text.
        left: { md: 'max(45%, 460px)', lg: '45%' },
        height: { md: 'min(94%, 900px)' },
        width: { xs: '80%', sm: '60%', md: 'auto' },
        maxWidth: { xs: 420, md: 'none' },
        mx: { xs: 'auto', md: 0 },
        mt: { xs: 6, md: 0 },
        aspectRatio: '344 / 572',
        pointerEvents: 'none',
      }}
    >
      {/* warm glow behind the head */}
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          inset: '-10% -30% 0',
          background: `radial-gradient(ellipse 50% 45% at 50% 42%, rgba(196,238,24,0.16), rgba(196,238,24,0.04) 55%, transparent 75%)`,
          zIndex: 0,
        }}
      />
      <motion.div style={{ y: scrollY, position: 'absolute', inset: 0 }}>
        <Halo px={px} py={py} reduce={reduce} />
        <motion.div style={{ x, y, position: 'absolute', inset: 0, zIndex: 1 }}>
          <Box
            component={motion.img}
            src={hero.portrait}
            alt={hero.portraitAlt}
            width={344}
            height={572}
            fetchPriority="high"
            decoding="async"
            // LCP element: visible from the first frame; reveal is scale + light blur only.
            initial={reduce ? false : { scale: 1.08, filter: 'blur(8px)' }}
            animate={ready ? { scale: 1, filter: 'blur(0px)' } : undefined}
            transition={{ duration: 1.3, delay: 0.1, ease }}
            sx={{
              display: 'block',
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center top',
              maskImage:
                'linear-gradient(to right, transparent 0%, #000 22%, #000 78%, transparent 100%), linear-gradient(to top, transparent 0%, #000 28%)',
              WebkitMaskImage:
                'linear-gradient(to right, transparent 0%, #000 22%, #000 78%, transparent 100%), linear-gradient(to top, transparent 0%, #000 28%)',
              maskComposite: 'intersect',
              WebkitMaskComposite: 'source-in',
            }}
          />
        </motion.div>
      </motion.div>
      {/* warm dark vignette */}
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          inset: 0,
          zIndex: 2,
          background: `radial-gradient(ellipse 70% 60% at 50% 40%, transparent 55%, rgba(3,3,3,0.55) 100%)`,
        }}
      />
      {children}
    </Box>
  )
}
