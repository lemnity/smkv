/**
 * All page copy lives here in two dictionaries with the same shape: `ru` and `en`.
 * Shared, non-translatable data (contacts, URLs, images, numbers) is defined once below
 * and reused by both dictionaries. Components read the current dictionary via `useLang().t`.
 */

export type Lang = 'ru' | 'en'
export const LANGS: readonly Lang[] = ['ru', 'en']

export const contacts = {
  email: 'CHANGE-ME@example.com',
  telegram: 'https://t.me/',
  instagram: 'https://instagram.com/',
}

const mailto = `mailto:${contacts.email}`

/** Rectangle in source-image pixels. */
export interface Rect {
  x: number
  y: number
  w: number
  h: number
}

export interface ProjectImage {
  src: string
  /** Natural size of the file (for width/height attributes and crop math). */
  width: number
  height: number
  /** Visible part of the image. The concept images are cut from the reference, so they are cropped to drop baked-in text/borders. Use the full image rect for clean images. */
  crop: Rect
  /** Focal point (0–1) used when the crop has to be cut further to cover the slot. */
  focus: [number, number]
}

export interface Project {
  id: string
  number: string
  title: string
  description: string
  /** Rendered with a `#` prefix. */
  tags: string[]
  image: ProjectImage
  url: string
}

export type Stat =
  | { kind: 'number'; value: number; suffix: string; label: string }
  | { kind: 'infinity'; label: string }

/** Language-independent project data (merged with translated title/description/tags). */
const projectBase = {
  lemnity: {
    id: 'lemnity',
    number: '01',
    title: 'Lemnity',
    image: { src: '/assets/lemnity-concept.png', width: 466, height: 407, crop: { x: 0, y: 176, w: 466, h: 216 }, focus: [0.4, 0.5] },
    url: 'https://lemnity.ru',
  },
  tumtipb: {
    id: 'tumtipb',
    number: '02',
    title: 'Tumtipb',
    image: { src: '/assets/tumtipb-concept.png', width: 282, height: 174, crop: { x: 0, y: 4, w: 276, h: 158 }, focus: [0, 0.5] },
    url: 'https://tumtipb.ru',
  },
  prostyle: {
    id: 'prostyle',
    number: '03',
    title: 'ProStyle',
    image: { src: '/assets/prostyle-concept.png', width: 282, height: 176, crop: { x: 0, y: 0, w: 276, h: 170 }, focus: [0, 0.5] },
    url: 'https://prostyle.gifts',
  },
} satisfies Record<string, Omit<Project, 'description' | 'tags'>>

/** Language-independent hero data. */
const heroBase = {
  portrait: '/assets/portrait-hero.png',
  side: { top: ['IDEAS', 'PRODUCTS', 'PEOPLE'], est: 'EST.', year: '1991' },
  signature: 'Simakov',
  signatureLabel: 'ALEXANDER SIMAKOV',
  places: ['TYUMEN', 'RUSSIA', 'WORLDWIDE'],
}

const footerLinks = [
  { label: 'TELEGRAM', href: contacts.telegram },
  { label: 'INSTAGRAM', href: contacts.instagram },
  { label: 'EMAIL', href: mailto },
]

const drawerContacts = [
  { key: 'telegram', label: 'Telegram', href: contacts.telegram, external: true },
  { key: 'instagram', label: 'Instagram', href: contacts.instagram, external: true },
  { key: 'email', label: contacts.email, href: mailto, external: false },
]

/* ------------------------------------------------------------------ RU */

