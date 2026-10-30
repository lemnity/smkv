/**
 * Feedback form delivery settings.
 *
 * The form posts JSON to our own backend on the simakoov.ru server (server/feedback/feedback.py,
 * installed with `npm run deploy:feedback`). It emails the letter to thesimakov@gmail.com and
 * duplicates it to Telegram, answering `{ success: true }` when at least one channel delivered it.
 * The URL is absolute so the GitHub Pages copy of the site posts to the same backend (CORS allows it).
 */
export const feedbackEndpoint = 'https://simakoov.ru/api/feedback'

/** Direct address shown as a fallback (mailto link) when sending fails. */
export const feedbackFallbackEmail = 'thesimakov@gmail.com'

/** Abort the request after this many milliseconds. */
export const feedbackTimeoutMs = 25_000

/** Subject of the letter the owner receives (always Russian — it is read by the owner). */
export const feedbackSubject = (name: string) => `Заявка с сайта SIMAKOOV — ${name}`
