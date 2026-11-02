import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { colors, contentSx, sectionTitleSx } from '../theme'
import { useLang } from '../i18n'
import { Reveal, VariableProximity } from './effects'
import HexGame from './game/HexGame'

const cardSx = {
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
  p: { xs: 2.5, md: 3 },
  bgcolor: colors.surface,
  border: `1px solid ${colors.line}`,
  borderRadius: 1,
  transition: 'border-color .3s, box-shadow .3s',
  '&:hover': {
    borderColor: 'rgba(196,238,24,0.45)',
    boxShadow: '0 0 32px rgba(196,238,24,0.06)',
  },
}

/** The studio site's Tailwind `lg` (1024px): the six-column services layout starts there. */
const STUDIO_LG = '@media (min-width: 1024px)'

/**
 * Gap-free layout, as on the studio site: three cards, then two wider ones, then the game across
 * the whole row (copy on the left, the live game on the right). Tablets: 2×2, then MVP and the game full width.
 */
function serviceSpan(i: number, game: boolean) {
  if (game) return { gridColumn: { md: 'span 2' }, [STUDIO_LG]: { gridColumn: 'span 6' } }
  if (i < 3) return { [STUDIO_LG]: { gridColumn: 'span 2' } }
  if (i === 4) return { gridColumn: { md: 'span 2' }, [STUDIO_LG]: { gridColumn: 'span 3' } }
  return { [STUDIO_LG]: { gridColumn: 'span 3' } }
}

type ServiceItem = { title: string; text: string; deliverables: readonly string[] }

function ServiceBody({ item, label }: { item: ServiceItem; label: string }) {
  return (
    <>
      <Typography component="h3" sx={{ fontSize: { xs: 20, md: 22 }, fontWeight: 500, lineHeight: 1.25, letterSpacing: '-0.01em' }}>
        <VariableProximity text={item.title} />
      </Typography>
      <Typography sx={{ fontSize: 16, lineHeight: 1.65, color: 'rgba(244,241,236,0.72)' }}>
        <VariableProximity text={item.text} />
      </Typography>
      <Box component="ul" aria-label={label} sx={{ m: 0, p: 0, mt: 'auto', pt: 1, listStyle: 'none', display: 'grid', gap: 0.75 }}>
        {item.deliverables.map((d) => (
          <Box
            component="li"
            key={d}
            sx={{
              position: 'relative',
              pl: 2.25,
              fontSize: 16,
              lineHeight: 1.5,
              color: colors.text,
              '&::before': {
                content: '""',
                position: 'absolute',
                left: 0,
                top: '0.6em',
                width: 8,
                height: '1px',
                bgcolor: colors.gold,
              },
            }}
          >
            <VariableProximity text={d} />
          </Box>
        ))}
      </Box>
    </>
  )
}

export default function Services() {
  const { services: copy } = useLang().t

  return (
    <Box component="section" id="services" aria-labelledby="services-title">
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
            <Typography id="services-title" component="h2" sx={sectionTitleSx}>
              <VariableProximity text={copy.title} />
            </Typography>
            <Typography sx={{ fontSize: 16, lineHeight: 1.6, color: colors.muted, maxWidth: 300, pb: { md: 0.5 } }}>
              <VariableProximity text={copy.text} />
            </Typography>
          </Box>
        </Reveal>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'repeat(2, minmax(0, 1fr))' },
            [STUDIO_LG]: { gridTemplateColumns: 'repeat(6, minmax(0, 1fr))' },
            gap: { xs: 1.5, md: 2 },
          }}
        >
          {copy.items.map((item, i) => {
            const game = 'game' in item && item.game
            return (
              // The Reveal wrapper sits between the grid cell and the card: stretch it so cards in a row match.
              <Box key={item.title} sx={{ ...serviceSpan(i, !!game), display: 'flex', '& > div': { display: 'flex', flex: 1, minWidth: 0 } }}>
                <Reveal delay={(i % 3) * 0.08}>
                  {game ? (
                    <Box
                      component="article"
                      sx={{
                        ...cardSx,
                        flex: 1,
                        display: { xs: 'flex', md: 'grid' },
                        gridTemplateColumns: { md: 'minmax(0, 1fr) minmax(0, 1.4fr)' },
                        columnGap: { md: 4 },
                      }}
                    >
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <ServiceBody item={item} label={copy.deliverablesLabel} />
                      </Box>
                      <HexGame sx={{ order: { xs: -1, md: 0 }, aspectRatio: 'auto', height: { xs: 200, md: '100%' }, minHeight: { md: 320 } }} />
                    </Box>
                  ) : (
                    <Box component="article" sx={{ ...cardSx, flex: 1 }}>
                      <ServiceBody item={item} label={copy.deliverablesLabel} />
                    </Box>
                  )}
                </Reveal>
              </Box>
            )
          })}
        </Box>

        <Box sx={{ mt: { xs: 7, md: 9 } }}>
          <Reveal>
            <Typography component="h3" sx={{ fontSize: { xs: 28, md: 34 }, fontWeight: 400, letterSpacing: '-0.02em', lineHeight: 1.1, mb: { xs: 3, md: 4 } }}>
              <VariableProximity text={copy.process.title} />
            </Typography>
          </Reveal>
          <Box
            component="ol"
            sx={{
              m: 0,
              p: 0,
              listStyle: 'none',
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(5, 1fr)' },
              gap: { xs: 1.5, md: 2 },
            }}
          >
            {copy.process.steps.map((step, i) => (
              // The Reveal wrapper sits between the li and the card: stretch both so every step
              // in a row is as tall as the tallest one.
              <Box component="li" key={step.title} sx={{ display: 'flex', '& > div': { display: 'flex', flex: 1, minWidth: 0 } }}>
                <Reveal delay={i * 0.06}>
                  <Box sx={{ ...cardSx, flex: 1, gap: 1.25 }}>
                    <Typography aria-hidden sx={{ fontSize: 16, letterSpacing: '0.12em', color: colors.gold }}>
                      {String(i + 1).padStart(2, '0')}
                    </Typography>
                    <Typography component="h4" sx={{ fontSize: 17, fontWeight: 500, lineHeight: 1.3 }}>
                      <VariableProximity text={step.title} />
                    </Typography>
                    <Typography sx={{ fontSize: 16, lineHeight: 1.6, color: colors.muted }}><VariableProximity text={step.text} /></Typography>
                  </Box>
                </Reveal>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
