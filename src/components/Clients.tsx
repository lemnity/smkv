import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { visuallyHidden } from '@mui/utils'
import { useReducedMotion } from 'motion/react'
import { colors, contentSx, sectionTitleSx } from '../theme'
import { useLang } from '../i18n'
import { clients, type Client } from '../data/clients'
import { Reveal } from './effects'

/** Seconds for one marquee row to travel one full sequence. */
const SPEED = 45
/** Logos are white silhouettes so every brand reads the same on black. */
const SILHOUETTE = 'brightness(0) invert(1)'

const cellSx = {
  flexShrink: 0,
  width: { xs: 168, md: 232 },
  height: { xs: 92, md: 120 },
  display: 'grid',
  placeItems: 'center',
  border: `1px solid ${colors.line}`,
  borderRadius: 1,
  transition: 'border-color .3s, background-color .3s',
  '& img': {
    maxWidth: '62%',
    maxHeight: { xs: 34, md: 42 },
    width: 'auto',
    height: 'auto',
    opacity: 0.5,
    transition: 'opacity .3s',
  },
  '&:hover': {
    borderColor: 'rgba(196,238,24,0.45)',
    bgcolor: 'rgba(196,238,24,0.03)',
    '& img': { opacity: 1 },
  },
}

function Logo({ client }: { client: Client }) {
  return (
    <Box sx={cellSx}>
      <img
        src={client.src}
        alt=""
        width={client.w}
        height={client.h}
        loading="lazy"
        decoding="async"
        draggable={false}
        style={{ filter: client.filter ?? SILHOUETTE }}
      />
    </Box>
  )
}

/** Endless row: the sequence is rendered twice and slides by exactly one copy. */
function MarqueeRow({ items, reverse }: { items: Client[]; reverse?: boolean }) {
  // Repeat short rows so one copy is always wider than the viewport.
  const sequence = items.length < 8 ? [...items, ...items] : items
  return (
    <Box
      sx={{
        display: 'flex',
        width: 'max-content',
        animation: `clientsMarquee ${SPEED}s linear infinite`,
        animationDirection: reverse ? 'reverse' : 'normal',
      }}
    >
      {[0, 1].map((copy) =>
        sequence.map((c, i) => (
          <Box key={`${copy}-${i}`} sx={{ pr: { xs: 1.5, md: 2 } }}>
            <Logo client={c} />
          </Box>
        )),
      )}
    </Box>
  )
}

export default function Clients() {
  const { clients: copy } = useLang().t
  const reduce = useReducedMotion()
  const half = Math.ceil(clients.length / 2)

  return (
    <Box component="section" id="clients" aria-labelledby="clients-title">
      <Box sx={{ ...contentSx, pt: { xs: 8, md: 10 }, pb: { xs: 8, md: 10 } }}>
        <Reveal>
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              justifyContent: 'space-between',
              alignItems: { xs: 'stretch', md: 'flex-end' },
              gap: { xs: 3, md: 4 },
              mb: { xs: 4, md: 5 },
            }}
          >
            <Box>
              <Typography id="clients-title" component="h2" sx={sectionTitleSx}>
                {copy.title}
              </Typography>
            </Box>
            <Typography sx={{ fontSize: 13, lineHeight: 1.6, color: colors.muted, maxWidth: 300, pb: { md: 0.5 } }}>
              {copy.text}
            </Typography>
          </Box>
        </Reveal>

        {/* Names for assistive tech; the visual rows below are decorative. */}
        <Box component="ul" aria-label={copy.listLabel} sx={visuallyHidden}>
          {clients.map((c) => (
            <li key={c.src}>{c.name}</li>
          ))}
        </Box>

        <Reveal delay={0.1}>
          {reduce ? (
            <Box
              aria-hidden
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(auto-fill, minmax(200px, 1fr))' },
                gap: { xs: 1.5, md: 2 },
                '& > div': { width: 'auto' },
              }}
            >
              {clients.map((c) => (
                <Logo key={c.src} client={c} />
              ))}
            </Box>
          ) : (
            <Box
              aria-hidden
              sx={{
                display: 'grid',
                gap: { xs: 1.5, md: 2 },
                overflow: 'hidden',
                maskImage: 'linear-gradient(to right, transparent, #000 8%, #000 92%, transparent)',
                '@keyframes clientsMarquee': {
                  from: { transform: 'translateX(0)' },
                  to: { transform: 'translateX(-50%)' },
                },
                '&:hover > div': { animationPlayState: 'paused' },
              }}
            >
              <MarqueeRow items={clients.slice(0, half)} />
              <MarqueeRow items={clients.slice(half)} reverse />
            </Box>
          )}
        </Reveal>
      </Box>
    </Box>
  )
}
