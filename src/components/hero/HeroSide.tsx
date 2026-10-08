import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Language from '@mui/icons-material/Language'
import { motion } from 'motion/react'
import { colors, fonts, microLabel } from '../../theme'
import { hero } from '../../data/content'

const ease = [0.22, 1, 0.36, 1] as const
const label = { ...microLabel, fontSize: 10, letterSpacing: '0.22em', lineHeight: 1.9, color: colors.text }

const fadeIn = (delay: number) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, delay, ease },
})

const spinSx = {
  '@keyframes globeSpin': { to: { transform: 'rotate(360deg)' } },
  animation: 'globeSpin 18s linear infinite',
  '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
}

/** Handwritten gold signature that "writes in" left → right. */
export function Signature({ size = 64 }: { size?: number }) {
  return (
    <Box sx={{ textAlign: 'right', width: 'max-content' }}>
      <motion.div
        initial={{ clipPath: 'inset(0% 100% 0% 0%)' }}
        animate={{ clipPath: 'inset(0% 0% 0% 0%)' }}
        transition={{ duration: 1, delay: 0.9, ease: [0.65, 0, 0.35, 1] }}
      >
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
            textShadow: '0 0 24px rgba(201,161,115,0.25)',
          }}
        >
          {hero.signature}
        </Typography>
      </motion.div>
      <motion.div {...fadeIn(1.5)}>
        <Typography sx={{ ...label, mt: 0.5 }}>{hero.signatureLabel}</Typography>
      </motion.div>
    </Box>
  )
}

/** Desktop far-right column: labels, signature, places + rotating globe. */
export function HeroSideColumn() {
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
          <motion.div key={t} {...fadeIn(0.6 + i * 0.08)}>
            <Typography sx={label}>{t}</Typography>
          </motion.div>
        ))}
        <motion.div {...fadeIn(0.84)}>
          <Box sx={{ width: 20, height: '1px', bgcolor: colors.muted, my: 2.5 }} />
          <Typography sx={label}>{hero.side.est}</Typography>
          <Typography sx={label}>{hero.side.year}</Typography>
        </motion.div>
      </Box>

      <Box sx={{ alignSelf: 'flex-end' }}>
        <Signature />
      </Box>

      <Box>
        {hero.places.map((t, i) => (
          <motion.div key={t} {...fadeIn(1 + i * 0.08)}>
            <Typography sx={label}>{t}</Typography>
          </motion.div>
        ))}
        <motion.div {...fadeIn(1.24)}>
          <Language aria-hidden sx={{ fontSize: 18, mt: 1.5, color: colors.text, ...spinSx }} />
        </motion.div>
      </Box>
    </Stack>
  )
}

/** Mobile: all side labels collapsed into one wrapping row. */
export function HeroSideRow() {
  const items = [...hero.side.top, `${hero.side.est} ${hero.side.year}`, ...hero.places]
  return (
    <motion.div {...fadeIn(1)}>
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
