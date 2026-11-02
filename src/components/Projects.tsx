import { useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import ArrowForward from '@mui/icons-material/ArrowForward'
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring } from 'motion/react'
import { colors, contentSx, microLabel, sectionTitleSx } from '../theme'
import { useLang } from '../i18n'
import type { Project } from '../data/content'
import { VariableProximity } from './effects'
import { CroppedImage } from './ProjectCard'

/*
 * Featured projects, laid out like the Lemnity Studio site (repo `studio`):
 * a first row with Lemnity (60%) and the Lemnity games (20% each),
 * then every other project as an index row that fills with the accent on hover.
 */

const ease = [0.22, 1, 0.36, 1] as const
const FLAGSHIP_ID = 'lemnity'
/** Floating preview size (desktop). */
const PREVIEW_W = 380
const PREVIEW_H = 240

const pad = (n: number) => String(n).padStart(2, '0')
const arrowSx = {
  display: 'grid',
  placeItems: 'center',
  borderRadius: '50%',
  border: '1px solid rgba(244,241,236,0.35)',
  transition: 'all .45s cubic-bezier(0.22,1,0.36,1)',
} as const
const cardSx = {
  position: 'relative',
  height: '100%',
  overflow: 'hidden',
  borderRadius: 3,
  border: `1px solid ${colors.line}`,
  bgcolor: colors.surface,
  color: colors.text,
  textDecoration: 'none',
} as const
const revealProps = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.7, delay, ease },
})

