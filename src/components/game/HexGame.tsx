import { useEffect, useRef } from 'react'
import ButtonBase from '@mui/material/ButtonBase'
import type { SxProps, Theme } from '@mui/material/styles'
import { colors } from '../../theme'
import { useLang } from '../../i18n'
import { startHexPop, type HexPop } from './hexPop'

/**
 * Live "Pop the hexes" mini-game (engine in hexPop.ts). Pauses off-screen, plays by mouse,
 * finger or Enter/Space, and shows a single still frame under reduced motion.
 */
export default function HexGame({ sx }: { sx?: SxProps<Theme> }) {
  const { t } = useLang()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gameRef = useRef<HexPop | null>(null)
  const copy = t.services.game

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const game = startHexPop(canvas, { still, text: { hint: copy.hint, praise: copy.praise } })
    gameRef.current = game
    const io = new IntersectionObserver(([entry]) => game.setActive(entry.isIntersecting))
    io.observe(canvas)
    return () => {
      io.disconnect()
      game.destroy()
      gameRef.current = null
    }
  }, [copy])

  return (
    <ButtonBase
      aria-label={copy.aria}
      onPointerDown={(e) => {
        e.preventDefault()
        const box = canvasRef.current?.getBoundingClientRect()
        if (box) gameRef.current?.tap(e.clientX - box.left, e.clientY - box.top)
      }}
      onKeyDown={(e) => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault()
          gameRef.current?.tap()
        }
      }}
      disableRipple
      sx={[
        {
          position: 'relative',
          display: 'block',
          width: '100%',
          aspectRatio: '16 / 10',
          overflow: 'hidden',
          borderRadius: 1,
          border: `1px solid ${colors.line}`,
          touchAction: 'manipulation',
          cursor: 'pointer',
          '&.Mui-focusVisible': { outline: `2px solid ${colors.goldLight}`, outlineOffset: 2 },
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, display: 'block', width: '100%', height: '100%' }} />
    </ButtonBase>
  )
}
