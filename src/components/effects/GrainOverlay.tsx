import Box from '@mui/material/Box'
import { keyframes } from '@mui/material/styles'

const shift = keyframes`
  0% { transform: translate(0,0); }
  20% { transform: translate(-3%,2%); }
  40% { transform: translate(2%,-3%); }
  60% { transform: translate(-2%,-1%); }
  80% { transform: translate(3%,3%); }
  100% { transform: translate(0,0); }
`

const noise = encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" stitchTiles="stitch"/></filter><rect width="100%" height="100%" filter="url(#n)"/></svg>`,
)

export default function GrainOverlay() {
  return (
    <Box
      aria-hidden
      sx={{
        position: 'fixed',
        inset: '-10%',
        pointerEvents: 'none',
        zIndex: 1500,
        opacity: 0.05,
        backgroundImage: `url("data:image/svg+xml,${noise}")`,
        animation: `${shift} 1.2s steps(6) infinite`,
        '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
      }}
    />
  )
}
