import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Link from '@mui/material/Link'
import Typography from '@mui/material/Typography'
import { colors, contentSx, hoverUnderlineSx, microLabel } from '../theme'
import { useLang } from '../i18n'
import Wordmark from './Wordmark'
import GoldDot from './GoldDot'

export default function Footer() {
  const { footer } = useLang().t
  return (
    <Box component="footer" id="contact">
      <Box
        sx={{
          ...contentSx,
          py: { xs: 5, md: 4 },
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr auto 1fr' },
          alignItems: 'center',
          justifyItems: { xs: 'center', md: 'stretch' },
          rowGap: 3,
        }}
      >
        <Stack direction="row" spacing={2.5} sx={{ justifySelf: { md: 'start' }, alignItems: 'center' }}>
          <Wordmark text={footer.wordmark} size={16} />
          <Typography sx={{ ...microLabel, fontSize: 10, letterSpacing: '0.15em', color: colors.muted }}>
            {footer.copyright}
          </Typography>
        </Stack>

        <Typography sx={{ ...microLabel, fontSize: 10, letterSpacing: '0.3em', color: colors.muted, textAlign: 'center' }}>
          {footer.center}
        </Typography>

        <Stack
          direction="row"
          spacing={{ xs: 3, md: 4 }}
          sx={{ justifySelf: { md: 'end' }, flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }}
        >
          {footer.links.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              {...(l.href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              sx={{
                ...microLabel,
                fontSize: 10,
                letterSpacing: '0.2em',
                color: colors.muted,
                transition: 'color .3s ease',
                '&:hover': { color: colors.text },
                ...hoverUnderlineSx,
              }}
            >
              {l.label}
            </Link>
          ))}
          <GoldDot />
        </Stack>
      </Box>
    </Box>
  )
}
