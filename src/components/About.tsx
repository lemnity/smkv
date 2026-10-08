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
import { about, contacts } from '../data/content'
import { Reveal } from './effects'
import GoldDot from './GoldDot'
import StatCounter from './StatCounter'

const mailto = `mailto:${contacts.email}`

function Word({ children, progress, range }: { children: string; progress: MotionValue<number>; range: [number, number] }) {
  const opacity = useTransform(progress, range, [0.15, 1])
  return <motion.span style={{ opacity }}>{children}</motion.span>
}

/** Quote whose words light up one by one, scrubbed to scroll position. */
function Quote() {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.95', 'end 0.85'] })
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
      <Typography
        component="blockquote"
        sx={{
          m: 0,
          fontFamily: fonts.serif,
          fontWeight: 400,
          fontSize: { xs: 26, sm: 30, md: 26, lg: 34 },
          lineHeight: 1.2,
          color: colors.quote,
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
                <Word key={wi} progress={scrollYProgress} range={[idx / total, (idx + 1) / total]}>
                  {word}
                </Word>
              )
            })}
          </Box>
        ))}
      </Typography>
    </Box>
  )
}

/** Whole row (circle + label) is a single mailto link; the circle is decorative and reacts to the link's hover/focus. */
function CreateTogether() {
  const circleActive = {
    borderColor: colors.gold,
    boxShadow: '0 0 24px rgba(201,161,115,0.35)',
  }
  return (
    <Stack
      component="a"
      href={mailto}
      aria-label={about.ctaLabel}
      direction="row"
      spacing={3}
      sx={{
        alignItems: 'center',
        flexShrink: 0,
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
            border: `1px dashed rgba(201,161,115,0.55)`,
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
            <Typography sx={{ ...microLabel, fontSize: 10, letterSpacing: '0.3em', color: colors.gold, mb: { xs: 2, md: 2.5 } }}>
              {about.eyebrow}
            </Typography>
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
                href={about.moreHref}
                sx={{
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
