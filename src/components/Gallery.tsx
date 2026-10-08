import { useCallback, useEffect, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import ButtonBase from '@mui/material/ButtonBase'
import Dialog from '@mui/material/Dialog'
import IconButton from '@mui/material/IconButton'
import ImageList from '@mui/material/ImageList'
import ImageListItem from '@mui/material/ImageListItem'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'
import ArrowBack from '@mui/icons-material/ArrowBack'
import ArrowForward from '@mui/icons-material/ArrowForward'
import Close from '@mui/icons-material/Close'
import ZoomIn from '@mui/icons-material/ZoomIn'
import { motion } from 'motion/react'
import { visuallyHidden } from '@mui/utils'
import { colors, contentSx, microLabel, outlinedIconButtonSx, sectionTitleSx } from '../theme'
import { gallery } from '../data/content'
import { works } from '../data/works'
import type { Work } from '../data/works'
import { Reveal } from './effects'

const ease = [0.22, 1, 0.36, 1] as const
const pad = (n: number) => String(n).padStart(2, '0')

function Tile({ work, index, cols, onOpen }: { work: Work; index: number; cols: number; onOpen: (i: number) => void }) {
  return (
    <ImageListItem sx={{ mb: 0 }}>
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.7, delay: (index % cols) * 0.08, ease }}
      >
        <ButtonBase
          onClick={() => onOpen(index)}
          aria-label={`${gallery.openLabel}: ${work.alt}`}
          aria-haspopup="dialog"
          sx={{
            display: 'block',
            width: '100%',
            position: 'relative',
            overflow: 'hidden',
            borderRadius: 1,
            border: `1px solid ${colors.line}`,
            background: colors.surface,
            transition: 'border-color .4s ease, box-shadow .4s ease',
            '& img': {
              display: 'block',
              width: '100%',
              height: 'auto',
              transition: 'transform .7s cubic-bezier(0.22,1,0.36,1)',
            },
            '& .tile-overlay': {
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(180deg, rgba(3,3,3,0) 40%, rgba(3,3,3,0.55) 100%)',
              opacity: 0,
              transition: 'opacity .4s ease',
            },
            '& .tile-icon': {
              width: 52,
              height: 52,
              borderRadius: '50%',
              display: 'grid',
              placeItems: 'center',
              color: colors.bg,
              background: colors.gold,
              transform: 'scale(0.8)',
              transition: 'transform .4s cubic-bezier(0.22,1,0.36,1)',
            },
            '@media (hover: hover)': {
              '&:hover': { borderColor: 'rgba(196,238,24,0.5)', boxShadow: '0 0 28px rgba(196,238,24,0.12)' },
              '&:hover img': { transform: 'scale(1.035)' },
              '&:hover .tile-overlay': { opacity: 1 },
              '&:hover .tile-icon': { transform: 'scale(1)' },
            },
            '&.Mui-focusVisible': { outline: `2px solid ${colors.gold}`, outlineOffset: '3px', borderColor: colors.gold },
            '&.Mui-focusVisible .tile-overlay': { opacity: 1 },
            '&.Mui-focusVisible .tile-icon': { transform: 'scale(1)' },
            '@media (prefers-reduced-motion: reduce)': {
              '& img, & .tile-icon': { transition: 'none' },
              '&:hover img': { transform: 'none' },
            },
          }}
        >
          <img src={work.thumb} alt={work.alt} width={work.width} height={work.height} loading="lazy" decoding="async" />
          <Box className="tile-overlay" aria-hidden="true">
            <Box className="tile-icon">
              <ZoomIn />
            </Box>
          </Box>
        </ButtonBase>
      </motion.div>
    </ImageListItem>
  )
}

