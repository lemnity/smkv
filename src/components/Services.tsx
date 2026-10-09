import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { colors, contentSx, sectionTitleSx } from '../theme'
import { useLang } from '../i18n'
import { Reveal } from './effects'

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
              {copy.title}
            </Typography>
            <Typography sx={{ fontSize: 13, lineHeight: 1.6, color: colors.muted, maxWidth: 300, pb: { md: 0.5 } }}>
              {copy.text}
            </Typography>
          </Box>
        </Reveal>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
            gap: { xs: 1.5, md: 2 },
          }}
        >
          {copy.items.map((item, i) => (
            <Reveal key={item.title} delay={(i % 3) * 0.08}>
              <Box component="article" sx={cardSx}>
                <Typography component="h3" sx={{ fontSize: { xs: 20, md: 22 }, fontWeight: 500, lineHeight: 1.25, letterSpacing: '-0.01em' }}>
                  {item.title}
                </Typography>
                <Typography sx={{ fontSize: 14, lineHeight: 1.65, color: colors.muted }}>{item.text}</Typography>
                <Box component="ul" aria-label={copy.deliverablesLabel} sx={{ m: 0, p: 0, mt: 'auto', pt: 1, listStyle: 'none', display: 'grid', gap: 0.75 }}>
                  {item.deliverables.map((d) => (
                    <Box
                      component="li"
                      key={d}
                      sx={{
                        position: 'relative',
                        pl: 2.25,
                        fontSize: 13,
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
                      {d}
                    </Box>
                  ))}
                </Box>
              </Box>
            </Reveal>
          ))}
        </Box>

        <Box sx={{ mt: { xs: 7, md: 9 } }}>
          <Reveal>
            <Typography component="h3" sx={{ fontSize: { xs: 28, md: 34 }, fontWeight: 400, letterSpacing: '-0.02em', lineHeight: 1.1, mb: { xs: 3, md: 4 } }}>
              {copy.process.title}
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
              <Box component="li" key={step.title}>
                <Reveal delay={i * 0.06}>
                  <Box sx={{ ...cardSx, gap: 1.25 }}>
                    <Typography aria-hidden sx={{ fontSize: 13, letterSpacing: '0.2em', color: colors.gold }}>
                      {String(i + 1).padStart(2, '0')}
                    </Typography>
                    <Typography component="h4" sx={{ fontSize: 17, fontWeight: 500, lineHeight: 1.3 }}>
                      {step.title}
                    </Typography>
                    <Typography sx={{ fontSize: 13, lineHeight: 1.6, color: colors.muted }}>{step.text}</Typography>
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