/** Lemnity: dark card, copy on the left, the platform screenshot on the right fading into the card. */
function FlagshipCard({ project, number }: { project: Project; number: string }) {
  const { projects } = useLang().t
  return (
    <Box component={motion.div} {...revealProps()} sx={{ gridColumn: { md: 'span 2', xl: 'auto' }, minWidth: 0 }}>
      <Box
        component="a"
        href={project.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${projects.openLabel} ${project.title}`}
        sx={{
          ...cardSx,
          display: 'grid',
          gridTemplateColumns: { lg: 'minmax(0, 1fr) minmax(0, 1.1fr)' },
          minHeight: { md: 440 },
          '&:hover .flag-media': { transform: 'scale(1.04)' },
          '&:hover .row-arrow, &:focus-visible .row-arrow': {
            transform: 'rotate(-45deg)',
            bgcolor: colors.gold,
            borderColor: colors.gold,
            color: colors.bg,
          },
          '&:focus-visible': { outline: `2px solid ${colors.goldLight}`, outlineOffset: 2 },
        }}
      >
        <Typography
          sx={{ display: { xs: 'none', lg: 'block' }, position: 'absolute', left: 24, top: 24, zIndex: 2, fontSize: 16, letterSpacing: '0.12em', color: colors.gold }}
        >
          {number}
        </Typography>
        <Box
          sx={{
            position: 'relative',
            zIndex: 1,
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: { xs: 2.5, md: 3 },
            p: { xs: 3, md: 5 },
            py: { lg: 6 },
            pl: { lg: 6 },
            pr: { lg: 3 },
          }}
        >
          <Box
            component="span"
            sx={{
              width: 'fit-content',
              borderRadius: 999,
              bgcolor: colors.gold,
              color: colors.bg,
              px: 1.5,
              py: 0.5,
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
            }}
          >
            {projects.flagshipLabel}
          </Box>
          <Typography component="h3" sx={{ m: 0, lineHeight: 0 }}>
            {project.logo ? (
              <Box
                component="img"
                src={project.logo.src}
                alt={project.title}
                width={project.logo.width}
                height={project.logo.height}
                sx={{ display: 'block', width: 'auto', maxWidth: '100%', height: { xs: 48, md: 56 } }}
              />
            ) : (
              <Box component="span" sx={{ fontSize: 48, lineHeight: 1 }}>
                {project.title}
              </Box>
            )}
          </Typography>
          <Typography sx={{ maxWidth: '34ch', fontSize: { xs: 17, md: 18 }, lineHeight: 1.5, color: 'rgba(244,241,236,0.85)' }}>
            <VariableProximity text={project.description} />
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2.5 }}>
            <Box className="row-arrow" aria-hidden sx={{ ...arrowSx, width: 52, height: 52 }}>
              <ArrowForward sx={{ fontSize: 18 }} />
            </Box>
            <Typography sx={{ fontSize: 14, color: colors.muted }}>{project.tags.map((t) => `#${t}`).join('  ')}</Typography>
          </Box>
        </Box>
        {/* Screenshot: on top on phones, right of the copy on desktop; fades into the card. */}
        <Box sx={{ position: 'relative', order: { xs: -1, lg: 0 }, alignSelf: { lg: 'center' }, aspectRatio: '466 / 216', overflow: 'hidden' }}>
          <Box className="flag-media" sx={{ position: 'absolute', inset: 0, transition: 'transform 1s cubic-bezier(0.22,1,0.36,1)' }}>
            <CroppedImage image={project.image} alt="" />
          </Box>
          <Box
            aria-hidden
            sx={{
              position: 'absolute',
              inset: 0,
              background: {
                xs: `linear-gradient(to top, ${colors.surface}, transparent 35%)`,
                lg: `linear-gradient(to right, ${colors.surface}, transparent 25%)`,
              },
            }}
          />
        </Box>
      </Box>
    </Box>
  )
}

/** A Lemnity game: full-width cover, "in development" pill on the image, "Game · Lemnity" over the title. */
function GameCard({ project, index }: { project: Project; index: number }) {
  const { projects } = useLang().t
  const link = project.url
    ? { component: 'a' as const, href: project.url, target: '_blank', rel: 'noopener noreferrer', 'aria-label': `${projects.openLabel} ${project.title}` }
    : {}
  return (
    <Box component={motion.div} {...revealProps(0.1 + index * 0.08)} sx={{ minWidth: 0 }}>
      <Box
        {...link}
        sx={{
          ...cardSx,
          display: 'flex',
          flexDirection: 'column',
          '&:hover .game-media': { transform: 'scale(1.04)' },
          '&:hover h3': { color: colors.goldLight },
        }}
      >
        <Box sx={{ position: 'relative', aspectRatio: '4 / 3', overflow: 'hidden', borderBottom: `1px solid ${colors.line}` }}>
          <Box className="game-media" sx={{ position: 'absolute', inset: 0, transition: 'transform 1s cubic-bezier(0.22,1,0.36,1)' }}>
            <CroppedImage image={project.image} alt="" />
          </Box>
          {project.inDevelopment && (
            <Box
              component="span"
              sx={{
                ...microLabel,
                position: 'absolute',
                left: 12,
                top: 12,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1,
                px: 1.5,
                py: 0.75,
                borderRadius: 999,
                bgcolor: 'rgba(3,3,3,0.72)',
                backdropFilter: 'blur(12px)',
                color: colors.gold,
                '&::before': {
                  content: '""',
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  bgcolor: colors.gold,
                  '@keyframes gameDot': { '50%': { opacity: 0.3 } },
                  animation: 'gameDot 1.8s ease-in-out infinite',
                  '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
                },
              }}
            >
              {projects.inDevLabel}
            </Box>
          )}
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25, p: 2.5 }}>
          <Typography sx={{ ...microLabel, color: colors.muted }}>{projects.gameLabel} · Lemnity</Typography>
          <Typography component="h3" sx={{ fontSize: 24, fontWeight: 400, lineHeight: 1.15, letterSpacing: '-0.02em', transition: 'color .3s' }}>
            <VariableProximity text={project.title} />
          </Typography>
          <Typography sx={{ fontSize: 15, lineHeight: 1.5, color: 'rgba(244,241,236,0.72)' }}>
            <VariableProximity text={project.description} />
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}