function Lightbox({ index, onClose, onChange }: { index: number | null; onClose: () => void; onChange: (i: number) => void }) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const total = works.length
  const open = index !== null
  const work = open ? works[index] : null

  const go = useCallback(
    (dir: 1 | -1) => {
      if (index === null) return
      onChange((index + dir + total) % total)
    },
    [index, onChange, total],
  )

  // Reset scroll for tall images and preload neighbours.
  useEffect(() => {
    if (index === null) return
    scrollRef.current?.scrollTo({ top: 0 })
    for (const n of [index - 1, index + 1]) {
      const img = new Image()
      img.src = works[(n + total) % total].full
    }
  }, [index, total])

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      go(1)
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      go(-1)
    }
  }

  const sideBtnSx = {
    ...outlinedIconButtonSx,
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    zIndex: 2,
    background: 'rgba(3,3,3,0.6)',
    backdropFilter: 'blur(6px)',
    '&:hover': { ...outlinedIconButtonSx['&:hover'], background: 'rgba(3,3,3,0.8)' },
  } as const

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen
      onKeyDown={onKeyDown}
      aria-labelledby="gallery-dialog-title"
      slotProps={{
        backdrop: { sx: { background: 'rgba(3,3,3,0.97)', backdropFilter: 'blur(10px)' } },
        paper: { sx: { background: 'transparent', backgroundImage: 'none', boxShadow: 'none' } },
      }}
    >
      {work && index !== null && (
        <Box sx={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              px: { xs: '20px', md: '48px' },
              py: { xs: 1.5, md: 2 },
              borderBottom: `1px solid ${colors.line}`,
            }}
          >
            <Typography sx={{ ...microLabel, color: colors.gold, fontVariantNumeric: 'tabular-nums', flexShrink: 0 }} aria-live="polite">
              {pad(index + 1)} / {pad(total)}
            </Typography>
            <Typography
              id="gallery-dialog-title"
              component="h2"
              sx={{ fontSize: 14, color: colors.muted, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
            >
              <Box component="span" sx={visuallyHidden}>
                {gallery.dialogLabel}:{' '}
              </Box>
              {work.alt}
            </Typography>
            <IconButton aria-label={gallery.closeLabel} onClick={onClose} sx={{ ...outlinedIconButtonSx, flexShrink: 0 }}>
              <Close sx={{ fontSize: 20 }} />
            </IconButton>
          </Box>

          <Box sx={{ position: 'relative', flex: 1, minHeight: 0 }}>
            <IconButton aria-label={gallery.prevLabel} onClick={() => go(-1)} sx={{ ...sideBtnSx, left: { xs: 8, md: 24 } }}>
              <ArrowBack sx={{ fontSize: 18 }} />
            </IconButton>
            <IconButton aria-label={gallery.nextLabel} onClick={() => go(1)} sx={{ ...sideBtnSx, right: { xs: 8, md: 24 } }}>
              <ArrowForward sx={{ fontSize: 18 }} />
            </IconButton>
            <Box
              ref={scrollRef}
              tabIndex={0}
              aria-label={work.alt}
              sx={{
                height: '100%',
                overflowY: 'auto',
                overscrollBehavior: 'contain',
                '&:focus-visible': { outline: `1px solid ${colors.line}`, outlineOffset: '-1px' },
              }}
            >
              <Box
                sx={{
                  minHeight: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  px: { xs: '20px', md: '96px' },
                  py: { xs: 2, md: 4 },
                }}
              >
                <motion.img
                  key={work.full}
                  src={work.full}
                  alt={work.alt}
                  width={work.fullWidth}
                  height={work.fullHeight}
                  decoding="async"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.35 }}
                  style={{ display: 'block', width: '100%', maxWidth: Math.min(work.fullWidth, 1200), height: 'auto', borderRadius: 4 }}
                />
              </Box>
            </Box>
          </Box>
        </Box>
      )}
    </Dialog>
  )
}

export default function Gallery() {
  const theme = useTheme()
  const isMd = useMediaQuery(theme.breakpoints.up('md'), { noSsr: true })
  const isWide = useMediaQuery('(min-width:1440px)', { noSsr: true })
  const cols = isWide ? 4 : isMd ? 3 : 2

  const [visible, setVisible] = useState(gallery.initialCount)
  const [active, setActive] = useState<number | null>(null)
  const close = useCallback(() => setActive(null), [])

  const shown = works.slice(0, visible)
  const rest = works.length - visible

  return (
    <Box component="section" id="gallery" aria-labelledby="gallery-title">
      <Box sx={{ ...contentSx, pt: { xs: 8, md: 10 }, pb: { xs: 8, md: 10 } }}>
        <Reveal>
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              justifyContent: 'space-between',
              alignItems: { xs: 'stretch', md: 'flex-end' },
              gap: { xs: 3, md: 4 },
              mb: { xs: 4, md: 5 },
            }}
          >
            <Box>
              <Typography sx={{ ...microLabel, fontSize: 10, letterSpacing: '0.3em', color: colors.gold, mb: { xs: 2, md: 2.5 } }}>
                {gallery.eyebrow}
              </Typography>
              <Typography id="gallery-title" component="h2" sx={sectionTitleSx}>
                {gallery.title}
              </Typography>
            </Box>
            <Typography sx={{ fontSize: 13, lineHeight: 1.6, color: colors.muted, maxWidth: 300, pb: { md: 0.5 } }}>
              {gallery.text}
            </Typography>
          </Box>
        </Reveal>

        <ImageList id="gallery-grid" variant="masonry" cols={cols} gap={cols === 2 ? 12 : 18} sx={{ m: 0, overflow: 'visible' }}>
          {shown.map((work, i) => (
            <Tile key={work.thumb} work={work} index={i} cols={cols} onOpen={setActive} />
          ))}
        </ImageList>

        {rest > 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: { xs: 4, md: 6 } }}>
            <Button
              variant="outlined"
              color="primary"
              aria-controls="gallery-grid"
              onClick={() => setVisible((v) => Math.min(works.length, v + gallery.batchSize))}
            >
              {gallery.more}
              <Box component="span" sx={{ ml: 1, color: colors.muted, fontVariantNumeric: 'tabular-nums' }}>
                {pad(rest)}
              </Box>
            </Button>
          </Box>
        )}
      </Box>

      <Lightbox index={active} onClose={close} onChange={setActive} />
    </Box>
  )
}
