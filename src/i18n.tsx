import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { useReducedMotion } from 'motion/react'
import { LANGS, content, type Content, type Lang } from './data/content'

const STORAGE_KEY = 'lang'
/** Duration (s) of each half of the content crossfade on language change. */
export const LANG_FADE = 0.18

interface LangContextValue {
  lang: Lang
  setLang: (lang: Lang) => void
  /** Current dictionary. */
  t: Content
  /** `true` during the first half of the crossfade (content fading out before the swap). */
  fading: boolean
}

const LangContext = createContext<LangContextValue | null>(null)

const isLang = (v: unknown): v is Lang => typeof v === 'string' && (LANGS as readonly string[]).includes(v)

function detectLang(): Lang {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (isLang(saved)) return saved
  } catch {
    // storage unavailable (private mode etc.)
  }
  const nav = typeof navigator !== 'undefined' ? navigator.language || '' : ''
  return nav.toLowerCase().startsWith('ru') ? 'ru' : 'en'
}

function setMeta(selector: string, value: string) {
  document.querySelector(selector)?.setAttribute('content', value)
}

function applyDocument(lang: Lang) {
  const { meta } = content[lang]
  document.documentElement.lang = lang
  document.title = meta.title
  setMeta('meta[name="description"]', meta.description)
  setMeta('meta[property="og:title"]', meta.title)
  setMeta('meta[property="og:description"]', meta.ogDescription)
  setMeta('meta[property="og:locale"]', meta.ogLocale)
  setMeta('meta[property="og:locale:alternate"]', lang === 'ru' ? 'en_US' : 'ru_RU')
  // canonical and og:url stay fixed on https://simakoov.ru/ (set in index.html)
  setMeta('meta[property="og:image:alt"]', meta.ogImageAlt)
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(detectLang)
  const [fading, setFading] = useState(false)
  const reduce = useReducedMotion()
  const timer = useRef<number | undefined>(undefined)

  useEffect(() => {
    applyDocument(lang)
  }, [lang])

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const setLang = useCallback(
    (next: Lang) => {
      window.clearTimeout(timer.current)
      // Persist only an explicit choice, so first-visit detection keeps following the browser locale.
      try {
        localStorage.setItem(STORAGE_KEY, next)
      } catch {
        // ignore
      }
      if (next === lang) {
        setFading(false)
        return
      }
      if (reduce) {
        setLangState(next)
        return
      }
      // Fade content out, swap the copy, fade back in.
      setFading(true)
      timer.current = window.setTimeout(() => {
        setLangState(next)
        setFading(false)
      }, LANG_FADE * 1000)
    },
    [lang, reduce],
  )

  const value = useMemo(() => ({ lang, setLang, t: content[lang], fading }), [lang, setLang, fading])
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>
}

export function useLang(): LangContextValue {
  const ctx = useContext(LangContext)
  if (!ctx) throw new Error('useLang must be used inside <LanguageProvider>')
  return ctx
}
