import { feedbackEndpoint, feedbackFallbackEmail, feedbackSubject, feedbackTimeoutMs } from '../../data/contact-form'
import type { Content, Lang } from '../../data/content'

export interface FeedbackValues {
  name: string
  contact: string
  message: string
  /** Honeypot: real people never see or fill it. */
  honey: string
}

export type FieldName = 'name' | 'contact' | 'message'
export type ErrorKey = Exclude<keyof Content['feedback']['errors'], 'summary'>
/** Error *keys* (not text) so messages follow a language switch while the dialog is open. */
export type FieldErrors = Partial<Record<FieldName, ErrorKey>>
export type FailureKind = 'server' | 'timeout' | 'network'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const TG_HANDLE_RE = /^@?[a-zA-Z0-9_]{5,32}$/
const TG_LINK_RE = /^(https?:\/\/)?(www\.)?(t\.me|telegram\.me)\/[a-zA-Z0-9_]{5,32}\/?$/i
export const MESSAGE_MIN = 10

export const isEmail = (v: string) => EMAIL_RE.test(v.trim())
export const isContact = (v: string) => {
  const s = v.trim()
  return EMAIL_RE.test(s) || TG_HANDLE_RE.test(s) || TG_LINK_RE.test(s)
}

export const FIELDS: readonly FieldName[] = ['name', 'contact', 'message']

export function validateField(field: FieldName, values: FeedbackValues): ErrorKey | undefined {
  const v = values[field].trim()
  switch (field) {
    case 'name':
      return v ? undefined : 'nameRequired'
    case 'contact':
      if (!v) return 'contactRequired'
      return isContact(v) ? undefined : 'contactInvalid'
    case 'message':
      if (!v) return 'messageRequired'
      return v.length < MESSAGE_MIN ? 'messageShort' : undefined
  }
}

export function validateAll(values: FeedbackValues): FieldErrors {
  const out: FieldErrors = {}
  for (const f of FIELDS) {
    const err = validateField(f, values)
    if (err) out[f] = err
  }
  return out
}

export function buildPayload(values: FeedbackValues, topics: string[], lang: Lang) {
  const name = values.name.trim()
  const contact = values.contact.trim()
  return {
    _subject: feedbackSubject(name),
    _template: 'table',
    _captcha: 'false',
    ...(isEmail(contact) ? { _replyto: contact } : {}),
    name,
    contact,
    topic: topics.join(', ') || '—',
    message: values.message.trim(),
    language: lang.toUpperCase(),
    page: typeof window !== 'undefined' ? window.location.href : '',
  }
}

/** Posts the payload; resolves on success, rejects with a `FailureKind`. */
export async function sendFeedback(payload: Record<string, string>): Promise<void> {
  const controller = new AbortController()
  let timedOut = false
  const timer = window.setTimeout(() => {
    timedOut = true
    controller.abort()
  }, feedbackTimeoutMs)
  try {
    let res: Response
    try {
      res = await fetch(feedbackEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      })
    } catch {
      throw (timedOut ? 'timeout' : 'network') satisfies FailureKind
    }
    let data: { success?: unknown } | null = null
    try {
      data = await res.json()
    } catch {
      data = null
    }
    const ok = res.ok && (data?.success === true || data?.success === 'true')
    if (!ok) throw 'server' satisfies FailureKind
  } finally {
    window.clearTimeout(timer)
  }
}

/** mailto: link with the form content prefilled — fallback when sending fails. */
export function fallbackMailto(values: FeedbackValues, topics: string[], labels: Content['feedback']['mailBody']) {
  const body = [
    `${labels.name}: ${values.name.trim()}`,
    `${labels.contact}: ${values.contact.trim()}`,
    ...(topics.length ? [`${labels.topic}: ${topics.join(', ')}`] : []),
    '',
    `${labels.message}:`,
    values.message.trim(),
  ].join('\n')
  const subject = feedbackSubject(values.name.trim() || '—')
  return `mailto:${feedbackFallbackEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}
