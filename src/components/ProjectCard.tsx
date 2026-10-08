import { useRef } from 'react'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import ArrowForward from '@mui/icons-material/ArrowForward'
import { motion, useReducedMotion, useSpring } from 'motion/react'
import { colors, outlinedIconButtonSx } from '../theme'
import type { Project, ProjectImage } from '../data/content'
import { useLang } from '../i18n'

export type CardSize = 'large' | 'small'

const MAX_TILT = 4
const tiltSpring = { stiffness: 150, damping: 18, mass: 0.5 }

/**
 * Shows only `image.crop` of the source file and scales it to cover its (absolutely positioned) parent,
 * like `object-fit: cover` on a cropped image. Uses container query units, so it adapts to any slot size.
 */
function CroppedImage({ image, alt, rotate = 0 }: { image: ProjectImage; alt: string; rotate?: number }) {
  const { crop: c, width, height, focus } = image
  const ratio = c.w / c.h
  return (
    <Box sx={{ position: 'absolute', inset: 0, containerType: 'size', overflow: 'hidden' }}>
      <Box
        sx={{
          '--fw': `max(100cqw, calc(100cqh * ${ratio}))`,
          position: 'absolute',
          width: 'var(--fw)',
          aspectRatio: `${c.w} / ${c.h}`,
          left: `calc((100cqw - var(--fw)) * ${focus[0]})`,
          top: `calc((100cqh - var(--fw) / ${ratio}) * ${focus[1]})`,
          overflow: 'hidden',
          // A slight tilt (like the reference) needs a small overscale so the frame still covers the slot.
          transform: rotate ? `rotate(${rotate}deg) scale(1.12)` : undefined,
        }}
      >
        <Box
          component="img"
          src={image.src}
          alt={alt}
          width={width}
          height={height}
          loading="lazy"
          decoding="async"
          draggable={false}
          sx={{
            position: 'absolute',
            maxWidth: 'none',
            width: `${(width / c.w) * 100}%`,
            height: 'auto',
            left: `${(-c.x / c.w) * 100}%`,
            top: `${(-c.y / c.h) * 100}%`,
            userSelect: 'none',
          }}
        />
      </Box>
    </Box>
  )
}

interface Props {
  project: Project
  size: CardSize
}

