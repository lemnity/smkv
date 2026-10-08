import { useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import ButtonBase from '@mui/material/ButtonBase'
import ArrowForward from '@mui/icons-material/ArrowForward'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { colors, fonts } from '../theme'
import { useLang } from '../i18n'
import { useFeedback } from './feedback/context'
import { useIntroReady } from './intro'

/** Show once the hero is mostly scrolled past… */
const SHOW_AFTER = 0.6 // × viewport height
/** …and hide again near the end of the page so it never covers the footer. */
const HIDE_BEFORE_END = 160 // px

/** "Order a project" pill pinned to the bottom of the screen while scrolling. */
export default function FloatingCta() {
  const { t } = useLang()
  const { openFeedback } = useFeedback()
  const ready = useIntroReady()
  const reduce = useReducedMotion()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      const y = window.scrollY
      const end = document.documentElement.scrollHeight - window.innerHeight
      setVisible(y > window.innerHeight * SHOW_AFTER && y < end - HIDE_BEFORE_END)
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  return (
    <AnimatePresence>
      {ready && visible && (
        <Box
          key="floating-cta"
          component={motion.div}
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 80 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: 80 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          sx={{
            position: 'fixed',
            left: 0,
            right: 0,
            bottom: 'calc(env(safe-area-inset-bottom, 0px) + 20px)',
            display: 'flex',
            justifyContent: 'center',
            pointerEvents: 'none',
            // Above page content, below the header (1100), drawer and dialogs.
            zIndex: 1050,
          }}
        >
          <ButtonBase
            onClick={() => openFeedback()}
            sx={{
              pointerEvents: 'auto',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1.25,
              height: { xs: 52, md: 56 },
              pl: { xs: 3, md: 3.5 },
              pr: { xs: 1, md: 1.25 },
              borderRadius: 999,
              bgcolor: colors.gold,
              color: colors.bg,
              fontFamily: fonts.sans,
              fontSize: { xs: 15, md: 16 },
              fontWeight: 600,
              letterSpacing: '-0.01em',
              boxShadow: '0 12px 40px rgba(0,0,0,0.55), 0 0 0 1px rgba(196,238,24,0.35)',
              transition: 'transform .3s cubic-bezier(0.22,1,0.36,1), box-shadow .3s',
              '& .cta-arrow': {
                display: 'grid',
                placeItems: 'center',
                width: { xs: 36, md: 40 },
                height: { xs: 36, md: 40 },
                borderRadius: '50%',
                bgcolor: colors.bg,
                color: colors.gold,
                transition: 'transform .35s cubic-bezier(0.22,1,0.36,1)',
              },
              '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 16px 48px rgba(0,0,0,0.6), 0 0 24px rgba(196,238,24,0.35)' },
              '&:hover .cta-arrow': { transform: 'rotate(-45deg)' },
              '&.Mui-focusVisible': { outline: `2px solid ${colors.goldLight}`, outlineOffset: 4 },
            }}
          >
            {t.floatingCta.label}
            <Box component="span" className="cta-arrow" aria-hidden>
              <ArrowForward sx={{ fontSize: 18 }} />
            </Box>
          </ButtonBase>
        </Box>
      )}
    </AnimatePresence>
  )
}
