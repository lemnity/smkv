import { useRef } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { visuallyHidden } from '@mui/utils'
import { useReducedMotion, useScroll } from 'motion/react'
import { colors, contentSx } from '../theme'
import { useLang } from '../i18n'
import { Word } from './About'

type ManifestoWord = { parts: { text: string; accent: boolean }[]; space: boolean }

/**
 * Splits the text into words; fragments in [brackets] are accented. Punctuation right after a
 * bracket ("[кода] и", "[Lemnity].") stays glued to its word so it never wraps on its own.
 */
function parseManifesto(text: string): ManifestoWord[] {
  const words: ManifestoWord[] = []
  let glue = false
  for (const [i, segment] of text.split(/\[([^\]]+)\]/).entries()) {
    const accent = i % 2 === 1
    for (const piece of segment.split(/(\s+)/)) {
      if (!piece) continue
      if (/^\s+$/.test(piece)) {
        if (words.length) words[words.length - 1].space = true
        glue = false
        continue
      }
      const last = words[words.length - 1]
      if (glue && last && !last.space) last.parts.push({ text: piece, accent })
      else words.push({ parts: [{ text: piece, accent }], space: false })
      glue = true
    }
  }
  return words
}

/** "Who I am" in large type right after the first screen (as on the studio site): words surface as you scroll, key ones in lime. */
export default function Manifesto() {
  const { manifesto } = useLang().t
  const ref = useRef<HTMLParagraphElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.85', 'end 0.6'] })
  const words = parseManifesto(manifesto)

  return (
    <Box component="section">
      <Box sx={{ ...contentSx, py: { xs: 10, md: 16 } }}>
        <Typography
          ref={ref}
          sx={{ m: 0, maxWidth: 1280, fontSize: 'clamp(30px, 4.4vw, 68px)', fontWeight: 400, lineHeight: 1.1, letterSpacing: '-0.03em', color: colors.text }}
        >
          <Box component="span" sx={visuallyHidden}>
            {manifesto.replace(/[[\]]/g, '')}
          </Box>
          <span aria-hidden>
            {words.map((w, i) => {
              const content = (
                <>
                  {w.parts.map((part, pi) => (
                    <Box component="span" key={pi} sx={part.accent ? { color: colors.gold } : undefined}>
                      {part.text}
                    </Box>
                  ))}
                  {w.space ? ' ' : null}
                </>
              )
              return reduce ? (
                <span key={i}>{content}</span>
              ) : (
                <Word key={i} progress={scrollYProgress} index={i} total={words.length}>
                  {content}
                </Word>
              )
            })}
          </span>
        </Typography>
      </Box>
    </Box>
  )
}
