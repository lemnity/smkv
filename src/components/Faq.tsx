import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import Add from '@mui/icons-material/Add'
import { colors, contentSx, sectionTitleSx } from '../theme'
import { useLang } from '../i18n'
import { Reveal } from './effects'

export default function Faq() {
  const { faq: copy } = useLang().t

  return (
    <Box component="section" id="faq" aria-labelledby="faq-title">
      <Box sx={{ ...contentSx, pt: { xs: 8, md: 10 }, pb: { xs: 8, md: 10 } }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 2fr' },
            gap: { xs: 4, md: 6 },
            alignItems: 'start',
          }}
        >
          <Reveal>
            <Typography id="faq-title" component="h2" sx={sectionTitleSx}>
              {copy.title}
            </Typography>
          </Reveal>
          <Reveal delay={0.1}>
            <Box>
              {copy.items.map((item, i) => (
                <Accordion
                  key={item.q}
                  disableGutters
                  elevation={0}
                  square
                  slotProps={{ transition: { unmountOnExit: false }, region: { id: `faq-a${i}`, 'aria-labelledby': `faq-q${i}` } }}
                  sx={{
                    bgcolor: 'transparent',
                    backgroundImage: 'none',
                    color: colors.text,
                    borderBottom: `1px solid ${colors.line}`,
                    '&::before': { display: 'none' },
                    '&:first-of-type': { borderTop: `1px solid ${colors.line}` },
                    '& .MuiAccordionSummary-expandIconWrapper': { color: colors.gold },
                    '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': { transform: 'rotate(135deg)' },
                    '&:hover .MuiAccordionSummary-content .MuiTypography-root': { color: colors.goldLight },
                  }}
                >
                  <AccordionSummary
                    id={`faq-q${i}`}
                    aria-controls={`faq-a${i}`}
                    expandIcon={<Add />}
                    sx={{ px: 0, py: { xs: 0.5, md: 1 }, '& .MuiAccordionSummary-content': { my: 1.5 } }}
                  >
                    <Typography component="span" sx={{ display: 'block', fontSize: { xs: 17, md: 20 }, fontWeight: 500, lineHeight: 1.3, transition: 'color .3s' }}>
                      {item.q}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ px: 0, pt: 0, pb: 3, maxWidth: 720 }}>
                    <Typography sx={{ fontSize: 15, lineHeight: 1.7, color: colors.muted }}>{item.a}</Typography>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>
          </Reveal>
        </Box>
      </Box>
    </Box>
  )
}
