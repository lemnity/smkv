import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Chip from '@mui/material/Chip'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Link from '@mui/material/Link'
import DialogContent from '@mui/material/DialogContent'
import Close from '@mui/icons-material/Close'
import ArrowForward from '@mui/icons-material/ArrowForward'
import CheckCircleOutline from '@mui/icons-material/CheckCircleOutlineOutlined'
import ErrorOutline from '@mui/icons-material/ErrorOutlineOutlined'
import Refresh from '@mui/icons-material/Refresh'
import { visuallyHidden } from '@mui/utils'
import { colors, microLabel, outlinedIconButtonSx } from '../../theme'
import { useLang } from '../../i18n'
import type { Content, FeedbackTopicId } from '../../data/content'
import { feedbackFallbackEmail } from '../../data/contact-form'
import {
  FIELDS,
  buildPayload,
  fallbackMailto,
  sendFeedback,
  validateAll,
  validateField,
  type FailureKind,
  type FeedbackValues,
  type FieldErrors,
  type FieldName,
} from './send'

type Status = 'idle' | 'sending' | 'success' | 'error'

const EMPTY: FeedbackValues = { name: '', contact: '', message: '', honey: '' }

/** Dark-theme standard (underlined) text field. */
const fieldSx = {
  '& .MuiInputLabel-root': { color: colors.muted, fontSize: 15 },
  '& .MuiInputLabel-root.Mui-focused': { color: colors.gold },
  '& .MuiInputLabel-root.Mui-error': { color: 'error.main' },
  '& .MuiInputLabel-asterisk': { color: colors.gold },
  // 16px avoids the iOS zoom-on-focus.
  '& .MuiInputBase-root': { color: colors.text, fontSize: 16, lineHeight: 1.5 },
  '& .MuiInput-root:before': { borderBottomColor: 'rgba(244,241,236,0.22)' },
  '& .MuiInput-root:hover:not(.Mui-disabled, .Mui-error):before': { borderBottomColor: 'rgba(244,241,236,0.5)' },
  '& .MuiInput-root:after': { borderBottomColor: colors.gold },
  '& .MuiInput-root.Mui-error:after': { borderBottomColor: 'error.main' },
  '& .MuiFormHelperText-root': { color: colors.muted, fontSize: 12, mt: 0.75, mx: 0 },
  '& .MuiFormHelperText-root.Mui-error': { color: 'error.main' },
  '& textarea': { resize: 'none' },
} as const

const textLinkSx = {
  color: colors.text,
  textDecoration: 'underline',
  textUnderlineOffset: '4px',
  textDecorationColor: 'rgba(244,241,236,0.5)',
  '&:hover': { color: colors.goldLight },
} as const

interface Props {
  open: boolean
  /** Bumped (`n`) on every `openFeedback()` call; `topic` is preselected. */
  preset: { topic?: FeedbackTopicId; n: number }
  onClose: () => void
  copy: Content['feedback']
}

