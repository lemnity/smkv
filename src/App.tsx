import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import { MotionConfig } from 'motion/react'
import theme, { contentSx } from './theme'
import Header from './components/Header'
import Footer from './components/Footer'
import Hero from './components/Hero'
import Projects from './components/Projects'
import About from './components/About'
import { CustomCursor, GrainOverlay, ScrollProgress } from './components/effects'

function SectionDivider() {
  return (
    <Box sx={contentSx}>
      <Divider />
    </Box>
  )
}

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <MotionConfig reducedMotion="user">
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
      </MotionConfig>
    </ThemeProvider>
  )
}