/** Index row: fills with the accent from the bottom on hover, text and arrow turn dark. */
function Row({ project, number, onHover }: { project: Project; number: string; onHover: (p: Project | null) => void }) {
  const { projects } = useLang().t
  const linkProps = project.url
    ? { component: 'a' as const, href: project.url, target: '_blank', rel: 'noopener noreferrer', 'aria-label': `${projects.openLabel} ${project.title}` }
    : {}

  return (
    <Box
      component={motion.li}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5, ease }}
      onPointerEnter={(e) => e.pointerType === 'mouse' && onHover(project)}
      onPointerLeave={() => onHover(null)}
      sx={{ borderBottom: `1px solid ${colors.line}` }}
    >
      <Box
        {...linkProps}
        sx={{
          position: 'relative',
          display: 'grid',
          gridTemplateColumns: { xs: '40px 1fr auto', md: '64px minmax(0, 1.1fr) minmax(0, 1fr) 132px' },
          gridTemplateAreas: { xs: '"num title end" "num desc desc" "num thumb thumb"', md: '"num title desc end"' },
          alignItems: { xs: 'start', md: 'center' },
          columnGap: { xs: 1.5, md: 4 },
          rowGap: 1.25,
          py: { xs: 3, md: 3.5 },
          px: { md: 1 },
          color: colors.text,
          textDecoration: 'none',
          transition: 'padding .4s cubic-bezier(0.22,1,0.36,1)',
          // Accent fill rising from the bottom, under the content.
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            bgcolor: colors.gold,
            transform: 'scaleY(0)',
            transformOrigin: 'bottom',
            transition: 'transform .45s cubic-bezier(0.22,1,0.36,1)',
          },
          '& > *': { position: 'relative', zIndex: 1 },
          '& .row-fill': { transition: 'color .3s, border-color .3s' },
          '&:hover, &:focus-visible': {
            px: { md: 3 },
            '&::before': { transform: 'scaleY(1)' },
            '& .row-fill': { color: colors.bg, borderColor: colors.bg },
            '& .row-arrow': { transform: 'rotate(-45deg)', bgcolor: colors.bg, borderColor: colors.bg, color: colors.gold },
          },
          '&:focus-visible': { outline: 'none' },
        }}
      >
        <Typography className="row-fill" sx={{ gridArea: 'num', fontSize: 14, letterSpacing: '0.12em', color: colors.muted, pt: { xs: 1, md: 0 } }}>
          {number}
        </Typography>
        <Typography
          component="h3"
          className="row-fill"
          sx={{ gridArea: 'title', fontSize: { xs: 26, md: 34, lg: 40 }, fontWeight: 400, lineHeight: 1.1, letterSpacing: '-0.02em' }}
        >
          <VariableProximity text={project.title} />
        </Typography>
        <Box sx={{ gridArea: 'desc', minWidth: 0 }}>
          <Typography className="row-fill" sx={{ fontSize: 15, lineHeight: 1.55, color: 'rgba(244,241,236,0.72)', maxWidth: 420 }}>
            <VariableProximity text={project.description} />
          </Typography>
          <Typography className="row-fill" sx={{ mt: 0.75, fontSize: 13, color: colors.muted }}>
            {project.tags.map((t) => `#${t}`).join('  ')}
          </Typography>
        </Box>
        {/* Phones have no hover: show the preview inline. */}
        <Box
          sx={{
            gridArea: 'thumb',
            display: { xs: 'block', md: 'none' },
            position: 'relative',
            aspectRatio: '16 / 10',
            borderRadius: 1,
            overflow: 'hidden',
            border: `1px solid ${colors.line}`,
            mt: 0.5,
          }}
        >
          <CroppedImage image={project.image} alt="" />
        </Box>
        <Box sx={{ gridArea: 'end', justifySelf: 'end' }}>
          {project.url ? (
            <Box className="row-arrow" aria-hidden sx={{ ...arrowSx, width: 44, height: 44 }}>
              <ArrowForward sx={{ fontSize: 18 }} />
            </Box>
          ) : (
            <Box
              component="span"
              className="row-fill"
              sx={{ ...microLabel, display: 'inline-block', whiteSpace: 'nowrap', borderRadius: 999, border: '1px solid currentColor', px: 2, py: 1, color: colors.muted }}
            >
              {project.inDevelopment ? projects.inDevLabel : projects.soonLabel}
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  )
}