export default function ProjectCard({ project, size }: Props) {
  const { projects } = useLang().t
  const large = size === 'large'
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const rotateX = useSpring(0, tiltSpring)
  const rotateY = useSpring(0, tiltSpring)

  const onPointerMove = (e: React.PointerEvent) => {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const x = e.clientX - r.left
    const y = e.clientY - r.top
    // Spotlight position (CSS vars, no re-render).
    el.style.setProperty('--mx', `${x}px`)
    el.style.setProperty('--my', `${y}px`)
    if (reduce || e.pointerType !== 'mouse' || window.innerWidth < 900) return
    rotateY.set((x / r.width - 0.5) * 2 * MAX_TILT)
    rotateX.set(-(y / r.height - 0.5) * 2 * MAX_TILT)
  }
  const onPointerLeave = () => {
    rotateX.set(0)
    rotateY.set(0)
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, minHeight: 0 }}>
      <motion.div
        ref={ref}
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
        style={{ rotateX, rotateY, transformPerspective: 1200, flex: 1, display: 'flex', minHeight: 0 }}
      >
        <Card
          elevation={0}
          sx={{
            position: 'relative',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            borderRadius: 1,
            border: `1px solid ${colors.line}`,
            background: 'linear-gradient(160deg, #111111 0%, #070707 100%)',
            minHeight: large ? { xs: 420, sm: 460, md: 0 } : { xs: 230, md: 0 },
            transition: 'border-color .5s ease, box-shadow .5s ease',
            // Pointer-following gold spotlight.
            '&::after': {
              content: '""',
              position: 'absolute',
              inset: 0,
              zIndex: 1,
              pointerEvents: 'none',
              background:
                'radial-gradient(420px circle at var(--mx, 50%) var(--my, 50%), rgba(196,238,24,0.13), transparent 60%)',
              opacity: 0,
              transition: 'opacity .5s ease',
            },
            '&:hover': {
              borderColor: 'rgba(196,238,24,0.45)',
              boxShadow: '0 30px 60px -30px rgba(0,0,0,0.8)',
            },
            '&:hover::after': { opacity: 1 },
            '&:hover .pc-media': { transform: 'scale(1.05) translate(-1.5%, -1%)' },
            '&:hover .pc-arrow, & .pc-arrow:focus-visible': {
              bgcolor: colors.gold,
              borderColor: colors.gold,
              color: colors.bg,
              boxShadow: '0 0 24px rgba(196,238,24,0.35)',
              '& svg': { transform: 'rotate(-45deg)' },
            },
            '@media (prefers-reduced-motion: reduce)': {
              '&:hover .pc-media': { transform: 'none' },
            },
          }}
        >
          {/* Copy */}
          <motion.div
            layout="position"
            style={{
              position: 'relative',
              zIndex: 2,
              width: large ? '100%' : undefined,
              maxWidth: large ? 380 : undefined,
              pointerEvents: 'none',
            }}
          >
            <Box
              sx={{
                p: large ? { xs: '22px', md: '28px 32px' } : { xs: '20px', md: '24px 24px' },
                width: large ? 'auto' : { xs: '56%', md: '46%' },
                minWidth: large ? undefined : { xs: 170, md: 190 },
              }}
            >
              <Typography sx={{ fontSize: 12, color: colors.muted, letterSpacing: '0.08em', mb: large ? 2.5 : 1.5 }}>
                {project.number}
              </Typography>
              <Typography
                component="h3"
                sx={{
                  fontSize: large ? { xs: 30, md: 36 } : { xs: 22, md: 26 },
                  fontWeight: 400,
                  letterSpacing: '-0.02em',
                  lineHeight: 1.1,
                  mb: large ? 1.5 : 1,
                }}
              >
                {project.logo?.mark ? (
                  <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: large ? 1.75 : 1.25 }}>
                    <Box
                      component="img"
                      src={project.logo.src}
                      alt=""
                      width={project.logo.width}
                      height={project.logo.height}
                      decoding="async"
                      sx={{ display: 'block', width: 'auto', height: large ? { xs: 40, md: 48 } : { xs: 34, md: 40 }, flexShrink: 0 }}
                    />
                    <span>{project.title}</span>
                  </Box>
                ) : project.logo ? (
                  <Box
                    component="img"
                    src={project.logo.src}
                    alt={project.title}
                    width={project.logo.width}
                    height={project.logo.height}
                    decoding="async"
                    sx={{
                      display: 'block',
                      width: 'auto',
                      maxWidth: '100%',
                      height: large ? { xs: 30, md: 38 } : { xs: 28, md: 34 },
                      my: large ? 0.75 : 0.5,
                    }}
                  />
                ) : (
                  project.title
                )}
              </Typography>
              <Typography
                sx={{
                  fontSize: large ? { xs: 13, md: 14 } : { xs: 12, md: 12.5 },
                  lineHeight: 1.55,
                  color: 'rgba(244,241,236,0.72)',
                  maxWidth: large ? 290 : 220,
                }}
              >
                {project.description}
              </Typography>
              {project.url ? (
                <IconButton
                  className="pc-arrow"
                  component="a"
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${projects.openLabel} ${project.title}`}
                  sx={{
                    ...outlinedIconButtonSx,
                    width: 40,
                    height: 40,
                    mt: large ? 3.5 : 2.5,
                    pointerEvents: 'auto',
                    borderColor: 'rgba(244,241,236,0.35)',
                    '& svg': { fontSize: 18, transition: 'transform .45s cubic-bezier(0.22,1,0.36,1)' },
                  }}
                >
                  <ArrowForward />
                </IconButton>
              ) : (
                <Box
                  component="span"
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 1,
                    mt: large ? 3.5 : 2.5,
                    px: 1.75,
                    height: 32,
                    border: '1px solid rgba(196,238,24,0.45)',
                    borderRadius: 999,
                    color: colors.gold,
                    fontSize: 10,
                    fontWeight: 500,
                    letterSpacing: '0.22em',
                    textTransform: 'uppercase',
                    '&::before': {
                      content: '""',
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      bgcolor: colors.gold,
                      '@keyframes soonBlink': { '50%': { opacity: 0.25 } },
                      animation: 'soonBlink 1.8s ease-in-out infinite',
                      '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
                    },
                  }}
                >
                  {projects.soonLabel}
                </Box>
              )}
            </Box>
          </motion.div>

          {/* Image */}
          <Box
            sx={
              large
                ? { position: 'relative', flex: 1, minHeight: 160 }
                : { position: 'absolute', top: 0, right: 0, bottom: 0, width: { xs: '50%', md: '58%' } }
            }
          >
            <motion.div layout style={{ position: 'absolute', inset: 0 }}>
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  maskImage: large
                    ? 'linear-gradient(to bottom, transparent 0%, #000 22%)'
                    : 'linear-gradient(to right, transparent 0%, #000 28%)',
                  WebkitMaskImage: large
                    ? 'linear-gradient(to bottom, transparent 0%, #000 22%)'
                    : 'linear-gradient(to right, transparent 0%, #000 28%)',
                }}
              >
                <Box
                  className="pc-media"
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    transformOrigin: large ? '60% 60%' : '70% 50%',
                    transition: 'transform 1s cubic-bezier(0.22,1,0.36,1)',
                  }}
                >
                  <CroppedImage image={project.image} alt={project.title} rotate={large ? -2 : 0} />
                </Box>
              </Box>
            </motion.div>
          </Box>
        </Card>
      </motion.div>

      <motion.div layout="position">
        <Stack direction="row" component="ul" sx={{ flexWrap: 'wrap', listStyle: 'none', m: 0, p: 0, pt: 0.75, pl: 1.25 }}>
          {project.tags.map((t) => (
            <Box component="li" key={t}>
              <Chip size="small" label={`#${t}`} sx={{ height: 24, mr: 1, '& .MuiChip-label': { pr: 1 } }} />
            </Box>
          ))}
        </Stack>
      </motion.div>
    </Box>
  )
}
