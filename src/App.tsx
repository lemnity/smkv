import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import { useCallback, useEffect, useState } from 'react'
import { MotionConfig, motion } from 'motion/react'
import theme, { contentSx } from './theme'
import Header from './components/Header'
import Footer from './components/Footer'
import Hero from './components/Hero'
import Services from './components/Services'
import Faq from './components/Faq'
import Projects from './components/Projects'
import Gallery from './components/Gallery'
import Clients from './components/Clients'
import FloatingCta from './components/FloatingCta'
import CasePage from './components/CasePage'
import Manifesto from './components/Manifesto'
import About from './components/About'
import Loader from './components/Loader'
import { IntroContext } from './components/intro'
import { LANG_FADE, LanguageProvider, useLang } from './i18n'
import { CustomCursor, GrainOverlay, ScrollProgress } from './components/effects'
import { FeedbackProvider } from './components/feedback/FeedbackProvider'
import { caseBySlug, caseSlugFromPath, caseTitle } from './data/cases'
import { BASE } from './utils/base'

/** Case study named by the URL (/cases/<slug>/), if this is a case page. */
const caseStudy = caseBySlug(caseSlugFromPath(window.location.pathname.slice(BASE.length)) ?? '')

function SectionDivider() {
  return (
    <Box sx={contentSx}>
      <Divider />
    </Box>
  )
}

/** Page body; crossfades briefly while the language switches (opacity only, no remount). */
function Page() {
  const [introReady, setIntroReady] = useState(false)
  const handleLoaderDone = useCallback(() => setIntroReady(true), [])
  const { t, fading } = useLang()

  // Arriving from a case page with `#work` etc.: the browser jumps before the content settles,
  // so land on the section again once the loader is gone.
  useEffect(() => {
    if (!introReady || !window.location.hash) return
    document.querySelector(window.location.hash)?.scrollIntoView({ behavior: 'instant', block: 'start' })
  }, [introReady])

  return (
    <IntroContext.Provider value={introReady}>
      <ScrollProgress />
      <Header />
      <motion.div
        initial={false}
        animate={{ opacity: fading ? 0 : 1 }}
        transition={{ duration: LANG_FADE, ease: 'easeInOut' }}
      >
        <Box component="main">
          <Hero />
          <Manifesto />
          <SectionDivider />
          <Projects />
          <SectionDivider />
          <Gallery />
          <SectionDivider />
          <Services />
          <SectionDivider />
          <Clients />
          <SectionDivider />
          <About />
          <SectionDivider />
          <Faq />
          <SectionDivider />
        </Box>
        <Footer />
      </motion.div>
      <FloatingCta />
      <GrainOverlay />
      <CustomCursor />
      <Loader label={t.loader.label} onDone={handleLoaderDone} />
    </IntroContext.Provider>
  )
}

/** A case study page: the site header, the case, the footer — no loader. */
function CaseStudyPage({ study }: { study: NonNullable<typeof caseStudy> }) {
  // Runs before LanguageProvider's effect, which then leaves this page's title and meta alone.
  // (Built case pages already have both in their HTML; this covers the dev server.)
  useEffect(() => {
    document.documentElement.dataset.page = 'case'
    document.title = caseTitle(study)
  }, [study])

  return (
    <IntroContext.Provider value={true}>
      <ScrollProgress />
      <Header home={BASE} />
      <CasePage study={study} />
      <Footer />
      <FloatingCta />
      <GrainOverlay />
      <CustomCursor />
    </IntroContext.Provider>
  )
}

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LanguageProvider>
        <MotionConfig reducedMotion="user">
          <FeedbackProvider>
            {caseStudy ? <CaseStudyPage study={caseStudy} /> : <Page />}
          </FeedbackProvider>
        </MotionConfig>
      </LanguageProvider>
    </ThemeProvider>
  )
}
