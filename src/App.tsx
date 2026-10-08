import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import { MotionConfig } from 'motion/react'
import theme, { contentSx } from './theme'
import Header from './components/Header'
import Footer from './components/Footer'
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
          {/* Hero — Task 2 */}
          <Box id="home" sx={{ minHeight: '100vh' }} />
          <SectionDivider />
          {/* Projects — Task 3 */}
          <Box id="work" component="section" sx={{ minHeight: 320 }} />
          <SectionDivider />
          {/* About — Task 3 */}
          <Box id="about" component="section" sx={{ minHeight: 320 }} />
          <SectionDivider />
        </Box>
        <Footer />
        <GrainOverlay />
        <CustomCursor />
      </MotionConfig>
    </ThemeProvider>
  )
}
