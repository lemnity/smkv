import Box from '@mui/material/Box'
import { colors } from '../theme'

export default function GoldDot({ size = 5 }: { size?: number }) {
  return (
    <Box
      component="span"
      aria-hidden
      sx={{ display: 'inline-block', width: size, height: size, borderRadius: '50%', bgcolor: colors.gold, flexShrink: 0 }}
    />
  )
}