const ru = {
  /** <title>, meta description and Open Graph (applied at runtime on language change). */
  meta: {
    title: 'SIMAKOV — Делаю сложное простым',
    description:
      'Александр Симаков — дизайнер, продюсер и основатель. Создаю цифровые продукты, бренды и пользовательские опыты, которые помогают людям и бизнесу расти.',
    ogDescription: 'Создаю цифровые продукты, бренды и пользовательские опыты, которые помогают людям и бизнесу расти.',
    ogLocale: 'ru_RU',
    ogImageAlt: 'Александр Симаков',
  },
  langSwitch: {
    /** Accessible name of the RU/EN group (same in both languages on purpose). */
    label: 'Язык / Language',
    names: { ru: 'Русский', en: 'English' } as Record<Lang, string>,
  },
  nav: [
    { label: 'РАБОТЫ', href: '#work' },
    { label: 'ОБО МНЕ', href: '#about' },
    { label: 'КОНТАКТЫ', href: '#contact' },
  ],
  loader: {
    label: 'Загрузка сайта SIMAKOV',
  },
  header: {
    wordmark: 'SIMAKOV',
    tagline: ['СОЗДАВАТЬ', 'БОЛЬШЕ, ЧЕМ ОЖИДАЮТ'],
    homeLabel: 'SIMAKOV — наверх',
    drawer: {
      openLabel: 'Открыть меню',
      closeLabel: 'Закрыть меню',
      contactsLabel: 'Контакты',
      languageLabel: 'Язык',
      contacts: drawerContacts,
    },
  },
  hero: {
    ...heroBase,
    eyebrow: 'ДИЗАЙНЕР · ПРОДЮСЕР · ОСНОВАТЕЛЬ',
    /** Three heading lines; the last one is accented. */
    lines: ['Делаю', 'сложное', 'простым.'],
    text: 'Создаю цифровые продукты, бренды и пользовательские опыты, которые помогают людям и бизнесу расти.',
    cta: 'Смотреть работы',
    write: 'Написать мне',
    writeHref: mailto,
    portraitAlt: 'Александр Симаков',
  },
  projects: {
    eyebrow: 'ПОРТФОЛИО',
    title: 'Избранные проекты',
    text: 'Продукты, бренды и цифровые решения, которые делают идеи реальностью.',
    prevLabel: 'Предыдущий проект',
    nextLabel: 'Следующий проект',
    openLabel: 'Открыть проект',
    items: [
      {
        ...projectBase.lemnity,
        description: 'Платформа для создания сайтов, чат-ботов и цифровых продуктов',
        tags: ['SaaS', 'Конструктор', 'AI', 'Продукт'],
      },
      {
        ...projectBase.tumtipb,
        description: 'Образовательная платформа для профессионалов',
        tags: ['Образование', 'Сайт', 'Гос. сектор'],
      },
      {
        ...projectBase.prostyle,
        description: 'Сувенирная продукция и корпоративные подарки',
        tags: ['Бренд', 'Интернет-магазин', 'Дизайн'],
      },
    ] as Project[],
  },
  gallery: {
    eyebrow: 'АРХИВ',
    title: 'Галерея работ',
    text: 'Брендинг, интерфейсы, сайты и мерч — подборка работ разных лет.',
    /** Accessible name for a tile: `${openLabel}: ${alt}`. */
    openLabel: 'Открыть работу',
    dialogLabel: 'Просмотр работы',
    closeLabel: 'Закрыть просмотр',
    prevLabel: 'Предыдущая работа',
    nextLabel: 'Следующая работа',
  },
  about: {
    eyebrow: 'ОБО МНЕ',
    title: ['Больше, чем', 'дизайн'],
    text: '12+ лет опыта в дизайне, продуктовой разработке и визуальных коммуникациях. Объединяю стратегию, дизайн и технологии, чтобы создавать продукты с реальной ценностью.',
    more: 'Узнать больше',
    moreHref: mailto,
    stats: [
      { kind: 'number', value: 12, suffix: '+', label: 'ЛЕТ ОПЫТА' },
      { kind: 'number', value: 50, suffix: '+', label: 'ПРОЕКТОВ' },
      { kind: 'number', value: 3, suffix: '', label: 'СТРАНЫ' },
      { kind: 'infinity', label: 'ИДЕЙ В РАБОТЕ' },
    ] as Stat[],
    /** Accessible name of the ∞ stat icon. */
    infinityLabel: 'бесконечность',
    quote: ['Хороший дизайн делает', 'сложное понятным,', 'а возможное — ближе.'],
    cta: ['ДАВАЙТЕ', 'СОЗДАДИМ', 'ЧТО-ТО ВМЕСТЕ'],
    ctaLabel: 'Давайте создадим что-то вместе — написать письмо',
  },
  footer: {
    wordmark: 'SIMAKOV',
    copyright: '© 2026',
    center: 'ДИЗАЙН. ПРОДУКТЫ. ИДЕИ.',
    links: footerLinks,
  },
}

