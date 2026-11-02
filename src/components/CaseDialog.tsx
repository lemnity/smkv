import { useCallback, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import Box from '@mui/material/Box'
import ButtonBase from '@mui/material/ButtonBase'
import Dialog from '@mui/material/Dialog'
import Fade from '@mui/material/Fade'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import ArrowBack from '@mui/icons-material/ArrowBack'
import ArrowForward from '@mui/icons-material/ArrowForward'
import Close from '@mui/icons-material/Close'
import { useReducedMotion } from 'motion/react'
import { colors, contentSx, microLabel, outlinedIconButtonSx } from '../theme'
import { CASES, caseBySlug, caseHref, type Case } from '../data/cases'
import { useFeedback } from './feedback/context'

/*
 * Project case study, laid out like the case pages of the Lemnity Studio site.
 * The site has no router, so a case is a full-screen dialog bound to the `#case/<slug>` hash:
 * links work, back closes it, and the page underneath keeps its scroll position.
 */

const pad = (n: number) => String(n).padStart(2, '0')
const fromHash = () => {
  const m = window.location.hash.match(/^#case\/([\w-]+)$/)
  return m ? (caseBySlug(m[1]) ?? null) : null
}
const lead = { fontSize: { xs: 18, md: 20 }, lineHeight: 1.6, maxWidth: '60ch' }
const mutedLabel = { ...microLabel, color: colors.muted }

/** Screenshot in a browser-window frame: dots and the address on top. */
function BrowserShot({ src, url, alt, eager }: { src: string; url?: string; alt: string; eager?: boolean }) {
  return (
    <Box component="figure" sx={{ m: 0, overflow: 'hidden', borderRadius: 3, border: `1px solid ${colors.line}`, bgcolor: colors.surface, boxShadow: '0 40px 90px -50px rgba(0,0,0,0.9)' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1.5, borderBottom: `1px solid ${colors.line}` }}>
        <Box aria-hidden sx={{ display: 'flex', gap: 0.75, '& i': { width: 10, height: 10, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.14)' } }}>
          <i />
          <i />
          <i />
        </Box>
        {url && (
          <Typography noWrap sx={{ fontSize: 14, color: colors.muted }}>
            {url.replace(/^https?:\/\//, '').replace(/\/$/, '')}
          </Typography>
        )}
      </Box>
      <img src={src} alt={alt} width={1440} height={900} loading={eager ? 'eager' : 'lazy'} decoding="async" style={{ display: 'block', width: '100%', height: 'auto' }} />
    </Box>
  )
}

/** Labelled block: a small label on the left third, content on the right. */
function CaseSection({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Box
      component="section"
      sx={{
        display: 'grid',
        gridTemplateColumns: { md: 'minmax(0, 1fr) minmax(0, 2fr)' },
        gap: { xs: 3, md: 6 },
        py: { xs: 6, md: 8 },
        borderTop: `1px solid ${colors.line}`,
      }}
    >
      <Typography component="h2" sx={mutedLabel}>
        {label}
      </Typography>
      <Box sx={{ minWidth: 0 }}>{children}</Box>
    </Box>
  )
}

function Meta({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <Box component="dt" sx={mutedLabel}>
        {label}
      </Box>
      <Box component="dd" sx={{ m: 0, mt: 0.75 }}>
        {children}
      </Box>
    </div>
  )
}

function CaseBody({ study, onBack, onContact }: { study: Case; onBack: () => void; onContact: () => void }) {
  const index = CASES.indexOf(study)
  const next = CASES[(index + 1) % CASES.length]

  return (
    <>
      <Box component="header" sx={{ ...contentSx, pt: { xs: 5, md: 8 }, pb: { xs: 6, md: 8 } }}>
        <Box
          sx={{
            display: 'grid',
            gap: 5,
            alignItems: { lg: 'end' },
            gridTemplateColumns: { lg: 'minmax(0, 1.4fr) minmax(0, 1fr)' },
          }}
        >
          <div>
            <Typography sx={{ ...microLabel, color: colors.gold }}>Кейс · {pad(index + 1)}</Typography>
            <Typography
              id="case-title"
              component="h1"
              sx={{ mt: 2.5, fontSize: 'clamp(44px, 7vw, 112px)', fontWeight: 400, lineHeight: 0.95, letterSpacing: '-0.04em' }}
            >
              {study.title}
            </Typography>
            <Typography sx={{ mt: 3, maxWidth: '44ch', fontSize: { xs: 18, md: 20 }, lineHeight: 1.55, color: 'rgba(244,241,236,0.72)' }}>
              {study.lead}
            </Typography>
          </div>
          <Box component="dl" sx={{ m: 0, display: 'grid', gap: 2.5, pl: 3, borderLeft: `1px solid ${colors.line}`, fontSize: 16 }}>
            <Meta label="Клиент">{study.client}</Meta>
            <Meta label="Сфера">{study.industry}</Meta>
            <Meta label="Что сделал">{study.services.join(' · ')}</Meta>
            {study.status && (
              <Meta label="Статус">
                <Box
                  component="span"
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 1,
                    color: colors.gold,
                    '&::before': { content: '""', width: 6, height: 6, borderRadius: '50%', bgcolor: colors.gold },
                  }}
                >
                  {study.status}
                </Box>
              </Meta>
            )}
            {study.url && (
              <Box
                component="a"
                href={study.url}
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  mt: 0.5,
                  width: 'fit-content',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 1.5,
                  px: 3,
                  py: 1.5,
                  borderRadius: 999,
                  border: `1px solid ${colors.gold}`,
                  color: colors.text,
                  textDecoration: 'none',
                  transition: 'background-color .3s',
                  '& svg': { fontSize: 18, transform: 'rotate(-45deg)', transition: 'transform .3s' },
                  '&:hover': { bgcolor: 'rgba(196,238,24,0.1)', '& svg': { transform: 'none' } },
                }}
              >
                {study.urlLabel ?? 'Открыть сайт'}
                <ArrowForward />
              </Box>
            )}
          </Box>
        </Box>
      </Box>

      <Box sx={contentSx}>
        <BrowserShot src={study.shots.hero} url={study.url} alt={`${study.title}: первый экран сайта`} eager />

        <Box
          component="dl"
          sx={{
            display: 'grid',
            gridTemplateColumns: { sm: 'repeat(3, minmax(0, 1fr))' },
            gap: '1px',
            my: { xs: 6, md: 8 },
            overflow: 'hidden',
            borderRadius: 3,
            border: `1px solid ${colors.line}`,
            bgcolor: colors.line,
          }}
        >
          {study.facts.map((f) => (
            <Box key={f.label} sx={{ bgcolor: colors.bg, p: { xs: 3, md: 4 } }}>
              <Box component="dt" sx={{ fontSize: { xs: 36, md: 44 }, lineHeight: 1, letterSpacing: '-0.03em', color: colors.gold }}>
                {f.value}
              </Box>
              <Box component="dd" sx={{ m: 0, mt: 1.5, fontSize: 16, color: 'rgba(244,241,236,0.72)' }}>
                {f.label}
              </Box>
            </Box>
          ))}
        </Box>

        <CaseSection label="О клиенте">
          <Typography sx={lead}>{study.about}</Typography>
        </CaseSection>
        <CaseSection label="Задача">
          <Typography sx={lead}>{study.task}</Typography>
        </CaseSection>
        <CaseSection label="Что сделал">
          <Box component="ol" sx={{ m: 0, p: 0, listStyle: 'none' }}>
            {study.solution.map((item, i) => (
              <Box
                component="li"
                key={item}
                sx={{
                  display: 'grid',
                  gridTemplateColumns: '48px minmax(0, 1fr)',
                  gap: 2,
                  py: { xs: 2, md: 2.5 },
                  borderBottom: `1px solid ${colors.line}`,
                  '&:last-of-type': { borderBottom: 'none' },
                }}
              >
                <Typography sx={{ fontSize: 16, letterSpacing: '0.12em', color: colors.gold }}>{pad(i + 1)}</Typography>
                <Typography sx={{ fontSize: { xs: 17, md: 18 }, lineHeight: 1.55 }}>{item}</Typography>
              </Box>
            ))}
          </Box>
        </CaseSection>

        <Box
          sx={{
            display: 'grid',
            gap: 2,
            py: 2,
            alignItems: { md: 'start' },
            gridTemplateColumns: { md: 'minmax(0, 1fr) minmax(0, 1fr) minmax(0, 0.42fr)' },
          }}
        >
          {study.shots.desktop.map((src, i) => (
            <BrowserShot key={src} src={src} url={study.url} alt={`${study.title}: экран ${i + 2}`} />
          ))}
          <Box
            component="figure"
            sx={{ m: 0, mx: 'auto', width: { xs: '60%', md: '100%' }, maxWidth: 260, overflow: 'hidden', borderRadius: '28px', border: `1px solid ${colors.line}`, bgcolor: colors.surface, p: 1 }}
          >
            <img
              src={study.shots.mobile}
              alt={`${study.title}: версия для телефона`}
              width={390}
              height={844}
              loading="lazy"
              decoding="async"
              style={{ display: 'block', width: '100%', height: 'auto', borderRadius: 22 }}
            />
          </Box>
        </Box>

        <CaseSection label="Ключевые возможности">
          <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: { sm: 'repeat(2, minmax(0, 1fr))' } }}>
            {study.features.map((f) => (
              <Box component="article" key={f.title} sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 3, border: `1px solid ${colors.line}`, bgcolor: colors.surface }}>
                <Typography component="h3" sx={{ fontSize: 20, fontWeight: 400, lineHeight: 1.2, letterSpacing: '-0.01em' }}>
                  {f.title}
                </Typography>
                <Typography sx={{ mt: 1, fontSize: 16, lineHeight: 1.55, color: 'rgba(244,241,236,0.72)' }}>{f.text}</Typography>
              </Box>
            ))}
          </Box>
        </CaseSection>
        <CaseSection label="Технологии">
          <Box component="ul" sx={{ m: 0, p: 0, listStyle: 'none', display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {study.stack.map((s) => (
              <Box component="li" key={s} sx={{ px: 2, py: 1, borderRadius: 999, border: `1px solid ${colors.line}`, fontSize: 16 }}>
                {s}
              </Box>
            ))}
          </Box>
        </CaseSection>

        <Box
          sx={{
            display: 'grid',
            gap: 3,
            gridTemplateColumns: { md: 'repeat(2, minmax(0, 1fr))' },
            py: { xs: 7, md: 10 },
            borderTop: `1px solid ${colors.line}`,
            '& .case-big': {
              mt: 1.5,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              fontSize: 'clamp(30px, 4vw, 56px)',
              lineHeight: 1.05,
              letterSpacing: '-0.03em',
              transition: 'color .3s',
              '& svg': { fontSize: 32, transition: 'transform .3s' },
            },
            '& .case-cta:hover .case-big': { color: colors.goldLight, '& svg': { transform: 'translateX(8px)' } },
          }}
        >
          <ButtonBase className="case-cta" onClick={onContact} sx={{ display: 'block', textAlign: 'left', color: 'inherit', font: 'inherit' }}>
            <Typography component="span" sx={mutedLabel}>
              Похожая задача?
            </Typography>
            <span className="case-big">
              Обсудим проект <ArrowForward />
            </span>
          </ButtonBase>
          <Box
            component="a"
            className="case-cta"
            href={caseHref(next.slug)}
            onClick={(e: React.MouseEvent) => {
              // Swap the case in place: "back" should still lead to the page, not through every case.
              e.preventDefault()
              window.location.replace(caseHref(next.slug))
            }}
            sx={{ display: 'block', color: 'inherit', textDecoration: 'none', textAlign: { md: 'right' }, '& .case-big': { justifyContent: { md: 'flex-end' } } }}
          >
            <Typography component="span" sx={mutedLabel}>
              Следующий кейс
            </Typography>
            <span className="case-big">
              {next.title} <ArrowForward />
            </span>
          </Box>
        </Box>
        <Box sx={{ pb: { xs: 6, md: 8 } }}>
          <ButtonBase onClick={onBack} sx={{ ...mutedLabel, gap: 1, '&:hover': { color: colors.text } }}>
            <ArrowBack sx={{ fontSize: 16 }} /> Все проекты
          </ButtonBase>
        </Box>
      </Box>
    </>
  )
}