export default function FeedbackForm({ open, preset, onClose, copy }: Props) {
  const { lang } = useLang()
  const [values, setValues] = useState<FeedbackValues>(EMPTY)
  const [topics, setTopics] = useState<FeedbackTopicId[]>([])
  const [touched, setTouched] = useState<Partial<Record<FieldName, boolean>>>({})
  const [errors, setErrors] = useState<FieldErrors>({})
  const [showSummary, setShowSummary] = useState(false)
  const [status, setStatus] = useState<Status>('idle')
  const [failure, setFailure] = useState<FailureKind>('server')
  const [presetN, setPresetN] = useState(preset.n)
  const sending = useRef(false)
  const inputs = useRef<Partial<Record<FieldName, HTMLInputElement | HTMLTextAreaElement | null>>>({})
  const resultRef = useRef<HTMLDivElement>(null)

  // New open request: start over after a successful send, and preselect the requested topic.
  if (preset.n !== presetN) {
    setPresetN(preset.n)
    if (status === 'success') {
      setValues(EMPTY)
      setTopics(preset.topic ? [preset.topic] : [])
      setTouched({})
      setErrors({})
      setShowSummary(false)
      setStatus('idle')
    } else if (preset.topic && !topics.includes(preset.topic)) {
      setTopics([...topics, preset.topic])
    }
  }

  // Move focus to the result panel so it is announced and Tab continues from there.
  useEffect(() => {
    if (open && (status === 'success' || status === 'error')) resultRef.current?.focus()
  }, [open, status])

  const topicLabels = () => copy.topics.filter((tp) => topics.includes(tp.id)).map((tp) => tp.label)

  const setField = (field: keyof FeedbackValues, value: string) => {
    const next = { ...values, [field]: value }
    setValues(next)
    // Once a field has been checked, re-validate it live so the error clears as soon as it is fixed.
    if (field !== 'honey' && touched[field]) {
      setErrors((e) => ({ ...e, [field]: validateField(field, next) }))
    }
  }

  const onBlur = (field: FieldName) => {
    // Don't nag about an untouched empty field when the visitor just tabs through.
    if (!values[field].trim() && !touched[field]) return
    setTouched((t) => ({ ...t, [field]: true }))
    setErrors((e) => ({ ...e, [field]: validateField(field, values) }))
  }

  const toggleTopic = (id: FeedbackTopicId) =>
    setTopics((list) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]))

  const submit = async (e?: FormEvent) => {
    e?.preventDefault()
    if (sending.current) return
    const errs = validateAll(values)
    setErrors(errs)
    setTouched({ name: true, contact: true, message: true })
    const firstInvalid = FIELDS.find((f) => errs[f])
    if (firstInvalid) {
      setShowSummary(true)
      inputs.current[firstInvalid]?.focus()
      return
    }
    setShowSummary(false)

    // Honeypot filled → most likely a bot: pretend it worked, send nothing.
    if (values.honey.trim()) {
      setStatus('success')
      return
    }

    sending.current = true
    setStatus('sending')
    try {
      await sendFeedback(buildPayload(values, topicLabels(), lang))
      setStatus('success')
    } catch (err) {
      setFailure(err === 'timeout' || err === 'network' ? err : 'server')
      setStatus('error')
    } finally {
      sending.current = false
    }
  }

  const invalidFields = FIELDS.filter((f) => errors[f])
  const fieldLabel: Record<FieldName, string> = {
    name: copy.fields.name,
    contact: copy.fields.contact,
    message: copy.fields.message,
  }
  const isSending = status === 'sending'

  const header = (
    <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
      <Typography sx={{ ...microLabel, fontSize: 10, letterSpacing: '0.3em', color: colors.gold, pt: 1.5 }}>
        {copy.eyebrow}
      </Typography>
      <IconButton aria-label={copy.closeLabel} onClick={onClose} sx={{ ...outlinedIconButtonSx, flexShrink: 0 }}>
        <Close fontSize="small" />
      </IconButton>
    </Stack>
  )

  return (
    <DialogContent
      sx={{
        p: { xs: '20px', sm: '36px 40px 40px' },
        display: 'flex',
        flexDirection: 'column',
        // Content is ≥ the dialog on phones; let it breathe at the bottom above the home indicator.
        pb: { xs: 'calc(28px + env(safe-area-inset-bottom))', sm: '40px' },
      }}
    >
      {header}

      {status === 'success' ? (
        <Box
          ref={resultRef}
          tabIndex={-1}
          role="status"
          sx={{ outline: 'none', py: { xs: 8, sm: 6 }, my: 'auto', textAlign: 'center' }}
        >
          <CheckCircleOutline aria-hidden sx={{ fontSize: 64, color: colors.gold }} />
          <Typography id="feedback-title" component="h2" sx={{ mt: 2.5, fontSize: { xs: 34, sm: 40 }, letterSpacing: '-0.03em', lineHeight: 1.1 }}>
            {copy.success.title}
          </Typography>
          <Typography sx={{ mt: 1.5, fontSize: 16, lineHeight: 1.6, color: 'rgba(244,241,236,0.72)' }}>
            {copy.success.text}
          </Typography>
          <Button variant="outlined" color="primary" onClick={onClose} sx={{ mt: 4.5, px: 4.5, fontSize: 15 }}>
            {copy.success.close}
          </Button>
        </Box>
      ) : status === 'error' ? (
        <Box ref={resultRef} tabIndex={-1} role="alert" sx={{ outline: 'none', py: { xs: 8, sm: 5 }, my: 'auto', textAlign: 'center' }}>
          <ErrorOutline aria-hidden sx={{ fontSize: 56, color: 'error.main' }} />
          <Typography id="feedback-title" component="h2" sx={{ mt: 2.5, fontSize: { xs: 30, sm: 36 }, letterSpacing: '-0.03em', lineHeight: 1.1 }}>
            {copy.failure.title}
          </Typography>
          <Typography sx={{ mt: 1.5, fontSize: 16, lineHeight: 1.6, color: 'rgba(244,241,236,0.72)' }}>
            {copy.failure[failure]}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Refresh />}
            onClick={() => void submit()}
            sx={{ mt: 4, px: 4, fontSize: 15, fontWeight: 600 }}
          >
            {copy.failure.retry}
          </Button>
          <Typography sx={{ mt: 3, fontSize: 14, color: colors.muted }}>
            {copy.failure.fallback}{' '}
            <Link href={fallbackMailto(values, topicLabels(), copy.mailBody)} sx={textLinkSx}>
              {feedbackFallbackEmail}
            </Link>
          </Typography>
        </Box>
      ) : (
        <>
          <Typography
            id="feedback-title"
            component="h2"
            sx={{ mt: { xs: 3, sm: 2.5 }, fontSize: { xs: 38, sm: 44 }, fontWeight: 400, letterSpacing: '-0.035em', lineHeight: 1.05 }}
          >
            {copy.title}
          </Typography>
          <Typography id="feedback-subtitle" sx={{ mt: 1.5, fontSize: 15, lineHeight: 1.6, color: 'rgba(244,241,236,0.72)', maxWidth: 440 }}>
            {copy.subtitle}
          </Typography>

          <Box component="form" noValidate onSubmit={submit} aria-labelledby="feedback-title" sx={{ mt: { xs: 4, sm: 4 } }}>
            <Typography id="feedback-topics" sx={{ ...microLabel, fontSize: 10, letterSpacing: '0.2em', color: colors.muted, mb: 1.5 }}>
              {copy.topicsLabel}
            </Typography>
            <Box role="group" aria-labelledby="feedback-topics" sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {copy.topics.map((tp) => {
                const selected = topics.includes(tp.id)
                return (
                  <Chip
                    key={tp.id}
                    label={tp.label}
                    clickable
                    onClick={() => toggleTopic(tp.id)}
                    aria-pressed={selected}
                    disabled={isSending}
                    sx={{
                      height: 36,
                      borderRadius: 999,
                      border: `1px solid ${selected ? colors.gold : 'rgba(244,241,236,0.2)'}`,
                      bgcolor: selected ? colors.gold : 'transparent',
                      color: selected ? colors.bg : colors.text,
                      fontSize: 14,
                      fontWeight: selected ? 600 : 400,
                      transition: 'all .25s ease',
                      '& .MuiChip-label': { px: 2 },
                      '&:hover': {
                        bgcolor: selected ? colors.goldLight : 'rgba(196,238,24,0.08)',
                        borderColor: colors.gold,
                      },
                      '&.Mui-focusVisible': {
                        bgcolor: selected ? colors.goldLight : 'rgba(196,238,24,0.08)',
                        outline: `2px solid ${colors.gold}`,
                        outlineOffset: '2px',
                      },
                    }}
                  />
                )
              })}
            </Box>

            <Stack spacing={3} sx={{ mt: 3.5 }}>
              <TextField
                variant="standard"
                fullWidth
                required
                name="name"
                id="feedback-name"
                label={copy.fields.name}
                autoComplete="name"
                value={values.name}
                onChange={(e) => setField('name', e.target.value)}
                onBlur={() => onBlur('name')}
                error={!!errors.name}
                helperText={errors.name ? copy.errors[errors.name] : undefined}
                disabled={isSending}
                inputRef={(el: HTMLInputElement | null) => {
                  inputs.current.name = el
                }}
                slotProps={{ htmlInput: { maxLength: 100 } }}
                sx={fieldSx}
              />
              <TextField
                variant="standard"
                fullWidth
                required
                name="contact"
                id="feedback-contact"
                label={copy.fields.contact}
                autoComplete="email"
                value={values.contact}
                onChange={(e) => setField('contact', e.target.value)}
                onBlur={() => onBlur('contact')}
                error={!!errors.contact}
                helperText={errors.contact ? copy.errors[errors.contact] : copy.fields.contactHelper}
                disabled={isSending}
                inputRef={(el: HTMLInputElement | null) => {
                  inputs.current.contact = el
                }}
                slotProps={{ htmlInput: { maxLength: 200, autoCapitalize: 'none', spellCheck: false, inputMode: 'email' } }}
                sx={fieldSx}
              />
              <TextField
                variant="standard"
                fullWidth
                required
                multiline
                minRows={4}
                maxRows={8}
                name="message"
                id="feedback-message"
                label={copy.fields.message}
                value={values.message}
                onChange={(e) => setField('message', e.target.value)}
                onBlur={() => onBlur('message')}
                error={!!errors.message}
                helperText={errors.message ? copy.errors[errors.message] : copy.fields.messageHelper}
                disabled={isSending}
                inputRef={(el: HTMLTextAreaElement | null) => {
                  inputs.current.message = el
                }}
                slotProps={{ htmlInput: { maxLength: 4000 } }}
                sx={fieldSx}
              />
            </Stack>

            {/* Honeypot: hidden from people and assistive tech; bots tend to fill every field. */}
            <Box aria-hidden sx={{ ...visuallyHidden, left: '-10000px' }}>
              <label htmlFor="feedback-honey">{copy.fields.honeypot}</label>
              <input
                id="feedback-honey"
                name="_honey"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={values.honey}
                onChange={(e) => setField('honey', e.target.value)}
              />
            </Box>

            {showSummary && invalidFields.length > 0 && (
              <Typography role="alert" sx={{ mt: 3, fontSize: 14, color: 'error.main' }}>
                {copy.errors.summary} {invalidFields.map((f) => fieldLabel[f]).join(', ')}
              </Typography>
            )}

            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              sx={{ mt: 4, alignItems: { xs: 'stretch', sm: 'center' }, gap: { xs: 2, sm: 3 } }}
            >
              <Button
                type="submit"
                variant="contained"
                color="primary"
                loading={isSending}
                loadingPosition="end"
                endIcon={<ArrowForward />}
                sx={{
                  flexShrink: 0,
                  px: 4,
                  py: 1.75,
                  fontSize: 15,
                  fontWeight: 600,
                  color: colors.bg,
                  '&:hover': { bgcolor: colors.goldLight },
                  '&.Mui-focusVisible': { outline: `2px solid ${colors.gold}`, outlineOffset: '3px' },
                  '&.Mui-disabled, &.MuiButton-loading': { bgcolor: colors.goldDark, color: colors.bg },
                  '& .MuiButton-loadingIndicator': { color: colors.bg },
                }}
              >
                {isSending ? copy.sending : copy.submit}
              </Button>
              <Typography sx={{ fontSize: 12, lineHeight: 1.5, color: colors.muted, maxWidth: { sm: 260 } }}>
                {copy.consent}
              </Typography>
            </Stack>
            <Box component="span" aria-live="polite" sx={visuallyHidden}>
              {isSending ? copy.sending : ''}
            </Box>
          </Box>
        </>
      )}
    </DialogContent>
  )
}
