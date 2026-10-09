import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import { useCallback, useState } from 'react'
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
import About from './components/About'
import Loader from './components/Loader'
import { IntroContext } from './components/intro'
import { LANG_FADE, LanguageProvider, useLang } from './i18n'
import { CustomCursor, GrainOverlay, ScrollProgress } from './components/effects'
import { FeedbackProvider } from './components/feedback/FeedbackProvider'

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
          <SectionDivider />
          <Services />
          <SectionDivider />
          <Projects />
          <SectionDivider />
          <Gallery />
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

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LanguageProvider>
        <MotionConfig reducedMotion="user">
          <FeedbackProvider>
            <Page />
          </FeedbackProvider>
        </MotionConfig>
      </LanguageProvider>
    </ThemeProvider>
  )
}
