import Box from '@mui/material/Box'
import ButtonBase from '@mui/material/ButtonBase'
import { colors, microLabel } from '../theme'
import { LANGS } from '../data/content'
import { useLang } from '../i18n'

interface Props {
  /** `large` is used inside the drawer. */
  size?: 'small' | 'large'
}

/** Compact "RU / EN" switch: a labelled group of two toggle buttons (aria-pressed). */
export default function LangSwitch({ size = 'small' }: Props) {
  const { lang, setLang, t } = useLang()
  const large = size === 'large'

  return (
    <Box
      role="group"
      aria-label={t.langSwitch.label}
      sx={{ display: 'inline-flex', alignItems: 'center', flexShrink: 0 }}
    >
      {LANGS.map((code, i) => {
        const active = code === lang
        return (
          <Box key={code} sx={{ display: 'inline-flex', alignItems: 'center' }}>
            {i > 0 && (
              <Box aria-hidden component="span" sx={{ ...microLabel, fontSize: large ? 13 : 10, color: 'rgba(244,241,236,0.25)', mx: '2px' }}>
                /
              </Box>
            )}
            <ButtonBase
              lang={code}
              aria-pressed={active}
              title={t.langSwitch.names[code]}
              onClick={() => setLang(code)}
              sx={{
                ...microLabel,
                fontSize: large ? 13 : 11,
                letterSpacing: '0.2em',
                // Trailing letter-spacing makes the glyphs look off-centre; compensate.
                pl: large ? '10px' : '6px',
                pr: large ? 'calc(10px - 0.2em)' : 'calc(6px - 0.2em)',
                minWidth: large ? 44 : 32,
                minHeight: large ? 44 : 32,
                borderRadius: 1,
                color: active ? colors.gold : colors.muted,
                transition: 'color .3s ease',
                '&:hover': { color: active ? colors.gold : colors.text },
                '&.Mui-focusVisible': { outline: `2px solid ${colors.gold}`, outlineOffset: '2px' },
              }}
            >
              {code}
            </ButtonBase>
          </Box>
        )
      })}
    </Box>
  )
}
