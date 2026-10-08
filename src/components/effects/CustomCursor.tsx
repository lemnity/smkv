import { useEffect, useState } from 'react'
import { motion, useMotionValue, useReducedMotion, useSpring } from 'motion/react'
import useMediaQuery from '@mui/material/useMediaQuery'

export default function CustomCursor() {
  const reduce = useReducedMotion()
  const coarse = useMediaQuery('(pointer: coarse)', { noSsr: true })
  const [hover, setHover] = useState(false)
  const [visible, setVisible] = useState(false)
  const x = useMotionValue(-100)
  const y = useMotionValue(-100)
  const rx = useSpring(x, { stiffness: 180, damping: 22, mass: 0.5 })
  const ry = useSpring(y, { stiffness: 180, damping: 22, mass: 0.5 })

  useEffect(() => {
    if (reduce || coarse) return
    const move = (e: PointerEvent) => {
      x.set(e.clientX)
      y.set(e.clientY)
      setVisible(true)
      setHover(!!(e.target as Element | null)?.closest?.('a, button'))
    }
    const leave = () => setVisible(false)
    window.addEventListener('pointermove', move)
    document.documentElement.addEventListener('pointerleave', leave)
    return () => {
      window.removeEventListener('pointermove', move)
      document.documentElement.removeEventListener('pointerleave', leave)
    }
  }, [reduce, coarse, x, y])

  if (reduce || coarse) return null

  return (
    <>
      <motion.div
        aria-hidden
        style={{
          x, y, translateX: '-50%', translateY: '-50%',
          position: 'fixed', top: 0, left: 0, width: 8, height: 8, borderRadius: '50%',
          background: '#c9a173', pointerEvents: 'none', zIndex: 2000,
        }}
        animate={{ opacity: visible ? 1 : 0 }}
      />
      <motion.div
        aria-hidden
        style={{
          x: rx, y: ry, translateX: '-50%', translateY: '-50%',
          position: 'fixed', top: 0, left: 0, width: 36, height: 36, borderRadius: '50%',
          border: '1px solid rgba(201,161,115,0.7)', pointerEvents: 'none', zIndex: 2000,
        }}
        animate={{ opacity: visible ? 1 : 0, scale: hover ? 1.8 : 1 }}
      />
    </>
  )
}
