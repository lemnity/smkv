import { useState } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import ArrowForward from '@mui/icons-material/ArrowForward'
import ExpandMore from '@mui/icons-material/ExpandMore'
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring } from 'motion/react'
import { colors, contentSx, sectionTitleSx } from '../theme'
import { useLang } from '../i18n'
import type { Project } from '../data/content'
import { Reveal, VariableProximity } from './effects'
import { CroppedImage } from './ProjectCard'

const ease = [0.22, 1, 0.36, 1] as const
/** The flagship always leads, as a full-width banner. */
const FLAGSHIP_ID = 'lemnity'
/** Rows shown before "All projects". */
const VISIBLE = 6
/** Floating preview size (desktop). */
const PREVIEW_W = 380
const PREVIEW_H = 240

const pad = (n: number) => String(n).padStart(2, '0')

/** One project row; the whole row is the link when the project has one. */
function Row({ project, number, delay, onHover }: { project: Project; number: number; delay: number; onHover: (p: Project | null) => void }) {
  const { projects } = useLang().t
  const linkProps = project.url
    ? { component: 'a' as const, href: project.url, target: '_blank', rel: 'noopener noreferrer', 'aria-label': `${projects.openLabel} ${project.title}` }
    : {}

  return (
    <Box
      component={motion.li}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 16 }}
      transition={{ duration: 0.5, delay, ease }}
      onPointerEnter={(e) => e.pointerType === 'mouse' && onHover(project)}
      onPointerLeave={() => onHover(null)}
      sx={{ borderBottom: `1px solid ${colors.line}` }}
    >
      <Box
        {...linkProps}
        sx={{
          display: 'grid',
          // Fixed last column so descriptions line up whether a row ends in an arrow or a "soon" pill.
          gridTemplateColumns: { xs: '40px 1fr auto', md: '64px minmax(0, 1.1fr) minmax(0, 1fr) 132px' },
          gridTemplateAreas: { xs: '"num title end" "num desc desc" "num thumb thumb"', md: '"num title desc end"' },
          alignItems: { xs: 'start', md: 'center' },
          columnGap: { xs: 1.5, md: 4 },
          rowGap: 1.25,
          py: { xs: 3, md: 3.5 },
          px: { md: 1 },
          color: colors.text,
          textDecoration: 'none',
          position: 'relative',
          transition: 'background-color .4s ease, padding .4s cubic-bezier(0.22,1,0.36,1)',
          '&:hover': { bgcolor: 'rgba(196,238,24,0.03)', px: { md: 3 } },
          '&:hover .row-title': { color: colors.goldLight },
          '&:hover .row-arrow': { bgcolor: colors.gold, borderColor: colors.gold, color: colors.bg, transform: 'rotate(-45deg)' },
          '&:focus-visible': { outline: `2px solid ${colors.goldLight}`, outlineOffset: 2 },
        }}
      >
        <Typography sx={{ gridArea: 'num', fontSize: 12, letterSpacing: '0.12em', color: colors.muted, pt: { xs: 1, md: 0 } }}>
          {pad(number)}
        </Typography>

        <Typography
          component="h3"
          className="row-title"
          sx={{
            gridArea: 'title',
            fontSize: { xs: 26, md: 34, lg: 40 },
            fontWeight: 400,
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
            transition: 'color .3s',
          }}
        >
          <VariableProximity text={project.title} />
        </Typography>

        <Box sx={{ gridArea: 'desc', minWidth: 0 }}>
          <Typography sx={{ fontSize: { xs: 14, md: 14 }, lineHeight: 1.55, color: 'rgba(244,241,236,0.72)', maxWidth: 420 }}>
            <VariableProximity text={project.description} />
          </Typography>
          <Typography sx={{ mt: 0.75, fontSize: 12, color: colors.muted }}>
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
            <Box
              className="row-arrow"
              aria-hidden
              sx={{
                width: 44,
                height: 44,
                display: 'grid',
                placeItems: 'center',
                borderRadius: '50%',
                border: '1px solid rgba(244,241,236,0.35)',
                transition: 'all .45s cubic-bezier(0.22,1,0.36,1)',
              }}
            >
              <ArrowForward sx={{ fontSize: 18 }} />
            </Box>
          ) : (
            <Box
              component="span"
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1,
                px: 1.75,
                height: 32,
                border: '1px solid rgba(196,238,24,0.45)',
                borderRadius: 999,
                color: colors.gold,
                fontSize: 10,
                fontWeight: 500,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                whiteSpace: 'nowrap',
                '&::before': { content: '""', width: 6, height: 6, borderRadius: '50%', bgcolor: colors.gold },
              }}
            >
              {projects.soonLabel}
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  )
}

