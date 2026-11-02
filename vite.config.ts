import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { CASES, casePath, caseTitle, type Case } from './src/data/cases'

const SITE = 'https://simakoov.ru/'

const escapeHtml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/** Hidden static text of a case page for crawlers and no-JS visitors (React replaces it). */
function caseFallback(c: Case) {
  const li = (items: readonly string[]) => items.map((i) => `<li>${escapeHtml(i)}</li>`).join('')
  return [
    `<main><h1>${escapeHtml(c.title)}</h1><p>${escapeHtml(c.lead)}</p>`,
    `<p>Клиент: ${escapeHtml(c.client)}. Сфера: ${escapeHtml(c.industry)}. Что сделал: ${escapeHtml(c.services.join(', '))}.</p>`,
    `<h2>О клиенте</h2><p>${escapeHtml(c.about)}</p><h2>Задача</h2><p>${escapeHtml(c.task)}</p>`,
    `<h2>Что сделал</h2><ol>${li(c.solution)}</ol>`,
    `<h2>Ключевые возможности</h2><ul>${c.features.map((f) => `<li>${escapeHtml(f.title)}: ${escapeHtml(f.text)}</li>`).join('')}</ul>`,
    `<h2>Технологии</h2><ul>${li(c.stack)}</ul>`,
    `<p><a href="${SITE}#work">Все проекты</a></p></main>`,
  ].join('')
}

/**
 * Writes dist/cases/<slug>/index.html for every case: the built index.html with the case's own
 * title, description, canonical, Open Graph and static text, so each case is a real page on both
 * GitHub Pages and nginx (no SPA fallback needed). App picks the case from the path.
 */
function casePages(): Plugin {
  let outDir = 'dist'
  return {
    name: 'case-pages',
    apply: 'build',
    configResolved(config) {
      outDir = config.build.outDir
    },
    closeBundle() {
      const home = readFileSync(join(outDir, 'index.html'), 'utf8')
      for (const c of CASES) {
        const url = SITE + casePath(c.slug)
        const title = escapeHtml(caseTitle(c))
        const description = escapeHtml(c.lead)
        const jsonLd = JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'CreativeWork',
          name: c.title,
          description: c.lead,
          url,
          inLanguage: 'ru',
          author: { '@id': `${SITE}#person` },
          ...(c.url ? { sameAs: c.url } : {}),
        })
        const html = home
          .replace('<html lang="ru">', '<html lang="ru" data-page="case">')
          .replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`)
          .replace(/(<meta name="description" content=")[^"]*/, `$1${description}`)
          .replace(/(<link rel="canonical" href=")[^"]*/, `$1${url}`)
          .replace(/(<meta property="og:url" content=")[^"]*/, `$1${url}`)
          .replace(/(<meta property="og:type" content=")[^"]*/, '$1article')
          .replace(/(<meta property="og:title" content=")[^"]*/, `$1${title}`)
          .replace(/(<meta property="og:description" content=")[^"]*/, `$1${description}`)
          // The home page's WebSite/Person/FAQPage graph does not describe this page.
          .replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>\s*/g, '')
          .replace('</head>', `  <script type="application/ld+json">${jsonLd}</script>\n  </head>`)
          .replace(/(<div class="seo-static"[^>]*>)[\s\S]*?(\n    <\/div>\n    <\/div>)/, `$1${caseFallback(c)}$2`)
        const dir = join(outDir, casePath(c.slug))
        mkdirSync(dir, { recursive: true })
        writeFileSync(join(dir, 'index.html'), html)
      }
    },
  }
}

export default defineConfig({
  // GitHub Pages serves the site from /<repo>/; the deploy workflow sets BASE_PATH.
  base: process.env.BASE_PATH || '/',
  plugins: [react(), casePages()],
  build: {
    rolldownOptions: {
      output: {
        // Split stable vendor code into separate, long-cacheable chunks so no
        // single chunk exceeds the 500 kB warning. All of them are needed for
        // the first render (static imports), so they load in parallel via
        // modulepreload — no extra round-trip and no impact on LCP.
        codeSplitting: {
          groups: [
            { name: 'react', test: /node_modules[\\/](react|react-dom|scheduler)[\\/]/ },
            { name: 'mui', test: /node_modules[\\/](@mui|@emotion|@babel[\\/]runtime|stylis|react-transition-group|react-is|hoist-non-react-statics|clsx|prop-types)[\\/]/ },
            { name: 'motion', test: /node_modules[\\/](motion|framer-motion|motion-dom|motion-utils)[\\/]/ },
          ],
        },
      },
    },
  },
})
