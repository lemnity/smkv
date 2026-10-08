export const contacts = {
  email: 'CHANGE-ME@example.com',
  telegram: 'https://t.me/',
  instagram: 'https://instagram.com/',
}

export const nav = [
  { label: 'РАБОТЫ', href: '#work' },
  { label: 'ОБО МНЕ', href: '#about' },
  { label: 'КОНТАКТЫ', href: '#contact' },
]

export const loader = {
  label: 'Загрузка сайта SIMAKOV',
}

export const header = {
  wordmark: 'SIMAKOV',
  tagline: ['СОЗДАВАТЬ', 'БОЛЬШЕ, ЧЕМ ОЖИДАЮТ'],
  homeLabel: 'SIMAKOV — наверх',
  drawer: {
    openLabel: 'Открыть меню',
    closeLabel: 'Закрыть меню',
    contactsLabel: 'Контакты',
    contacts: [
      { key: 'telegram', label: 'Telegram', href: contacts.telegram, external: true },
      { key: 'instagram', label: 'Instagram', href: contacts.instagram, external: true },
      { key: 'email', label: contacts.email, href: `mailto:${contacts.email}`, external: false },
    ],
  },
}

export const hero = {
  eyebrow: 'ДИЗАЙНЕР · ПРОДЮСЕР · ОСНОВАТЕЛЬ',
  lines: ['Делаю', 'сложное', 'простым.'],
  text: 'Создаю цифровые продукты, бренды и пользовательские опыты, которые помогают людям и бизнесу расти.',
  cta: 'Смотреть работы',
  write: 'Написать мне',
  portrait: '/assets/portrait-hero.png',
  portraitAlt: 'Александр Симаков',
  side: { top: ['IDEAS', 'PRODUCTS', 'PEOPLE'], est: 'EST.', year: '1991' },
  signature: 'Simakov',
  signatureLabel: 'ALEXANDER SIMAKOV',
  places: ['TYUMEN', 'RUSSIA', 'WORLDWIDE'],
}

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

export const projects = {
  eyebrow: 'ПОРТФОЛИО',
  title: 'Избранные проекты',
  text: 'Продукты, бренды и цифровые решения, которые делают идеи реальностью.',
  prevLabel: 'Предыдущий проект',
  nextLabel: 'Следующий проект',
  openLabel: 'Открыть проект',
  items: [
    {
      id: 'lemnity',
      number: '01',
      title: 'Lemnity',
      description: 'Платформа для создания сайтов, чат-ботов и цифровых продуктов',
      tags: ['SaaS', 'Конструктор', 'AI', 'Продукт'],
      image: { src: '/assets/lemnity-concept.png', width: 466, height: 407, crop: { x: 0, y: 176, w: 466, h: 216 }, focus: [0.4, 0.5] },
      url: 'https://lemnity.ru',
    },
    {
      id: 'tumtipb',
      number: '02',
      title: 'Tumtipb',
      description: 'Образовательная платформа для профессионалов',
      tags: ['Образование', 'Сайт', 'Гос. сектор'],
      image: { src: '/assets/tumtipb-concept.png', width: 282, height: 174, crop: { x: 0, y: 4, w: 276, h: 158 }, focus: [0, 0.5] },
      url: 'https://tumtipb.ru',
    },
    {
      id: 'prostyle',
      number: '03',
      title: 'ProStyle',
      description: 'Сувенирная продукция и корпоративные подарки',
      tags: ['Бренд', 'Интернет-магазин', 'Дизайн'],
      image: { src: '/assets/prostyle-concept.png', width: 282, height: 176, crop: { x: 0, y: 0, w: 276, h: 170 }, focus: [0, 0.5] },
      url: 'https://prostyle.gifts',
    },
  ] as Project[],
}

export type Stat =
  | { kind: 'number'; value: number; suffix: string; label: string }
  | { kind: 'infinity'; label: string }

export const about = {
  eyebrow: 'ОБО МНЕ',
  title: ['Больше, чем', 'дизайн'],
  text: '12+ лет опыта в дизайне, продуктовой разработке и визуальных коммуникациях. Объединяю стратегию, дизайн и технологии, чтобы создавать продукты с реальной ценностью.',
  more: 'Узнать больше',
  stats: [
    { kind: 'number', value: 12, suffix: '+', label: 'ЛЕТ ОПЫТА' },
    { kind: 'number', value: 50, suffix: '+', label: 'ПРОЕКТОВ' },
    { kind: 'number', value: 3, suffix: '', label: 'СТРАНЫ' },
    { kind: 'infinity', label: 'ИДЕЙ В РАБОТЕ' },
  ] as Stat[],
  quote: ['Хороший дизайн делает', 'сложное понятным,', 'а возможное — ближе.'],
  cta: ['ДАВАЙТЕ', 'СОЗДАДИМ', 'ЧТО-ТО ВМЕСТЕ'],
  ctaLabel: 'Давайте создадим что-то вместе — написать письмо',
  moreHref: `mailto:${contacts.email}`,
}

export const footer = {
  wordmark: 'SIMAKOV',
  copyright: '© 2026',
  center: 'ДИЗАЙН. ПРОДУКТЫ. ИДЕИ.',
  links: [
    { label: 'TELEGRAM', href: contacts.telegram },
    { label: 'INSTAGRAM', href: contacts.instagram },
    { label: 'EMAIL', href: `mailto:${contacts.email}` },
  ],
}