/** Lemnity: the first, oversized row of the list, with its preview always on show. */
function FlagshipRow({ project }: { project: Project }) {
  const { projects } = useLang().t
  const linkProps = project.url
    ? { component: 'a' as const, href: project.url, target: '_blank', rel: 'noopener noreferrer', 'aria-label': `${projects.openLabel} ${project.title}` }
    : {}

  return (
    <Box
      component={motion.li}
      // Reveal on scroll, on the li itself so the list stays valid HTML.
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.8, ease }}
      sx={{ borderBottom: `1px solid ${colors.line}` }}
    >
      <Box
        {...linkProps}
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '40px 1fr', md: '64px minmax(0, 1fr) minmax(0, 1.15fr)' },
          gridTemplateAreas: { xs: '"num body" "num media"', md: '"num body media"' },
          alignItems: 'center',
          columnGap: { xs: 1.5, md: 4 },
          rowGap: 2.5,
          py: { xs: 4, md: 5 },
          px: { md: 1 },
          color: colors.text,
          textDecoration: 'none',
          transition: 'background-color .4s ease',
          '&:hover': { bgcolor: 'rgba(196,238,24,0.03)' },
          '&:hover .flag-media': { transform: 'scale(1.03)' },
          '&:hover .row-arrow': { bgcolor: colors.gold, borderColor: colors.gold, color: colors.bg, transform: 'rotate(-45deg)' },
          '&:focus-visible': { outline: `2px solid ${colors.goldLight}`, outlineOffset: 2 },
        }}
      >
        <Typography sx={{ gridArea: 'num', alignSelf: 'start', fontSize: 12, letterSpacing: '0.12em', color: colors.gold, pt: 1 }}>
          01
        </Typography>

        <Box sx={{ gridArea: 'body', minWidth: 0 }}>
          <Box
            component="span"
            sx={{
              display: 'inline-block',
              mb: { xs: 2.5, md: 3 },
              px: 1.5,
              py: 0.5,
              borderRadius: 999,
              bgcolor: colors.gold,
              color: colors.bg,
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: '0.2em',
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
                decoding="async"
                sx={{ display: 'block', width: 'auto', maxWidth: '100%', height: { xs: 52, md: 76, lg: 92 } }}
              />
            ) : (
              <Box component="span" sx={{ fontSize: { xs: 48, md: 80 }, lineHeight: 1 }}>
                {project.title}
              </Box>
            )}
          </Typography>
          <Typography sx={{ mt: { xs: 2.5, md: 3 }, fontSize: { xs: 15, md: 18 }, lineHeight: 1.5, color: 'rgba(244,241,236,0.8)', maxWidth: 440 }}>
            <VariableProximity text={project.description} />
          </Typography>
          <Box sx={{ mt: 3, display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
            {project.url && (
              <Box
                className="row-arrow"
                aria-hidden
                sx={{
                  width: 52,
                  height: 52,
                  display: 'grid',
                  placeItems: 'center',
                  borderRadius: '50%',
                  border: '1px solid rgba(244,241,236,0.35)',
                  transition: 'all .45s cubic-bezier(0.22,1,0.36,1)',
                }}
              >
                <ArrowForward sx={{ fontSize: 20 }} />
              </Box>
            )}
            <Typography sx={{ fontSize: 12, color: colors.muted }}>{project.tags.map((t) => `#${t}`).join('  ')}</Typography>
          </Box>
        </Box>

        <Box
          sx={{
            gridArea: 'media',
            position: 'relative',
            aspectRatio: '16 / 10',
            borderRadius: 2,
            overflow: 'hidden',
            border: `1px solid ${colors.line}`,
            boxShadow: '0 40px 80px -40px rgba(196,238,24,0.25)',
          }}
        >
          <Box className="flag-media" sx={{ position: 'absolute', inset: 0, transition: 'transform 1s cubic-bezier(0.22,1,0.36,1)' }}>
            <CroppedImage image={project.image} alt="" />
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default function Projects() {
  const { projects } = useLang().t
  const items = projects.items
  const flagship = items.find((p) => p.id === FLAGSHIP_ID) ?? items[0]
  const rest = items.filter((p) => p !== flagship)
  const [expanded, setExpanded] = useState(false)
  const shown = expanded ? rest : rest.slice(0, VISIBLE)
  const hidden = rest.length - VISIBLE

  // Floating preview that trails the pointer over the list (desktop, fine pointer only).
  const reduce = useReducedMotion()
  const canHover = useMediaQuery('(hover: hover) and (pointer: fine) and (min-width: 900px)', { noSsr: true })
  const [hovered, setHovered] = useState<Project | null>(null)
  const px = useMotionValue(0)
  const py = useMotionValue(0)
  const x = useSpring(px, { stiffness: 220, damping: 26, mass: 0.5 })
  const y = useSpring(py, { stiffness: 220, damping: 26, mass: 0.5 })
  const follow = (e: React.PointerEvent) => {
    px.set(e.clientX + 28)
    py.set(e.clientY - PREVIEW_H / 2)
  }

  return (
    <Box component="section" id="work" aria-labelledby="work-title">
      <Box sx={{ ...contentSx, pt: { xs: 8, md: 5.5 }, pb: { xs: 8, md: 6 } }}>
        <Reveal>
          <Box
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
        </Reveal>

        {/* One index list: Lemnity first and oversized, then everything else */}
        <Box
          component="ul"
          onPointerMove={canHover ? follow : undefined}
          sx={{ listStyle: 'none', m: 0, p: 0, borderTop: `1px solid ${colors.line}` }}
        >
          <FlagshipRow project={flagship} />
          <AnimatePresence initial={false}>
            {shown.map((project, i) => (
              <Row
                key={project.id}
                project={project}
                number={items.indexOf(project) + 1}
                delay={i >= VISIBLE ? (i - VISIBLE) * 0.05 : 0}
                onHover={canHover ? setHovered : () => {}}
              />
            ))}
          </AnimatePresence>
        </Box>

        {hidden > 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: { xs: 4, md: 5 } }}>
            <Button
              variant="outlined"
              aria-expanded={expanded}
              onClick={() => setExpanded((v) => !v)}
              endIcon={<ExpandMore sx={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform .3s' }} />}
              sx={{ borderRadius: 999, px: 3.5, py: 1.25 }}
            >
              {expanded ? projects.showLess : `${projects.showAll} · ${items.length}`}
            </Button>
          </Box>
        )}
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
            border: `1px solid rgba(196,238,24,0.35)`,
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