export type Content = typeof ru

/* ------------------------------------------------------------------ EN */

const en: Content = {
  meta: {
    title: 'SIMAKOV — Complex made simple',
    description:
      'Alexander Simakov — designer, producer and founder. I build digital products, brands and user experiences that help people and businesses grow.',
    ogDescription: 'I build digital products, brands and user experiences that help people and businesses grow.',
    ogLocale: 'en_US',
    ogImageAlt: 'Alexander Simakov',
  },
  langSwitch: {
    label: 'Язык / Language',
    names: { ru: 'Русский', en: 'English' },
  },
  nav: [
    { label: 'WORK', href: '#work' },
    { label: 'ABOUT', href: '#about' },
    { label: 'CONTACT', href: '#contact' },
  ],
  loader: {
    label: 'Loading SIMAKOV',
  },
  header: {
    wordmark: 'SIMAKOV',
    tagline: ['CREATING', 'BEYOND EXPECTATIONS'],
    homeLabel: 'SIMAKOV — back to top',
    drawer: {
      openLabel: 'Open menu',
      closeLabel: 'Close menu',
      contactsLabel: 'Contact',
      languageLabel: 'Language',
      contacts: drawerContacts,
    },
  },
  hero: {
    ...heroBase,
    eyebrow: 'DESIGNER · PRODUCER · FOUNDER',
    lines: ['Complex,', 'made', 'simple.'],
    text: 'I build digital products, brands and user experiences that help people and businesses grow.',
    cta: 'View my work',
    write: 'Get in touch',
    writeHref: mailto,
    portraitAlt: 'Alexander Simakov',
  },
  projects: {
    eyebrow: 'PORTFOLIO',
    title: 'Featured projects',
    text: 'Products, brands and digital solutions that turn ideas into reality.',
    prevLabel: 'Previous project',
    nextLabel: 'Next project',
    openLabel: 'Open project',
    items: [
      {
        ...projectBase.lemnity,
        description: 'A platform for building websites, chatbots and digital products',
        tags: ['SaaS', 'Site builder', 'AI', 'Product'],
      },
      {
        ...projectBase.tumtipb,
        description: 'An education platform for professionals',
        tags: ['Education', 'Website', 'Public sector'],
      },
      {
        ...projectBase.prostyle,
        description: 'Branded merchandise and corporate gifts',
        tags: ['Brand', 'E-commerce', 'Design'],
      },
    ],
  },
  gallery: {
    eyebrow: 'ARCHIVE',
    title: 'Gallery',
    text: 'Branding, interfaces, websites and merch — a selection of work from over the years.',
    openLabel: 'Open work',
    dialogLabel: 'Viewing work',
    closeLabel: 'Close viewer',
    prevLabel: 'Previous work',
    nextLabel: 'Next work',
  },
  about: {
    eyebrow: 'ABOUT',
    title: ['More than', 'design'],
    text: '12+ years in design, product development and visual communication. I bring strategy, design and technology together to build products that deliver real value.',
    more: 'Learn more',
    moreHref: mailto,
    stats: [
      { kind: 'number', value: 12, suffix: '+', label: 'YEARS IN DESIGN' },
      { kind: 'number', value: 50, suffix: '+', label: 'PROJECTS' },
      { kind: 'number', value: 3, suffix: '', label: 'COUNTRIES' },
      { kind: 'infinity', label: 'IDEAS IN MOTION' },
    ],
    infinityLabel: 'infinity',
    quote: ['Good design makes', 'the complex clear', 'and the possible closer.'],
    cta: ["LET'S CREATE", 'SOMETHING', 'TOGETHER'],
    ctaLabel: "Let's create something together — send an email",
  },
  footer: {
    wordmark: 'SIMAKOV',
    copyright: '© 2026',
    center: 'DESIGN. PRODUCTS. IDEAS.',
    links: footerLinks,
  },
}

export const content: Record<Lang, Content> = { ru, en }
