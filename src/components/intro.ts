import { createContext, useContext } from 'react'

/**
 * `false` while the preloader covers the page. Entrance animations hold their
 * `initial` state until this flips, so they play once the page is revealed.
 * Defaults to `true` so components work without a loader.
 */
export const IntroContext = createContext(true)

export const useIntroReady = () => useContext(IntroContext)