export default function Projects() {
  const { projects } = useLang().t
  const items = projects.items
  const flagship = items.find((p) => p.id === FLAGSHIP_ID) ?? items[0]
  const others = items.filter((p) => p !== flagship)
  const games = others.filter((p) => p.game)
  const rest = others.filter((p) => !p.game)

  // Floating preview that trails the pointer over the list (desktop, fine pointer only).
  const reduce = useReducedMotion()
  const canHover = useMediaQuery('(hover: hover) and (pointer: fine) and (min-width: 900px)', { noSsr: true })
  const [hovered, setHovered] = useState<Project | null>(null)
  const px = useMotionValue(0)
  const py = useMotionValue(0)
  const x = useSpring(px, { stiffness: 220, damping: 26, mass: 0.5 })
  const y = useSpring(py, { stiffness: 220, damping: 26, mass: 0.5 })
  const follow = (e: React.PointerEvent) => {
    // Clear of the custom cursor ring so the preview never sits on it.
    px.set(e.clientX + 80)
    py.set(e.clientY - PREVIEW_H / 2)
  }

  return (
    <Box component="section" id="work" aria-labelledby="work-title">
      <Box sx={{ ...contentSx, pt: { xs: 8, md: 5.5 }, pb: { xs: 8, md: 6 } }}>
        <Box
          component={motion.div}
          {...revealProps()}
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'stretch', md: 'flex-end' },
            gap: { xs: 3, md: 4 },
            mb: 4,
          }}
        >
          <Typography id="work-title" component="h2" sx={sectionTitleSx}>
            <VariableProximity text={projects.title} />
          </Typography>
          <Typography sx={{ fontSize: 13, lineHeight: 1.6, color: colors.muted, maxWidth: 300, pb: { md: 0.5 } }}>
            <VariableProximity text={projects.text} />
          </Typography>
        </Box>

        <Box onPointerMove={canHover ? follow : undefined} sx={{ borderTop: `1px solid ${colors.line}` }}>
          {/* First row: Lemnity 60% + games 20% each; games under it on tablets, stacked on phones. */}
          <Box
            sx={{
              display: 'grid',
              gap: 2,
              py: { xs: 3, md: 4 },
              borderBottom: `1px solid ${colors.line}`,
              gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'repeat(2, minmax(0, 1fr))', xl: '3fr 1fr 1fr' },
            }}
          >
            <FlagshipCard project={flagship} number="01" />
            {games.map((g, i) => (
              <GameCard key={g.id} project={g} index={i} />
            ))}
          </Box>
          <Box component="ul" sx={{ listStyle: 'none', m: 0, p: 0 }}>
            {rest.map((project, i) => (
              <Row key={project.id} project={project} number={pad(i + 2)} onHover={canHover ? setHovered : () => {}} />
            ))}
          </Box>
        </Box>
      </Box>

      {canHover && (
        <Box
          component={motion.div}
          aria-hidden
          style={{ x, y }}
          animate={{ opacity: hovered ? 1 : 0, scale: hovered ? 1 : 0.85 }}
          transition={{ duration: reduce ? 0 : 0.3, ease }}
          sx={{
            position: 'fixed',
            left: 0,
            top: 0,
            width: PREVIEW_W,
            height: PREVIEW_H,
            borderRadius: 2,
            overflow: 'hidden',
            border: '1px solid rgba(196,238,24,0.35)',
            boxShadow: '0 30px 60px -20px rgba(0,0,0,0.8)',
            pointerEvents: 'none',
            zIndex: 1040,
            bgcolor: colors.surface,
          }}
        >
          <AnimatePresence initial={false}>
            {hovered && (
              <motion.div
                key={hovered.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                style={{ position: 'absolute', inset: 0 }}
              >
                <CroppedImage image={hovered.image} alt="" />
              </motion.div>
            )}
          </AnimatePresence>
        </Box>
      )}
    </Box>
  )
}
