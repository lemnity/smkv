import Box from '@mui/material/Box'
import { motion, type MotionValue } from 'motion/react'
import { useLang } from '../../i18n'
import { PORTRAIT_MASK } from './portraitMask'

interface Props {
  /** Scroll parallax offset (px). */
  scrollY: MotionValue<number>
  /** Extra overlay (e.g. mobile signature). */
  children?: React.ReactNode
}

export default function HeroPortrait({ scrollY, children }: Props) {
  const { hero } = useLang().t

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
        {/* The loader measures this box to land its photo exactly here. */}
        <Box data-hero-portrait sx={{ position: 'absolute', inset: 0, zIndex: 1 }}>
          <Box
            component="img"
            src={hero.portrait}
            alt={hero.portraitAlt}
            width={344}
            height={572}
            fetchPriority="high"
            decoding="async"
            // LCP element; its entrance is the loader's photo landing on this spot.
            sx={{
              display: 'block',
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center top',
              maskImage: PORTRAIT_MASK,
              WebkitMaskImage: PORTRAIT_MASK,
              maskComposite: 'intersect',
              WebkitMaskComposite: 'source-in',
            }}
          />
        </Box>
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
