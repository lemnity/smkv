# SIMAKOV portfolio — MUI rebuild with animation

Spec: the user's request — "rebuild my portfolio site to match the reference 100%, with impressive animation, using components and icons from Material UI (https://mui.com/material-ui/all-components/)". Visual reference: `assets/full-design-reference.png` (1024×1536, dark/gold). Every text string below is copied from the reference and must be used verbatim.

## Global Constraints

- Stack: Vite + React + TypeScript. UI: `@mui/material` + `@mui/icons-material` (+ `@emotion/react`, `@emotion/styled`). Animation: `motion` (import from `motion/react`). Fonts self-hosted via `@fontsource/*` packages. Install current latest versions with npm.
- Layout primitives MUST be MUI (`Box`, `Container`, `Stack`, `Grid`, `Typography`, `Button`, `IconButton`, `Chip`, `Card`, `Divider`, `Link`, `Drawer`, `AppBar`/`Toolbar`, `Tooltip`). Every icon MUST come from `@mui/icons-material` except the "Simakov" handwritten signature and the "SIMAKOV°" wordmark (text). No other UI/icon libraries.
- Styling via a single MUI theme (`src/theme.ts`) + `sx`. No Tailwind, no separate global CSS files beyond MUI `CssBaseline`/`GlobalStyles`.
- Palette: background `#0a0908`, surface `#121110`, text `#f4f1ec`, muted `#8e8a84`, gold `#c9a173`, gold light `#e6c89c`, gold dark `#8a6a45`, line `rgba(255,255,255,0.09)`.
- Fonts: `Onest` (400/500/600) for everything; `Cormorant Garamond` (400 + 400 italic) for the quote; `Great Vibes` for the "Simakov" signature. Uppercase micro-labels: 10–11px, letter-spacing 0.2–0.3em.
- Content width: max 1440px, side padding 48px desktop / 20px mobile. Fully responsive: 1440, 1024, 768, 390 widths must look intentional with no horizontal scroll.
- Animation must respect reduced motion: wrap the app in `<MotionConfig reducedMotion="user">`; custom JS effects (cursor, counters, tilt) must also check `useReducedMotion()` and become static.
- `npm run build` (which runs `tsc -b && vite build`) must pass with zero TypeScript errors. `npm run lint` is NOT required (do not add ESLint).
- Language `ru`. Page title: `SIMAKOV — Делаю сложное простым`.
- Assets: move images to `public/assets/` and reference as `/assets/...`. Hero portrait = `assets/portrait-hero.png` (already cropped from the reference). Project images = `lemnity-concept.png`, `tumtipb-concept.png`, `prostyle-concept.png`.
- Contacts: email `CHANGE-ME@example.com`, Telegram `https://t.me/`, Instagram `https://instagram.com/` (placeholders the owner will replace) — kept in one `src/data/content.ts` file together with all page copy.
- Project links: Lemnity `https://lemnity.ru`, Tumtipb `https://tumtipb.ru`, ProStyle `https://prostyle.gifts` (open in new tab, `rel="noopener noreferrer"`).
- Old `index.html` and `styles.css` are replaced by the Vite app (index.html becomes the Vite entry; delete styles.css).

## Task 1: Scaffold, theme, content, page shell, header, footer, global effects

Files: `package.json`, `vite.config.ts`, `tsconfig*.json`, `index.html`, `src/main.tsx`, `src/App.tsx`, `src/theme.ts`, `src/data/content.ts`, `src/components/Header.tsx`, `src/components/Footer.tsx`, `src/components/effects/*`, `public/assets/*`, delete `styles.css`.

