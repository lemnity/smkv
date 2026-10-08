import Box from '@mui/material/Box'
import { colors } from '../theme'

/** "SIMAKOV°" text wordmark with a small gold dot superscript. */
export default function Wordmark({ text, size = 20 }: { text: string; size?: number }) {
  return (
    <Box
      component="span"
      sx={{
        position: 'relative',
        display: 'inline-block',
        fontSize: size,
        fontWeight: 600,
        letterSpacing: '-0.02em',
        lineHeight: 1,
        color: colors.text,
        pr: `${size * 0.35}px`,
      }}
    >
      {text}
      <Box
        component="span"
        aria-hidden
        sx={{
          position: 'absolute',
          top: '-0.1em',
          right: 0,
          width: Math.max(4, size * 0.24),
          height: Math.max(4, size * 0.24),
          borderRadius: '50%',
          border: `1.5px solid ${colors.gold}`,
        }}
      />
    </Box>
  )
}
