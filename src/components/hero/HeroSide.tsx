import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Language from '@mui/icons-material/Language'
import { motion } from 'motion/react'
import { colors, fonts, microLabel } from '../../theme'
import { useLang } from '../../i18n'
import { useIntroReady } from '../intro'

const ease = [0.22, 1, 0.36, 1] as const
const label = { ...microLabel, fontSize: 10, letterSpacing: '0.22em', lineHeight: 1.9, color: colors.text }

type Reduce = boolean | null

/** Fade-in entrance; under reduced motion the element renders in its final state. */
const fadeIn = (delay: number, reduce: Reduce, ready: boolean) => ({
  initial: reduce ? false : { opacity: 0, y: 12 },
  animate: ready ? { opacity: 1, y: 0 } : undefined,
  transition: { duration: 0.7, delay, ease },
})

const spinSx = {
  '@keyframes globeSpin': { to: { transform: 'rotate(360deg)' } },
  animation: 'globeSpin 18s linear infinite',
  '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
}

/**
 * Handwritten gold signature that "writes in" left → right.
 * `inView`: start the write-in when scrolled into view (mobile) instead of on load.
 */
export function Signature({ size = 64, reduce, inView = false }: { size?: number; reduce: Reduce; inView?: boolean }) {
  const ready = useIntroReady()
  const { hero } = useLang().t
  const delay = inView ? 0.15 : 0.8
  const write = {
    hidden: { clipPath: 'inset(0% 100% 0% 0%)' },
    shown: { clipPath: 'inset(0% 0% 0% 0%)', transition: { duration: 1, delay, ease: [0.65, 0, 0.35, 1] as const } },
  }
  const caption = {
    hidden: { opacity: 0, y: 12 },
    shown: { opacity: 1, y: 0, transition: { duration: 0.7, delay: delay + 0.3, ease } },
  }
  // The trigger lives on the unclipped wrapper: IntersectionObserver would see the
  // clip-path'd child as zero-area and never fire.
  return (
    <motion.div
      style={{ textAlign: 'right', width: 'max-content' }}
      initial={reduce ? false : 'hidden'}
      {...(!ready ? {} : inView ? { whileInView: 'shown', viewport: { once: true, amount: 0.6 } } : { animate: 'shown' })}
    >
      <motion.div variants={write}>
        <Typography
          aria-hidden
          sx={{
            fontFamily: fonts.script,
            fontSize: size,
            lineHeight: 1.3,
            px: '0.15em',
            color: colors.gold,
            transform: 'rotate(-8deg)',
            transformOrigin: 'right center',
            textShadow: '0 0 24px rgba(196,238,24,0.25)',
          }}
        >
          {hero.signature}
        </Typography>
      </motion.div>
      <motion.div variants={caption}>
        <Typography sx={{ ...label, mt: 0.5 }}>{hero.signatureLabel}</Typography>
      </motion.div>
    </motion.div>
  )
}

/** Desktop far-right column: labels, signature, places + rotating globe. */
export function HeroSideColumn({ reduce }: { reduce: Reduce }) {
  const ready = useIntroReady()
  const { hero } = useLang().t
  return (
    <Stack
      sx={{
        position: 'absolute',
        zIndex: 3,
        right: '48px',
        top: { md: 140, lg: 170 },
        bottom: { md: 56, lg: 72 },
        width: 120,
        justifyContent: 'space-between',
        display: { xs: 'none', md: 'flex' },
      }}
    >
      <Box>
        {hero.side.top.map((t, i) => (
          <motion.div key={t} {...fadeIn(0.6 + i * 0.08, reduce, ready)}>
            <Typography sx={label}>{t}</Typography>
          </motion.div>
        ))}
        <motion.div {...fadeIn(0.84, reduce, ready)}>
          <Box sx={{ width: 20, height: '1px', bgcolor: colors.muted, my: 2.5 }} />
          <Typography sx={{ ...label, whiteSpace: 'nowrap' }}>{`${hero.side.est} ${hero.side.year}`}</Typography>
        </motion.div>
      </Box>

      <Box sx={{ alignSelf: 'flex-end' }}>
        <Signature reduce={reduce} />
      </Box>

      <Box>
        {hero.places.map((t, i) => (
          <motion.div key={t} {...fadeIn(0.9 + i * 0.08, reduce, ready)}>
            <Typography sx={label}>{t}</Typography>
          </motion.div>
        ))}
        <motion.div {...fadeIn(1.1, reduce, ready)}>
          <Language aria-hidden sx={{ fontSize: 18, mt: 1.5, color: colors.text, ...spinSx }} />
        </motion.div>
      </Box>
    </Stack>
  )
}

/** Mobile: all side labels collapsed into one wrapping row. */
export function HeroSideRow({ reduce }: { reduce: Reduce }) {
  const ready = useIntroReady()
  const { hero } = useLang().t
  const items = [...hero.side.top, `${hero.side.est} ${hero.side.year}`, ...hero.places]
  return (
    <motion.div {...fadeIn(0.9, reduce, ready)}>
      <Stack
        direction="row"
        sx={{
          display: { xs: 'flex', md: 'none' },
          flexWrap: 'wrap',
          alignItems: 'center',
          columnGap: 2,
          rowGap: 0.5,
          mt: 5,
        }}
      >
        {items.map((t) => (
          <Typography key={t} sx={{ ...label, color: colors.muted }}>
            {t}
          </Typography>
        ))}
        <Language aria-hidden sx={{ fontSize: 16, color: colors.muted, ...spinSx }} />
      </Stack>
    </motion.div>
  )
}
