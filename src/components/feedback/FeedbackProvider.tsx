import { useCallback, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import Dialog from '@mui/material/Dialog'
import Fade from '@mui/material/Fade'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'
import { useReducedMotion } from 'motion/react'
import { colors } from '../../theme'
import { useLang } from '../../i18n'
import type { FeedbackTopicId } from '../../data/content'
import { FeedbackContext, type OpenFeedbackOptions } from './context'
import FeedbackForm from './FeedbackForm'

/**
 * Provides `openFeedback()` to the whole page and renders the single feedback dialog.
 * The dialog is `keepMounted`, so the form draft survives an accidental close; after a successful
 * send the form is reset the next time it opens.
 */
export function FeedbackProvider({ children }: { children: ReactNode }) {
  const { t } = useLang()
  const theme = useTheme()
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'))
  const reduce = useReducedMotion()
  const [open, setOpen] = useState(false)
  const [preset, setPreset] = useState<{ topic?: FeedbackTopicId; n: number }>({ n: 0 })
  const opener = useRef<HTMLElement | null>(null)

  const openFeedback = useCallback((options?: OpenFeedbackOptions) => {
    const active = document.activeElement
    opener.current = options?.returnFocus ?? (active instanceof HTMLElement && active !== document.body ? active : null)
    setPreset((p) => ({ topic: options?.topic, n: p.n + 1 }))
    setOpen(true)
  }, [])

  const close = useCallback(() => setOpen(false), [])

  const onExited = useCallback(() => {
    const el = opener.current
    opener.current = null
    if (el && el.isConnected) el.focus({ preventScroll: true })
  }, [])

  const value = useMemo(() => ({ openFeedback }), [openFeedback])
  const { feedback } = t

  return (
    <FeedbackContext.Provider value={value}>
      {children}
      <Dialog
        open={open}
        onClose={close}
        // Keep the form mounted while closed so a draft survives an accidental close.
        keepMounted
        fullScreen={fullScreen}
        scroll="paper"
        aria-labelledby="feedback-title"
        aria-describedby="feedback-subtitle"
        // Focus is returned manually in onExited (the opener may live inside the closing drawer).
        disableRestoreFocus
        slots={{ transition: Fade }}
        transitionDuration={reduce ? 0 : { enter: 320, exit: 200 }}
        slotProps={{
          transition: { onExited },
          backdrop: { sx: { background: 'rgba(3,3,3,0.82)', backdropFilter: 'blur(8px)' } },
          paper: {
            sx: {
              position: 'relative',
              width: '100%',
              maxWidth: { sm: 560 },
              m: { xs: 0, sm: 2 },
              maxHeight: { sm: 'calc(100% - 32px)' },
              bgcolor: colors.surface,
              backgroundImage: 'none',
              border: { xs: 'none', sm: `1px solid ${colors.line}` },
              borderRadius: { xs: 0, sm: 3 },
              boxShadow: '0 40px 120px rgba(0,0,0,0.6)',
              // Rise-in tied to `open` (a keyframe would only play once: the dialog stays mounted).
              transform: open || reduce ? 'none' : 'translateY(18px) scale(0.985)',
              transition: reduce ? 'none' : 'transform .45s cubic-bezier(0.22,1,0.36,1)',
              '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
            },
          },
        }}
      >
        <FeedbackForm
          open={open}
          preset={preset}
          onClose={close}
          copy={feedback}
        />
      </Dialog>
    </FeedbackContext.Provider>
  )
}
