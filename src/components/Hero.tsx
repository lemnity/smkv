import { Fragment, useRef } from 'react'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Link from '@mui/material/Link'
import ArrowForward from '@mui/icons-material/ArrowForward'
import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from 'motion/react'
import { HEADER_HEIGHT, colors, contentSx, hoverUnderlineSx, microLabel } from '../theme'
import { contacts, hero } from '../data/content'
import { scrollToHash } from '../utils/scrollTo'
import { MagneticButton } from './effects'
import GoldDot from './GoldDot'
import HeroPortrait from './hero/HeroPortrait'
import { HeroSideColumn, HeroSideRow, Signature } from './hero/HeroSide'

const ease = [0.22, 1, 0.36, 1] as const

/** Fade-up entrance; under reduced motion the element renders in its final state. */
const fadeUp = (delay: number, reduce: boolean | null, duration = 0.9) => ({
  initial: reduce ? false : { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration, delay, ease },
})

// Static light-gold gradient (reads gold/gold-light like the reference) with a narrow
// light sheen band layered on top that sweeps across periodically.
const goldTextSx = {
  backgroundImage: `linear-gradient(100deg, transparent 42%, rgba(255,248,235,0.45) 50%, transparent 58%), linear-gradient(100deg, ${colors.goldLight} 0%, ${colors.gold} 70%, ${colors.goldDark} 130%)`,
  backgroundSize: '250% 100%, 100% 100%',
  backgroundRepeat: 'no-repeat',
  backgroundPosition: '100% 0, 0 0',
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  color: 'transparent',
  '@keyframes heroSheen': {
    '0%': { backgroundPosition: '100% 0, 0 0' },
    '45%, 100%': { backgroundPosition: '0% 0, 0 0' },
  },
  animation: 'heroSheen 7s ease-in-out 2s infinite',
  '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
}

