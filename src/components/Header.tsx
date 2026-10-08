import { useState } from 'react'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Link from '@mui/material/Link'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Drawer from '@mui/material/Drawer'
import Divider from '@mui/material/Divider'
import useMediaQuery from '@mui/material/useMediaQuery'
import MoreHoriz from '@mui/icons-material/MoreHoriz'
import Menu from '@mui/icons-material/Menu'
import Close from '@mui/icons-material/Close'
import Telegram from '@mui/icons-material/Telegram'
import Instagram from '@mui/icons-material/Instagram'
import MailOutline from '@mui/icons-material/MailOutlineOutlined'
import { motion, useMotionValueEvent, useScroll } from 'motion/react'
import { colors, contentSx, hoverUnderlineSx, microLabel } from '../theme'
import { contacts, header, nav } from '../data/content'
import { scrollToHash } from '../utils/scrollTo'
import Wordmark from './Wordmark'

const MOBILE = '@media (max-width: 767.98px)'
const ease = [0.22, 1, 0.36, 1] as const

const drawerContacts = [
  { label: 'Telegram', href: contacts.telegram, Icon: Telegram, external: true },
  { label: 'Instagram', href: contacts.instagram, Icon: Instagram, external: true },
  { label: 'Email', href: `mailto:${contacts.email}`, Icon: MailOutline, external: false },
]

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const isMobile = useMediaQuery('(max-width: 767.98px)')
  const { scrollY } = useScroll()

  useMotionValueEvent(scrollY, 'change', (v) => setScrolled(v > 40))

  const go = (href: string) => (e: React.MouseEvent) => {
    e.preventDefault()
    setOpen(false)
    scrollToHash(href)
  }

  return (
    <>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          bgcolor: scrolled ? 'rgba(10,9,8,0.72)' : 'transparent',
          backgroundImage: 'none',
          backdropFilter: scrolled ? 'blur(14px)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(14px)' : 'none',
          borderBottom: '1px solid',
          borderColor: scrolled ? colors.line : 'transparent',
          transition: 'background-color .4s ease, border-color .4s ease, backdrop-filter .4s ease',
          color: colors.text,
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: -24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease }}
        >
          <Toolbar
            disableGutters
            sx={{
              ...contentSx,
              minHeight: { xs: 72, md: 88 },
              display: 'grid',
              gridTemplateColumns: '1fr auto 1fr',
              alignItems: 'center',
              [MOBILE]: { gridTemplateColumns: '1fr auto' },
            }}
          >
            <Link href="#home" onClick={go('#home')} aria-label="SIMAKOV — наверх" sx={{ justifySelf: 'start' }}>
              <Wordmark text={header.wordmark} />
            </Link>

            <Stack
              component="nav"
              direction="row"
              spacing={{ md: 6, sm: 4 }}
              sx={{ [MOBILE]: { display: 'none' } }}
            >
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={go(item.href)}
                  sx={{ ...microLabel, color: colors.text, ...hoverUnderlineSx, '&:hover': { color: colors.goldLight } }}
                >
                  {item.label}
                </Link>
              ))}
            </Stack>

            <Stack direction="row" spacing={2} sx={{ justifySelf: 'end', alignItems: 'center' }}>
              <IconButton
                variant="outlined"
                aria-label="Открыть меню"
                onClick={() => setOpen(true)}
                sx={{ width: 44, height: 44 }}
              >
                {isMobile ? <Menu fontSize="small" /> : <MoreHoriz fontSize="small" />}
              </IconButton>
              <Box sx={{ [MOBILE]: { display: 'none' } }}>
                {header.tagline.map((line) => (
                  <Typography key={line} sx={{ ...microLabel, fontSize: 10, letterSpacing: '0.2em', lineHeight: 1.6 }}>
                    {line}
                  </Typography>
                ))}
              </Box>
            </Stack>
          </Toolbar>
        </motion.div>
      </AppBar>

      <Drawer
        anchor="right"
        open={open}
        onClose={() => setOpen(false)}
        slotProps={{
          paper: {
            sx: {
              width: { xs: '100%', sm: 420 },
              bgcolor: colors.bg,
              backgroundImage: 'none',
              borderLeft: `1px solid ${colors.line}`,
              p: { xs: '20px', sm: '40px' },
              display: 'flex',
              flexDirection: 'column',
            },
          },
        }}
      >
        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <Wordmark text={header.wordmark} />
          <IconButton variant="outlined" aria-label="Закрыть меню" onClick={() => setOpen(false)} sx={{ width: 44, height: 44 }}>
            <Close fontSize="small" />
          </IconButton>
        </Stack>

        <Stack component="nav" spacing={2} sx={{ mt: { xs: 8, sm: 10 } }}>
          {nav.map((item, i) => (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 + i * 0.08, ease }}
            >
              <Link
                href={item.href}
                onClick={go(item.href)}
                sx={{
                  display: 'inline-block',
                  fontSize: { xs: 36, sm: 44 },
                  fontWeight: 500,
                  letterSpacing: '-0.03em',
                  lineHeight: 1.15,
                  color: colors.text,
                  transition: 'color .3s ease',
                  '&:hover': { color: colors.goldLight },
                  ...hoverUnderlineSx,
                }}
              >
                {item.label}
              </Link>
            </motion.div>
          ))}
        </Stack>

        <Box sx={{ mt: 'auto', pt: 6 }}>
          <Divider sx={{ mb: 3 }} />
          <Typography sx={{ ...microLabel, color: colors.muted, mb: 2 }}>Контакты</Typography>
          <Stack spacing={1.5}>
            {drawerContacts.map(({ label, href, Icon, external }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.35 + i * 0.06, ease }}
              >
                <Link
                  href={href}
                  {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 1.5,
                    color: colors.text,
                    fontSize: 15,
                    '& svg': { color: colors.gold, fontSize: 20 },
                    '&:hover': { color: colors.goldLight },
                  }}
                >
                  <Icon />
                  {label === 'Email' ? contacts.email : label}
                </Link>
              </motion.div>
            ))}
          </Stack>
        </Box>
      </Drawer>
    </>
  )
}
