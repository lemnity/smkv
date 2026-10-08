import { createTheme } from '@mui/material/styles'

export const colors = {
  bg: '#0a0908',
  surface: '#121110',
  text: '#f4f1ec',
  muted: '#8e8a84',
  gold: '#c9a173',
  goldLight: '#e6c89c',
  goldDark: '#8a6a45',
  line: 'rgba(255,255,255,0.09)',
  /** Muted dark text used by the About quote. */
  quote: '#6f6b66',
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

/**
 * Layout breakpoint rule: everything switches between mobile and desktop at MUI `md` (900px).
 * Below md: mobile header (menu icon, no center nav), 20px padding, stacked footer.
 */
export const HEADER_HEIGHT = { xs: 72, md: 88 } as const

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

/** Round outlined icon button (44px). Apply via `sx={outlinedIconButtonSx}` on an IconButton. */
export const outlinedIconButtonSx = {
  width: 44,
  height: 44,
  border: `1px solid ${colors.line}`,
  borderRadius: '50%',
  color: colors.text,
  transition: 'all .3s ease',
  '&:hover': {
    borderColor: colors.gold,
    boxShadow: '0 0 24px rgba(201,161,115,0.35)',
    background: 'transparent',
  },
  '&:focus-visible, &.Mui-focusVisible': {
    borderColor: colors.gold,
    boxShadow: '0 0 24px rgba(201,161,115,0.35)',
    outline: `2px solid ${colors.gold}`,
    outlineOffset: '3px',
  },
} as const

/** Section H2 (Projects / About). */
export const sectionTitleSx = {
  fontSize: { xs: 38, sm: 46, md: 46, lg: 56 },
  fontWeight: 400,
  letterSpacing: '-0.025em',
  lineHeight: 1.05,
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
    // Only Onest 400/500/600 are loaded; keep MUI's light/bold weights within that range.
    fontWeightLight: 400,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 600,
    button: { textTransform: 'none', fontWeight: 500 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        html: { '@media (prefers-reduced-motion: no-preference)': { scrollBehavior: 'smooth' } },
        // Keep anchor targets clear of the fixed header (+1px bottom border; md = 900px).
        '[id]': {
          scrollMarginTop: HEADER_HEIGHT.xs + 1,
          '@media (min-width: 900px)': { scrollMarginTop: HEADER_HEIGHT.md + 1 },
        },
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
