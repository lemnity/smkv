import { useRef } from 'react'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import FormatQuote from '@mui/icons-material/FormatQuote'
import MoreHoriz from '@mui/icons-material/MoreHoriz'
import { visuallyHidden } from '@mui/utils'
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from 'motion/react'
import { colors, contentSx, fonts, hoverUnderlineSx, microLabel, outlinedIconButtonSx, sectionTitleSx } from '../theme'
import { useLang } from '../i18n'
import { Reveal } from './effects'
import GoldDot from './GoldDot'
import StatCounter from './StatCounter'
import { useFeedback } from './feedback/context'

/*
 * Scroll Reveal — after React Bits (https://reactbits.dev/c/text-animations/scroll-reveal):
 * the block straightens from a slight tilt while words fade in from 10% and un-blur,
 * staggered and scrubbed to scroll. GSAP ScrollTrigger is replaced by motion's useScroll.
 */
const BASE_OPACITY = 0.1
const BASE_ROTATION = 3
const BLUR = 4
/**
 * Gap between word starts, in units of one word's tween (GSAP `stagger`). The demo uses
 * 0.05 on a ~60-word paragraph, which reads as a wave; this quote is ~8 words, so the gap
 * is scaled to keep the same sweep.
 */
const staggerFor = (total: number) => Math.max(0.05, 2.5 / total)

function Word({ children, progress, index, total }: { children: string; progress: MotionValue<number>; index: number; total: number }) {
  // Timeline like GSAP's: each word tweens for 1 unit, starting `index * STAGGER` in.
  const stagger = staggerFor(total)
  const span = 1 + (total - 1) * stagger
  const local = useTransform(progress, (p) => Math.min(1, Math.max(0, p * span - index * stagger)))
  const opacity = useTransform(local, [0, 1], [BASE_OPACITY, 1])
  const filter = useTransform(local, (t) => `blur(${((1 - t) * BLUR).toFixed(2)}px)`)
  return <motion.span style={{ opacity, filter, display: 'inline-block', whiteSpace: 'pre' }}>{children}</motion.span>
}

/** Quote revealed word by word as it scrolls into view. */
function Quote() {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const { about } = useLang().t
  // The quote is short, so ranges are tied to its top edge (React Bits' 'bottom bottom' end
  // would come before the start). Both run across most of its trip up the viewport, like the demo.
  const { scrollYProgress: wordsProgress } = useScroll({ target: ref, offset: ['start 0.92', 'start 0.25'] })
  const { scrollYProgress: tiltProgress } = useScroll({ target: ref, offset: ['start end', 'start 0.25'] })
  const rotate = useTransform(tiltProgress, [0, 1], [BASE_ROTATION, 0])
  const words = about.quote.map((line) => line.split(' '))
  const total = words.flat().length
  let i = 0

  return (
    <Box ref={ref} sx={{ position: 'relative', pl: { xs: 5, md: 6.5 }, pt: 1 }}>
      <FormatQuote
        aria-hidden
        sx={{
          position: 'absolute',
          left: { xs: -6, md: -4 },
          top: { xs: -14, md: -18 },
          fontSize: { xs: 52, md: 64 },
          color: colors.gold,
          opacity: 0.22,
          transform: 'rotate(180deg)',
        }}
      />
      <motion.div style={reduce ? undefined : { rotate, transformOrigin: '0% 50%' }}>
      <Typography
        component="blockquote"
        sx={{
          m: 0,
          // Large bold white text, as in the React Bits demo.
          fontFamily: fonts.sans,
          fontWeight: 600,
          fontSize: { xs: 30, sm: 36, md: 34, lg: 46 },
          lineHeight: 1.2,
          letterSpacing: '-0.02em',
          color: colors.text,
        }}
      >
        <Box component="span" sx={visuallyHidden}>
          {about.quote.join(' ')}
        </Box>
        {words.map((line, li) => (
          <Box component="span" key={li} aria-hidden sx={{ display: 'block' }}>
            {line.map((w, wi) => {
              const idx = i++
              const word = wi < line.length - 1 ? `${w} ` : w
              return reduce ? (
                <span key={wi}>{word}</span>
              ) : (
                <Word key={wi} progress={wordsProgress} index={idx} total={total}>
                  {word}
                </Word>
              )
            })}
          </Box>
        ))}
      </Typography>
      </motion.div>
    </Box>
  )
}

