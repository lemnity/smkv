import { motion, useScroll, useSpring } from 'motion/react'

export default function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 28, mass: 0.3 })
  return (
    <motion.div
      style={{
        scaleX,
        transformOrigin: '0 50%',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 1,
        background: '#c9a173',
        // Above the AppBar (1100), below Drawer/Modal (1200/1300).
        zIndex: 1101,
        pointerEvents: 'none',
      }}
    />
  )
}
