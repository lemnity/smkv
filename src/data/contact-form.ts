/**
 * Feedback form delivery settings (the site is static, so the form posts to FormSubmit).
 *
 * FormSubmit (https://formsubmit.co) forwards AJAX submissions to the email in the URL — no account or keys.
 * - On the FIRST submission FormSubmit sends an activation email to that address; nothing is delivered
 *   until the owner clicks "Activate Form" in it (one time only).
 * - After activation FormSubmit also shows a random alias (e.g. `https://formsubmit.co/ajax/3f2c…`).
 *   Replace the email in `feedbackEndpoint` with that alias to hide the address from the page source.
 * - Another provider (Formspree, Web3Forms, a custom backend…) can be plugged in by changing this URL;
 *   it must accept a JSON POST and answer with JSON `{ success: true | "true" }` — otherwise adjust
 *   `sendFeedback` in src/components/feedback/send.ts.
 */
export const feedbackEndpoint = 'https://formsubmit.co/ajax/thesimakov@gmail.com'

/** Direct address shown as a fallback (mailto link) when sending fails. */
export const feedbackFallbackEmail = 'thesimakov@gmail.com'

/** Abort the request after this many milliseconds. */
export const feedbackTimeoutMs = 15_000

/** Subject of the letter the owner receives (always Russian — it is read by the owner). */
export const feedbackSubject = (name: string) => `Заявка с сайта SIMAKOOV — ${name}`