/** Whole row (circle + label) is a single button that opens the feedback form; the circle is decorative and reacts to the button's hover/focus. */
function CreateTogether() {
  const { about } = useLang().t
  const { openFeedback } = useFeedback()
  const circleActive = {
    borderColor: colors.gold,
    boxShadow: '0 0 24px rgba(196,238,24,0.35)',
  }
  return (
    <Stack
      component="button"
      type="button"
      onClick={() => openFeedback()}
      aria-haspopup="dialog"
      aria-label={about.ctaLabel}
      direction="row"
      spacing={3}
      sx={{
        alignItems: 'center',
        flexShrink: 0,
        // Reset native <button> chrome so it looks exactly like the former link.
        appearance: 'none',
        background: 'none',
        border: 0,
        p: 0,
        m: 0,
        font: 'inherit',
        textAlign: 'left',
        cursor: 'pointer',
        textDecoration: 'none',
        color: 'inherit',
        borderRadius: 999,
        outline: 'none',
        '&:hover .cta-circle, &:focus-visible .cta-circle': circleActive,
        '&:focus-visible': { outline: `2px solid ${colors.gold}`, outlineOffset: '10px' },
        '&:hover .cta-label, &:focus-visible .cta-label': { color: colors.goldLight },
      }}
    >
      <Box aria-hidden sx={{ position: 'relative', width: 72, height: 72, flexShrink: 0 }}>
        <Box
          sx={{
            position: 'absolute',
            inset: -7,
            borderRadius: '50%',
            border: `1px dashed rgba(196,238,24,0.55)`,
            pointerEvents: 'none',
            '@keyframes ctaSpin': { to: { transform: 'rotate(360deg)' } },
            animation: 'ctaSpin 24s linear infinite',
            '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
          }}
        />
        <Box
          className="cta-circle"
          sx={{
            ...outlinedIconButtonSx,
            width: 72,
            height: 72,
            boxSizing: 'border-box',
            display: 'grid',
            placeItems: 'center',
            borderColor: 'rgba(244,241,236,0.3)',
          }}
        >
          <MoreHoriz />
        </Box>
      </Box>
      <Box aria-hidden className="cta-label" sx={{ transition: 'color .3s ease' }}>
        {about.cta.map((line, i) => (
          <Typography
            key={line}
            sx={{
              ...microLabel,
              fontSize: 10,
              letterSpacing: '0.2em',
              lineHeight: 1.9,
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              color: 'inherit',
            }}
          >
            {line}
            {i === about.cta.length - 1 && <GoldDot />}
          </Typography>
        ))}
      </Box>
    </Stack>
  )
}

export default function About() {
  const { about } = useLang().t
  const { openFeedback } = useFeedback()
  return (
    <Box component="section" id="about" aria-labelledby="about-title">
      <Box
        sx={{
          ...contentSx,
          pt: { xs: 8, md: 4 },
          pb: { xs: 8, md: 5 },
          display: 'grid',
          gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'minmax(0, 34fr) auto minmax(0, 66fr)' },
          columnGap: { md: 4, lg: 5 },
          rowGap: 6,
        }}
      >
        {/* Left */}
        <Reveal>
          <Box sx={{ pr: { md: 2 } }}>
            <Typography id="about-title" component="h2" sx={{ ...sectionTitleSx, fontSize: { xs: 38, sm: 44, md: 42, lg: 48 } }}>
              {about.title.map((l) => (
                <Box component="span" key={l} sx={{ display: 'block' }}>
                  {l}
                </Box>
              ))}
            </Typography>
            <Typography sx={{ fontSize: 14, lineHeight: 1.7, color: 'rgba(244,241,236,0.72)', mt: 3, maxWidth: 360 }}>
              {about.text}
            </Typography>
            <Stack direction="row" spacing={1.5} sx={{ mt: 3.5, alignItems: 'center' }}>
              <Link
                component="button"
                type="button"
                aria-haspopup="dialog"
                onClick={() => openFeedback()}
                sx={{
                  fontFamily: 'inherit',
                  fontSize: 14,
                  color: colors.text,
                  textDecoration: 'underline',
                  textUnderlineOffset: '4px',
                  textDecorationColor: 'rgba(244,241,236,0.5)',
                  transition: 'color .3s ease',
                  '&:hover': { color: colors.goldLight, textDecorationColor: 'transparent' },
                  ...hoverUnderlineSx,
                }}
              >
                {about.more}
              </Link>
              <GoldDot />
            </Stack>
          </Box>
        </Reveal>

        <Divider orientation="vertical" sx={{ display: { xs: 'none', md: 'block' }, height: 'auto' }} />

        {/* Right */}
        <Box sx={{ minWidth: 0 }}>
          <Reveal delay={0.1}>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', md: 'repeat(4, minmax(0, 1fr))' },
                rowGap: 4,
                pt: { md: 1.5 },
              }}
            >
              {about.stats.map((s, i) => (
                <Box
                  key={s.label}
                  sx={{
                    px: { xs: i % 2 ? 3 : 0, md: i ? 2.5 : 0, lg: i ? 5 : 0 },
                    borderLeft: {
                      xs: i % 2 ? `1px solid ${colors.line}` : 'none',
                      md: i ? `1px solid ${colors.line}` : 'none',
                    },
                  }}
                >
                  <StatCounter stat={s} />
                </Box>
              ))}
            </Box>
          </Reveal>

          <Reveal delay={0.2}>
            <Box
              sx={{
                mt: { xs: 7, md: 8 },
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: { xs: 'flex-start', sm: 'center' },
                justifyContent: 'space-between',
                gap: { xs: 5, md: 4 },
                pl: { md: 1.5 },
              }}
            >
              <Quote />
              <CreateTogether />
            </Box>
          </Reveal>
        </Box>
      </Box>
    </Box>
  )
}
