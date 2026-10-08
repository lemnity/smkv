import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import { useCallback, useState } from 'react'
import { MotionConfig } from 'motion/react'
import theme, { contentSx } from './theme'
import Header from './components/Header'
import Footer from './components/Footer'
import Hero from './components/Hero'
import Projects from './components/Projects'
import About from './components/About'
import Loader from './components/Loader'
import { IntroContext } from './components/intro'
import { loader } from './data/content'
import { CustomCursor, GrainOverlay, ScrollProgress } from './components/effects'

function SectionDivider() {
  return (
    <Box sx={contentSx}>
      <Divider />
    </Box>
  )
}

export default function App() {
  const [introReady, setIntroReady] = useState(false)
  const handleLoaderDone = useCallback(() => setIntroReady(true), [])

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <MotionConfig reducedMotion="user">
        <IntroContext.Provider value={introReady}>
          <ScrollProgress />
          <Header />
          <Box component="main">
            <Hero />
            <SectionDivider />
            <Projects />
            <SectionDivider />
            <About />
            <SectionDivider />
          </Box>
          <Footer />
          <GrainOverlay />
          <CustomCursor />
          <Loader label={loader.label} onDone={handleLoaderDone} />
        </IntroContext.Provider>
      </MotionConfig>
    </ThemeProvider>
  )
}
