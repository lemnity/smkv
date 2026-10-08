import { useState } from 'react'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import ArrowBack from '@mui/icons-material/ArrowBack'
import ArrowForward from '@mui/icons-material/ArrowForward'
import { LayoutGroup, motion } from 'motion/react'
import { colors, contentSx, microLabel, outlinedIconButtonSx } from '../theme'
import { projects } from '../data/content'
import { Reveal } from './effects'
import ProjectCard from './ProjectCard'

const ease = [0.22, 1, 0.36, 1] as const
/** Slot 0 is the large card; slots 1–2 are the stacked small cards. */
const AREAS = ['big', 'top', 'bottom'] as const

export const sectionTitleSx = {
  fontSize: { xs: 38, sm: 46, md: 46, lg: 56 },
  fontWeight: 400,
  letterSpacing: '-0.025em',
  lineHeight: 1.05,
} as const

export default function Projects() {
  const items = projects.items
  // order[slot] = index into items
  const [order, setOrder] = useState(() => items.map((_, i) => i))
  const next = () => setOrder((o) => [...o.slice(1), o[0]])
  const prev = () => setOrder((o) => [o[o.length - 1], ...o.slice(0, -1)])

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
              <Typography sx={{ ...microLabel, fontSize: 10, letterSpacing: '0.3em', color: colors.gold, mb: { xs: 2, md: 2.5 } }}>
                {projects.eyebrow}
              </Typography>
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

        {/* Cards: one large + two stacked; arrows rotate which project is large. */}
        <LayoutGroup id="projects">
          <Box
            id="work-grid"
            sx={{
              display: 'grid',
              gap: '12px',
              gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'repeat(2, minmax(0, 1fr))' },
              gridTemplateRows: { md: 'repeat(2, minmax(0, 1fr))' },
              gridTemplateAreas: { xs: '"big" "top" "bottom"', md: '"big top" "big bottom"' },
              height: { md: 548, lg: 560 },
            }}
          >
            {order.map((itemIndex, slot) => {
              const project = items[itemIndex]
              return (
                <motion.div
                  key={project.id}
                  layoutId={`project-${project.id}`}
                  layout
                  transition={{ layout: { duration: 0.8, ease } }}
                  style={{ gridArea: AREAS[slot], display: 'flex', minWidth: 0, minHeight: 0 }}
                >
                  <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.15 }}
                    transition={{ duration: 0.9, delay: itemIndex * 0.12, ease }}
                    style={{ display: 'flex', flex: 1, minWidth: 0, minHeight: 0 }}
                  >
                    <ProjectCard project={project} size={slot === 0 ? 'large' : 'small'} />
                  </motion.div>
                </motion.div>
              )
            })}
          </Box>
        </LayoutGroup>
      </Box>
    </Box>
  )
}
