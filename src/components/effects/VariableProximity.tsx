import { useEffect, useRef } from 'react'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useReducedMotion } from 'motion/react'

/*
 * Letters swell as the pointer gets close — after React Bits "Variable Proximity"
 * (https://reactbits.dev/text-animations/variable-proximity). The original drives
 * a variable font's weight axis; Gilroy ships as static weights, so the extra
 * weight is a text stroke that grows with proximity. It thickens the glyph
 * without changing its advance width, so the line never reflows or jitters.
 */

type Props = {
  text: string
  /** Stroke colour (defaults to the text colour). Needed for gradient-clipped text. */
  strokeColor?: string
  /** Influence radius in multiples of the font size. */
  radius?: number
  /** Extra weight at the pointer, in em of stroke width. */
  maxStroke?: number
}

export default function VariableProximity({ text, strokeColor = 'currentColor', radius = 1.6, maxStroke = 0.035 }: Props) {
  const lettersRef = useRef<(HTMLSpanElement | null)[]>([])
  const reduce = useReducedMotion()
  const finePointer = useMediaQuery('(pointer: fine)', { noSsr: true })
  const active = !reduce && finePointer

  useEffect(() => {
    const letters = lettersRef.current.filter((el): el is HTMLSpanElement => !!el)
    if (!active || letters.length === 0) return
    let frame = 0
    let pointer: { x: number; y: number } | null = null

    const paint = () => {
      frame = 0
      const fontSize = parseFloat(getComputedStyle(letters[0]).fontSize) || 100
      const reach = fontSize * radius
      for (const el of letters) {
        let w = 0
        if (pointer) {
          const r = el.getBoundingClientRect()
          const d = Math.hypot(pointer.x - (r.left + r.width / 2), pointer.y - (r.top + r.height / 2))
          const t = Math.max(0, 1 - d / reach)
          w = maxStroke * t * t * (3 - 2 * t) // smoothstep falloff
        }
        el.style.webkitTextStrokeWidth = w > 0.0005 ? `${w.toFixed(4)}em` : '0'
      }
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(paint)
    }
    const onMove = (e: PointerEvent) => {
      pointer = { x: e.clientX, y: e.clientY }
      schedule()
    }
    const onLeave = () => {
      pointer = null
      schedule()
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    document.documentElement.addEventListener('pointerleave', onLeave)
    window.addEventListener('scroll', schedule, { passive: true })
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('pointermove', onMove)
      document.documentElement.removeEventListener('pointerleave', onLeave)
      window.removeEventListener('scroll', schedule)
      letters.forEach((el) => (el.style.webkitTextStrokeWidth = '0'))
    }
  }, [active, text, radius, maxStroke])

  if (!active) return <>{text}</>

  return (
    <>
      {[...text].map((ch, i) => (
        <span
          key={i}
          ref={(el) => {
            lettersRef.current[i] = el
          }}
          style={{
            display: 'inline-block',
            whiteSpace: 'pre',
            WebkitTextStrokeWidth: 0,
            WebkitTextStrokeColor: strokeColor,
            transition: '-webkit-text-stroke-width 0.15s ease-out',
          }}
        >
          {ch}
        </span>
      ))}
    </>
  )
}