- Scaffold Vite React-TS manually or with `npm create vite@latest . -- --template react-ts` (do not clobber `assets/`, `docs/`, `README.md`, `.gitignore`; remove demo files/CSS). Move `assets/*` → `public/assets/` (git mv).
- `theme.ts`: dark mode, palette above, typography (Onest), shape radius 4, component overrides: Button (pill, outlined gold variant for primary CTA), IconButton (circle outlined variant, 1px line border, hover → gold border + gold glow), Chip (tag: transparent, no border, muted 11px, `#` prefix rendered by content), Divider uses line color.
- `content.ts`: all copy + links in typed objects (hero, projects, about, stats, footer, contacts).
- `App.tsx`: `ThemeProvider` + `CssBaseline` + `MotionConfig reducedMotion="user"`, sections in order: Header, Hero (placeholder `<Box id="home"/>` until Task 2), Projects (`id="work"`, placeholder), About (`id="about"`, placeholder), Footer (`id="contact"`). Thin horizontal `Divider`s between sections, inset to content width (as in reference).
- Header (reference top row): left wordmark `SIMAKOV` with a small gold `°`-style dot superscript; center nav `РАБОТЫ` `ОБО МНЕ` `КОНТАКТЫ` (smooth scroll to `#work`, `#about`, `#contact`); right a 44px circular outlined `IconButton` with `MoreHoriz` icon + two-line label `СОЗДАВАТЬ / БОЛЬШЕ, ЧЕМ ОЖИДАЮТ`. The icon button opens a right `Drawer` (dark, full height, ~420px; full width on mobile) containing nav links (large, staggered motion reveal), contacts (Telegram/Instagram/Email with `Telegram`, `Instagram`, `MailOutline` icons) and a `Close` icon button. Header is a transparent `AppBar position="fixed"` that gains a blurred dark background + bottom line after scrolling 40px (animate). Nav links: animated gold underline on hover (scaleX from left). Header enters on load (fade down, 0.6s). On < 768px hide center nav and the two-line label; the icon button remains (switch icon to `Menu`).
- Footer (reference bottom row): `SIMAKOV°` wordmark + `© 2026` muted; center `ДИЗАЙН. ПРОДУКТЫ. ИДЕИ.` (spaced uppercase, muted); right links `TELEGRAM` `INSTAGRAM` `EMAIL` + a small gold dot. Stacks vertically on mobile.
- Global effects (`src/components/effects/`): (a) `GrainOverlay` — fixed, pointer-events none, subtle animated SVG-noise texture at ~5% opacity; (b) `CustomCursor` — 8px gold dot + 36px ring following the pointer with spring lag, ring grows over `a, button` and fades on touch devices (`(pointer: coarse)` → don't render), disabled on reduced motion; (c) `ScrollProgress` — 1px gold bar at top of viewport using `useScroll` + `useSpring` scaleX; (d) `Reveal` — reusable wrapper: fades/slides children up (y 32 → 0, opacity) once when 20% in view, accepts `delay`; (e) `MagneticButton` — wrapper that pulls its child up to 10px toward the pointer with a spring, resets on leave.
- Verify: `npm run build` passes; `npm run dev` serves the page with header/footer visible.

## Task 2: Hero section

Files: `src/components/Hero.tsx` (+ small subcomponents in `src/components/hero/` if useful), wire into `App.tsx`.

Reference layout (desktop, ~ first 610px of reference scaled to 1440 wide): two-zone composition, min-height ~100vh (min 720px), content padded below the fixed header.
- Left column (~45%): eyebrow `ДИЗАЙНЕР · ПРОДЮСЕР · ОСНОВАТЕЛЬ` (muted, spaced); H1 three lines `Делаю` / `сложное` / `простым.` — huge (clamp ~64px → 150px), weight 400–500, tight letter-spacing (-0.04em), line-height 0.95; lines 1–2 white, line 3 a gold gradient text (`#e6c89c → #c9a173 → #8a6a45`) with a slow moving sheen. Paragraph `Создаю цифровые продукты, бренды и пользовательские опыты, которые помогают людям и бизнесу расти.` (~18px, muted-light, max ~420px). Actions row: outlined pill gold-bordered `Button` `Смотреть работы` with `ArrowForward` end icon (wrapped in `MagneticButton`, arrow slides right on hover; scrolls to `#work`), and text link `Написать мне` underlined + small gold dot (mailto email).
- Center/right: the portrait, large, positioned behind/right of the text, bottom-anchored, fading into the background on left/right/bottom edges via `mask-image` gradients, warm dark vignette. Behind the portrait a thin gold circular arc ("halo", as in reference — an arc on the left side of the head with a soft glow) drawn as SVG.
- Far right column (narrow): stacked micro-labels `IDEAS` `PRODUCTS` `PEOPLE`, short line, `EST.` `1991`; mid-height the handwritten gold signature `Simakov` (Great Vibes, ~64px, slightly rotated -8°) with `ALEXANDER SIMAKOV` label under it; near bottom `TYUMEN` `RUSSIA` `WORLDWIDE` + MUI `Language` icon (globe) slowly rotating.
- Animation (load sequence, ~1.8s total, orchestrated with staggered delays): eyebrow fades in; each H1 line slides up from a clipping mask (overflow hidden, y 110% → 0, staggered 0.12s, easing [0.22,1,0.36,1]); paragraph and actions fade up; portrait fades in from scale 1.08 + blur(12px) → 1/0; halo arc draws itself (`pathLength` 0 → 1) then keeps a slow pulsing glow; signature writes in left→right via animated `clip-path: inset(0 100% 0 0) → inset(0 0 0 0)`; right labels stagger in. Scroll: portrait parallax (moves slower, y up to 80px) and hero copy fades/translates slightly as user scrolls away (`useScroll` target hero). Pointer: portrait + halo shift subtly (±12px) with mouse position (spring), desktop only.
- Mobile (<900px): stack — text first, portrait below at ~80% width with halo; right column labels collapse into a single row of small labels under the actions; signature overlaps the portrait bottom-right. H1 ~56–64px.
- Verify: `npm run build` passes.

## Task 3: Projects ("Избранные проекты") and About ("Больше, чем дизайн") sections

Files: `src/components/Projects.tsx`, `src/components/ProjectCard.tsx`, `src/components/About.tsx`, `src/components/StatCounter.tsx`, wire into `App.tsx`.

Projects (`id="work"`):
- Head row: left eyebrow `ПОРТФОЛИО` (gold) + H2 `Избранные проекты` (~56px desktop); right paragraph `Продукты, бренды и цифровые решения, которые делают идеи реальностью.` (13px muted, 2 lines) and two 44px circular `IconButton`s with `ArrowBack` / `ArrowForward`.
- Grid: one large card on the left (full height) and two stacked cards on the right, equal column widths, 12px gap, desktop large card ~500px tall. Each card is an MUI `Card` (dark gradient surface `#151413 → #0c0b0a`, 1px line border, radius 4): number `01`/`02`/`03` (small), title (`Lemnity` ~36px large card / ~26px small), description, 40px circular outlined arrow `IconButton` (`ArrowForward`, links to project URL, new tab), and the project image placed to the right/bottom (large card: image fills the lower-right, slightly rotated like the reference; small cards: image occupies right ~55%). Tags row as MUI `Chip`s rendered BELOW the card (outside the border): Lemnity `#SaaS #Конструктор #AI #Продукт`; Tumtipb `#Образование #Сайт #Гос. сектор`; ProStyle `#Бренд #Интернет-магазин #Дизайн`. Texts: Lemnity — `Платформа для создания сайтов, чат-ботов и цифровых продуктов`; Tumtipb — `Образовательная платформа для профессионалов`; ProStyle — `Сувенирная продукция и корпоративные подарки`.
- Arrow buttons rotate which project occupies the large slot (order cycles forward/back); the cards re-flow with motion `layout` animations (shared `layoutId` per project) — a smooth morph. Both buttons always enabled (cyclic).
- Card motion: scroll reveal staggered; hover → border turns gold-tinted, image scales 1.05 and shifts, subtle 3D tilt following the pointer (max 4°, spring, desktop only), arrow button fills gold with dark icon and rotates -45°; a soft radial gold spotlight follows the pointer inside the card.
- Mobile: single column, large card ~420px, small cards keep image right but smaller; head row stacks.

About (`id="about"`):
- Left column (~35%): eyebrow `ОБО МНЕ` (gold), H2 `Больше, чем` / `дизайн`, paragraph `12+ лет опыта в дизайне, продуктовой разработке и визуальных коммуникациях. Объединяю стратегию, дизайн и технологии, чтобы создавать продукты с реальной ценностью.`, link `Узнать больше` underlined + gold dot (scrolls to `#contact` / opens mailto — use mailto).
- Vertical `Divider` between columns (desktop).
- Right column: stats row of 4 with vertical dividers between: `12+` `ЛЕТ ОПЫТА`; `50+` `ПРОЕКТОВ`; `3` `СТРАНЫ`; `∞` rendered as MUI `AllInclusive` icon in gold `ИДЕЙ В РАБОТЕ`. Numbers ~40px light weight; counters count up from 0 when scrolled into view (1.6s ease-out), the `+` suffix appears at the end; the infinity icon draws/pulses. Below: quote with a large faded gold `FormatQuote` icon top-left (rotated so it reads as an opening quote), text `Хороший дизайн делает` / `сложное понятным,` / `а возможное — ближе.` in Cormorant Garamond ~34px, color muted dark (`#6f6b66`), words reveal one-by-one on scroll (opacity 0.15 → 1 scrubbed to scroll progress). To its right: 72px circular outlined `IconButton` with `MoreHoriz` icon (slow-spinning dashed gold ring around it) + label `ДАВАЙТЕ` / `СОЗДАДИМ` / `ЧТО-ТО ВМЕСТЕ` + gold dot; clicking opens mailto.
- Mobile: stack; stats 2×2 grid.
- Verify: `npm run build` passes.

## Task 4: Polish, README, verification

Files: `README.md`, any component needing fixes.
- Run the dev/preview server and screenshot the page at 1440 and 390 widths (use Playwright via `npx playwright` if browsers are installable; otherwise document that visual check was not possible). Fix overflow, overlap and spacing issues discovered.
- Ensure `index.html` has meta description, theme-color `#0a0908`, favicon (simple SVG gold dot/`S` in `public/favicon.svg`), Open Graph title/description/image (`/assets/portrait-hero.png`).
- Rewrite README (Russian): stack, `npm install`, `npm run dev`, `npm run build`, `npm run preview`, where to edit copy (`src/data/content.ts`), placeholders to replace before publishing (email, Telegram, Instagram, concept images).
- Verify: `npm run build` passes.
