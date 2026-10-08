/** Smoothly scrolls to an in-page anchor (e.g. `#work`), respecting reduced motion. */
export function scrollToHash(hash: string) {
  const el = document.querySelector(hash)
  if (!el) return
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
  history.replaceState(null, '', hash)
}
