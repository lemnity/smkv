import { useState } from 'react'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import ArrowBack from '@mui/icons-material/ArrowBack'
import ArrowForward from '@mui/icons-material/ArrowForward'
import { AnimatePresence, LayoutGroup, motion } from 'motion/react'
import { visuallyHidden } from '@mui/utils'
import { colors, contentSx, outlinedIconButtonSx, sectionTitleSx } from '../theme'
import { useLang } from '../i18n'
import { Reveal } from './effects'
import ProjectCard from './ProjectCard'

const ease = [0.22, 1, 0.36, 1] as const
/** The pinned project always takes the large card; the rest scroll through the right column. */
const PINNED_ID = 'lemnity'
const SIDE_AREAS = ['top', 'bottom'] as const

export default function Projects() {
  const { projects } = useLang().t
  const items = projects.items
  const pinned = items.find((p) => p.id === PINNED_ID) ?? items[0]
  const rest = items.filter((p) => p !== pinned)
  // order[slot] = index into `rest`; slots 0–1 are visible in the right column.
  const [order, setOrder] = useState(() => rest.map((_, i) => i))
  // 1 = scrolled up (next), -1 = scrolled down (prev): drives the enter/exit direction.
  const [direction, setDirection] = useState(1)
  // Only announce after the user navigates, not on initial render.
  const [announced, setAnnounced] = useState(false)
  const first = rest[order[0]]
  const announce = announced && first ? first.title : ''
  const rotate = (dir: 1 | -1) => {
    setDirection(dir)
    setOrder((o) => (dir === 1 ? [...o.slice(1), o[0]] : [o[o.length - 1], ...o.slice(0, -1)]))
    setAnnounced(true)
  }
  const next = () => rotate(1)
  const prev = () => rotate(-1)

  return (
    <Box component="section" id="work" aria-labelledby="work-title">
      <Box sx={{ ...contentSx, pt: { xs: 8, md: 5.5 }, pb: { xs: 8, md: 5 } }}>
        {/* Head row */}
        <Reveal>
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              justifyContent: 'space-between',
              alignItems: { xs: 'stretch', md: 'flex-end' },
              gap: { xs: 3, md: 4 },
              mb: { xs: 4, md: 3 },
            }}
          >
            <Box>
              <Typography id="work-title" component="h2" sx={sectionTitleSx}>
                {projects.title}
              </Typography>
            </Box>
            <Stack
              direction="row"
              spacing={{ xs: 2, md: 8 }}
              sx={{ alignItems: 'center', justifyContent: 'space-between', pb: { md: 0.5 } }}
            >
              <Typography sx={{ fontSize: 13, lineHeight: 1.6, color: colors.muted, maxWidth: 300 }}>
                {projects.text}
              </Typography>
              <Stack direction="row" spacing={1.5} sx={{ flexShrink: 0 }}>
                <IconButton aria-label={projects.prevLabel} aria-controls="work-grid" onClick={prev} sx={outlinedIconButtonSx}>
                  <ArrowBack sx={{ fontSize: 18 }} />
                </IconButton>
                <IconButton aria-label={projects.nextLabel} aria-controls="work-grid" onClick={next} sx={outlinedIconButtonSx}>
                  <ArrowForward sx={{ fontSize: 18 }} />
                </IconButton>
              </Stack>
            </Stack>
          </Box>
        </Reveal>

        <Box sx={visuallyHidden} aria-live="polite" aria-atomic="true">
          {announce}
        </Box>

        {/* Cards: the pinned project stays large on the left; the arrows scroll the right column. */}
        <LayoutGroup id="projects">
          <Box
            id="work-grid"
            sx={{
              display: 'grid',
              gap: '12px',
              gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'repeat(2, minmax(0, 1fr))' },
              gridTemplateAreas: { xs: '"big" "side"', md: '"big side"' },
              height: { md: 548, lg: 560 },
            }}
          >
            <Box sx={{ gridArea: 'big', display: 'flex', minWidth: 0, minHeight: 0, '& > div': { display: 'flex', flex: 1, minWidth: 0 } }}>
              <Reveal>
                <ProjectCard project={pinned} size="large" />
              </Reveal>
            </Box>

            {/* Clip the column so cards slide in from below / out at the top. */}
            <Box
              sx={{
                gridArea: 'side',
                display: 'grid',
                gap: '12px',
                gridTemplateRows: { xs: 'auto auto', md: 'repeat(2, minmax(0, 1fr))' },
                gridTemplateAreas: '"top" "bottom"',
                overflow: 'hidden',
                minHeight: 0,
              }}
            >
              <AnimatePresence initial={false} mode="popLayout" custom={direction}>
                {order.slice(0, SIDE_AREAS.length).map((restIndex, slot) => {
                  const project = rest[restIndex]
                  return (
                    <motion.div
                      key={project.id}
                      layout
                      custom={direction}
                      variants={{
                        enter: (d: number) => ({ y: d > 0 ? '110%' : '-110%', opacity: 0 }),
                        center: { y: 0, opacity: 1 },
                        exit: (d: number) => ({ y: d > 0 ? '-110%' : '110%', opacity: 0 }),
                      }}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{ layout: { duration: 0.7, ease }, y: { duration: 0.7, ease }, opacity: { duration: 0.45 } }}
                      style={{ gridArea: SIDE_AREAS[slot], display: 'flex', minWidth: 0, minHeight: 0 }}
                    >
                      <ProjectCard project={project} size="small" />
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </Box>
          </Box>
        </LayoutGroup>
      </Box>
    </Box>
  )
}
