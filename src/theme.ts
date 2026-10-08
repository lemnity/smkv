import { createTheme } from '@mui/material/styles'

declare module '@mui/material/IconButton' {
  interface IconButtonOwnProps {
    variant?: 'outlined'
  }
}

export const colors = {
  bg: '#0a0908',
  surface: '#121110',
  text: '#f4f1ec',
  muted: '#8e8a84',
  gold: '#c9a173',
  goldLight: '#e6c89c',
  goldDark: '#8a6a45',
  line: 'rgba(255,255,255,0.09)',
}

export const fonts = {
  sans: '"Onest", system-ui, sans-serif',
  serif: '"Cormorant Garamond", Georgia, serif',
  script: '"Great Vibes", cursive',
}

export const microLabel = {
  fontSize: 11,
  letterSpacing: '0.25em',
  textTransform: 'uppercase' as const,
  fontWeight: 500,
}

/** Shared content-width container: max 1440px, 48px side padding desktop / 20px mobile. */
export const contentSx = {
  width: '100%',
  maxWidth: 1440,
  mx: 'auto',
  px: { xs: '20px', md: '48px' },
} as const

/** Animated gold underline on hover (scaleX from left). Apply to an inline/relative link. */
export const hoverUnderlineSx = {
  position: 'relative',
  '&::after': {
    content: '""',
    position: 'absolute',
    left: 0,
    bottom: -4,
    width: '100%',
    height: '1px',
    background: colors.gold,
    transform: 'scaleX(0)',
    transformOrigin: 'left center',
    transition: 'transform .4s cubic-bezier(0.22,1,0.36,1)',
  },
  '&:hover::after, &:focus-visible::after': { transform: 'scaleX(1)' },
} as const

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: colors.gold, light: colors.goldLight, dark: colors.goldDark },
    background: { default: colors.bg, paper: colors.surface },
    text: { primary: colors.text, secondary: colors.muted },
    divider: colors.line,
  },
  shape: { borderRadius: 4 },
  typography: {
    fontFamily: fonts.sans,
    button: { textTransform: 'none', fontWeight: 500 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        html: { scrollBehavior: 'smooth' },
        body: { backgroundColor: colors.bg, overflowX: 'hidden' },
        '::selection': { background: colors.gold, color: colors.bg },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: 999, padding: '12px 28px', transition: 'all .3s ease' },
      },
      variants: [
        {
          props: { variant: 'outlined', color: 'primary' },
          style: {
            borderColor: colors.gold,
            color: colors.text,
            '&:hover': { borderColor: colors.goldLight, background: 'rgba(201,161,115,0.1)' },
          },
        },
      ],
    },
    MuiIconButton: {
      variants: [
        {
          props: { variant: 'outlined' },
          style: {
            border: `1px solid ${colors.line}`,
            borderRadius: '50%',
            color: colors.text,
            transition: 'all .3s ease',
            '&:hover': {
              borderColor: colors.gold,
              boxShadow: '0 0 24px rgba(201,161,115,0.35)',
              background: 'transparent',
            },
          },
        },
      ],
    },
    MuiChip: {
      styleOverrides: {
        root: { background: 'transparent', border: 'none', color: colors.muted, fontSize: 11 },
        label: { paddingLeft: 0, paddingRight: 8 },
      },
    },
    MuiDivider: { styleOverrides: { root: { borderColor: colors.line } } },
    MuiLink: { defaultProps: { underline: 'none' } },
  },
})

export default theme
