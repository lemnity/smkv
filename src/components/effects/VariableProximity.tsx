import { useEffect, useRef } from 'react'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useReducedMotion } from 'motion/react'

/*
 * Letters swell as the pointer gets close — after React Bits "Variable Proximity"
 * (https://reactbits.dev/text-animations/variable-proximity). The original drives
 * a variable font's weight axis; Gilroy ships as static weights, so the extra
 * weight is a text stroke that grows with proximity. It thickens the glyph
 * without changing its advance width, so the line never reflows or jitters.
 *
 * Used for running text too: letters are grouped into no-wrap words so lines
 * still break between words, and an instance only measures its letters while
 * the pointer is near its own box.
 */

type Props = {
  text: string
  /** Stroke colour (defaults to the text colour). Needed for gradient-clipped text. */
  strokeColor?: string
  /** Influence radius in multiples of the font size… */
  radius?: number
  /** …but never smaller than this many pixels, so small text still reacts. */
  minRadiusPx?: number
  /** Extra weight at the pointer, in em of stroke width. */
  maxStroke?: number
}

export default function VariableProximity({
  text,
  strokeColor = 'currentColor',
  radius = 1.6,
  minRadiusPx = 90,
  maxStroke = 0.035,
}: Props) {
  const rootRef = useRef<HTMLSpanElement>(null)
  const lettersRef = useRef<(HTMLSpanElement | null)[]>([])
  const reduce = useReducedMotion()
  const finePointer = useMediaQuery('(pointer: fine)', { noSsr: true })
  const active = !reduce && finePointer

  useEffect(() => {
    const root = rootRef.current
    const letters = lettersRef.current.filter((el): el is HTMLSpanElement => !!el)
    if (!active || !root || letters.length === 0) return
    let frame = 0
    let pointer: { x: number; y: number } | null = null
    let lit = false

    const clear = () => {
      if (!lit) return
      for (const el of letters) el.style.webkitTextStrokeWidth = '0'
      lit = false
    }

    const paint = () => {
      frame = 0
      if (!pointer) return clear()
      const fontSize = parseFloat(getComputedStyle(root).fontSize) || 16
      const reach = Math.max(fontSize * radius, minRadiusPx)
      const box = root.getBoundingClientRect()
      // Pointer nowhere near this text: skip measuring every letter.
      if (
        pointer.x < box.left - reach ||
        pointer.x > box.right + reach ||
        pointer.y < box.top - reach ||
        pointer.y > box.bottom + reach
      ) {
        return clear()
      }
      for (const el of letters) {
        const r = el.getBoundingClientRect()
        const d = Math.hypot(pointer.x - (r.left + r.width / 2), pointer.y - (r.top + r.height / 2))
        const t = Math.max(0, 1 - d / reach)
        const w = maxStroke * t * t * (3 - 2 * t) // smoothstep falloff
        el.style.webkitTextStrokeWidth = w > 0.0005 ? `${w.toFixed(4)}em` : '0'
      }
      lit = true
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
  }, [active, text, radius, minRadiusPx, maxStroke])

  if (!active) return <>{text}</>

  lettersRef.current = []
  let index = 0
  const letterStyle = {
    display: 'inline-block',
    WebkitTextStrokeWidth: 0,
    WebkitTextStrokeColor: strokeColor,
    transition: '-webkit-text-stroke-width 0.15s ease-out',
  } as const

  return (
    <span ref={rootRef}>
      {text.split(/(\s+)/).map((part, wi) => {
        if (!part) return null
        if (/^\s+$/.test(part)) return part
        return (
          <span key={wi} style={{ display: 'inline-block', whiteSpace: 'nowrap' }}>
            {[...part].map((ch) => {
              const i = index++
              return (
                <span
                  key={i}
                  ref={(el) => {
                    lettersRef.current[i] = el
                  }}
                  style={letterStyle}
                >
                  {ch}
                </span>
              )
            })}
          </span>
        )
      })}
    </span>
  )
}