/** Mounted once in App: shows the case named by the `#case/<slug>` hash. */
export default function CaseDialog() {
  const reduce = useReducedMotion()
  const { openFeedback } = useFeedback()
  const [study, setStudy] = useState<Case | null>(() => fromHash())
  // Last shown case, kept while the dialog fades out.
  const [shown, setShown] = useState<Case | null>(study)
  // True when the case was opened from the page (so "back" returns to it) rather than by a direct link.
  const openedInPage = useRef(false)
  const paperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onHash = () => {
      const next = fromHash()
      setStudy((prev) => {
        if (next && !prev) openedInPage.current = true
        return next
      })
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  useEffect(() => {
    if (!study) return
    setShown(study)
    paperRef.current?.scrollTo({ top: 0 })
  }, [study])

  const close = useCallback(() => {
    if (openedInPage.current) {
      openedInPage.current = false
      window.history.back()
      return
    }
    // Opened by a direct link: drop the hash and land on the projects list.
    window.history.replaceState(null, '', window.location.pathname + window.location.search)
    setStudy(null)
    requestAnimationFrame(() => document.getElementById('work')?.scrollIntoView())
  }, [])

  return (
    <Dialog
      open={!!study}
      onClose={close}
      fullScreen
      aria-labelledby="case-title"
      slots={{ transition: Fade }}
      transitionDuration={reduce ? 0 : { enter: 320, exit: 220 }}
      slotProps={{ paper: { ref: paperRef, sx: { bgcolor: colors.bg, backgroundImage: 'none', overflowY: 'auto' } } }}
    >
      <Box
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 2,
          borderBottom: `1px solid ${colors.line}`,
          bgcolor: 'rgba(3,3,3,0.82)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <Box sx={{ ...contentSx, height: { xs: 64, md: 76 }, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <ButtonBase onClick={close} sx={{ ...mutedLabel, gap: 1, '&:hover': { color: colors.text } }}>
            <ArrowBack sx={{ fontSize: 16 }} /> Все проекты
          </ButtonBase>
          <IconButton aria-label="Закрыть кейс" onClick={close} sx={{ ...outlinedIconButtonSx, width: 44, height: 44 }}>
            <Close sx={{ fontSize: 20 }} />
          </IconButton>
        </Box>
      </Box>
      {shown && <CaseBody study={shown} onBack={close} onContact={() => openFeedback()} />}
    </Dialog>
  )
}