export default function Hero() {
  const ref = useRef<HTMLElement>(null)
  const reduce = useReducedMotion()

  // Scroll: portrait parallax + copy fade-out as the hero leaves the viewport.
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const portraitY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 80])
  const copyY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -60])
  const copyOpacity = useTransform(scrollYProgress, [0, 0.7], [1, reduce ? 1 : 0])

  // Pointer: subtle portrait/halo shift (desktop fine pointers only).
  const spring = { stiffness: 80, damping: 20, mass: 0.6 }
  const px = useSpring(useMotionValue(0), spring)
  const py = useSpring(useMotionValue(0), spring)
  const onPointerMove = (e: React.PointerEvent) => {
    if (reduce || e.pointerType !== 'mouse' || !ref.current || window.innerWidth < 900) return
    const r = ref.current.getBoundingClientRect()
    px.set(((e.clientX - r.left) / r.width) * 2 - 1)
    py.set(((e.clientY - r.top) / r.height) * 2 - 1)
  }
  const onPointerLeave = () => {
    px.set(0)
    py.set(0)
  }

  return (
    <Box
      component="section"
      id="home"
      ref={ref}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      sx={{ position: 'relative', overflow: 'hidden' }}
    >
      <Box
        sx={{
          ...contentSx,
          position: 'relative',
          minHeight: { md: 'max(100vh, 720px)' },
          // Header height + breathing room.
          pt: {
            xs: `${HEADER_HEIGHT.xs + 48}px`,
            md: `${HEADER_HEIGHT.md + 62}px`,
            lg: `${HEADER_HEIGHT.md + 82}px`,
          },
          pb: { xs: 6, md: 10 },
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <motion.div style={{ y: copyY, opacity: copyOpacity, position: 'relative', zIndex: 3 }}>
          <Box sx={{ maxWidth: { md: '52%', lg: '50%' } }}>
            <motion.div {...fadeUp(0.2, reduce)}>
              <Typography sx={{ ...microLabel, fontSize: { xs: 10, md: 11 }, color: colors.muted, letterSpacing: '0.3em' }}>
                {hero.eyebrow}
              </Typography>
            </motion.div>

            <Typography
              component="h1"
              sx={{
                mt: { xs: 2.5, md: 3 },
                fontSize: { xs: 'clamp(52px, 15vw, 72px)', md: 'clamp(72px, 8.6vw, 150px)' },
                fontWeight: 400,
                letterSpacing: '-0.04em',
                lineHeight: 0.95,
                color: colors.text,
              }}
            >
              {hero.lines.map((line, i) => (
                <Fragment key={line}>
                {/* Real space between lines so textContent / copy reads as a sentence. */}
                {i > 0 && ' '}
                <Box
                  component="span"
                  sx={{ display: 'block', overflow: 'hidden', pb: '0.08em', mb: '-0.08em' }}
                >
                  <Box
                    component={motion.span}
                    initial={reduce ? false : { y: '110%' }}
                    animate={{ y: '0%' }}
                    transition={{ duration: 1, delay: 0.35 + i * 0.12, ease }}
                    sx={{ display: 'block', ...(i === hero.lines.length - 1 ? goldTextSx : {}) }}
                  >
                    {line}
                  </Box>
                </Box>
                </Fragment>
              ))}
            </Typography>

            <motion.div {...fadeUp(0.7, reduce, 0.8)}>
              <Typography
                sx={{
                  mt: { xs: 3, md: 4 },
                  maxWidth: { xs: 440, md: 380, lg: 440 },
                  fontSize: { xs: 16, md: 18 },
                  lineHeight: 1.55,
                  color: 'rgba(244,241,236,0.72)',
                }}
              >
                {hero.text}
              </Typography>
            </motion.div>

            <motion.div {...fadeUp(0.8, reduce, 0.8)}>
              <Stack
                direction="row"
                sx={{ mt: { xs: 4, md: 5 }, alignItems: 'center', flexWrap: 'wrap', gap: { xs: 3, sm: 4 } }}
              >
                <MagneticButton>
                  <Button
                    variant="outlined"
                    color="primary"
                    endIcon={<ArrowForward />}
                    onClick={() => scrollToHash('#work')}
                    sx={{
                      px: { xs: 3.5, md: 4.5 },
                      py: { xs: 1.75, md: 2.25 },
                      fontSize: 15,
                      '& .MuiButton-endIcon': { ml: 2, transition: 'transform .35s cubic-bezier(0.22,1,0.36,1)' },
                      '&:hover .MuiButton-endIcon': { transform: 'translateX(5px)' },
                    }}
                  >
                    {hero.cta}
                  </Button>
                </MagneticButton>
                <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                  <Link
                    href={`mailto:${contacts.email}`}
                    sx={{
                      fontSize: 15,
                      color: colors.text,
                      textDecoration: 'underline',
                      textUnderlineOffset: '4px',
                      textDecorationColor: 'rgba(244,241,236,0.5)',
                      transition: 'color .3s ease',
                      '&:hover': { color: colors.goldLight, textDecorationColor: 'transparent' },
                      ...hoverUnderlineSx,
                    }}
                  >
                    {hero.write}
                  </Link>
                  <GoldDot />
                </Stack>
              </Stack>
            </motion.div>

            <HeroSideRow reduce={reduce} />
          </Box>
        </motion.div>

        <HeroPortrait scrollY={portraitY} px={px} py={py} reduce={reduce}>
          <Box sx={{ display: { xs: 'block', md: 'none' }, position: 'absolute', zIndex: 3, right: '-6%', bottom: '6%' }}>
            <Signature size={52} reduce={reduce} inView />
          </Box>
        </HeroPortrait>

        <HeroSideColumn reduce={reduce} />
      </Box>

      {/* fade the section's bottom edge into the page */}
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: 120,
          zIndex: 2,
          pointerEvents: 'none',
          background: `linear-gradient(to bottom, transparent, ${colors.bg})`,
        }}
      />
    </Box>
  )
}
