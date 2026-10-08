import type { ReactNode } from 'react'
import { motion } from 'motion/react'

interface Props {
  children: ReactNode
  delay?: number
  y?: number
}

export default function Reveal({ children, delay = 0, y = 32 }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}
