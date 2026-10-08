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

export type FeedbackTopicId = 'website' | 'brand' | 'product' | 'other'
export interface FeedbackTopic {
  id: FeedbackTopicId
  label: string
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
  // Opens the feedback form modal instead of following the mailto link.
  { label: 'EMAIL', href: mailto, feedback: true },
]

const drawerContacts = [
  { key: 'telegram', label: 'Telegram', href: contacts.telegram, external: true },
  { key: 'instagram', label: 'Instagram', href: contacts.instagram, external: true },
  // Opens the feedback form modal (see src/components/feedback).
  { key: 'email', label: contacts.email, href: mailto, external: false, feedback: true },
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
  clients: {
    eyebrow: 'КЛИЕНТЫ',
    title: 'Мне доверяют',
    text: 'Компании и команды, с которыми мы запускали бренды, сайты и продукты.',
    listLabel: 'Клиенты',
  },
  about: {
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
    /** Accessible name of the ∞ stat icon. */
    infinityLabel: 'бесконечность',
    quote: ['Хороший дизайн делает', 'сложное понятным,', 'а возможное — ближе.'],
    cta: ['ДАВАЙТЕ', 'СОЗДАДИМ', 'ЧТО-ТО ВМЕСТЕ'],
    ctaLabel: 'Давайте создадим что-то вместе — открыть форму обратной связи',
  },
  feedback: {
    dialogLabel: 'Форма обратной связи',
    eyebrow: 'ОБРАТНАЯ СВЯЗЬ',
    title: 'Обсудим проект',
    subtitle: 'Пара слов о задаче — и я вернусь с идеями, сроками и следующим шагом.',
    closeLabel: 'Закрыть форму',
    topicsLabel: 'Что нужно',
    topics: [
      { id: 'website', label: 'Сайт' },
      { id: 'brand', label: 'Бренд/айдентика' },
      { id: 'product', label: 'Продукт/UI' },
      { id: 'other', label: 'Другое' },
    ] as FeedbackTopic[],
    fields: {
      name: 'Имя',
      contact: 'Email или Telegram',
      contactHelper: 'Например, name@mail.ru или @username',
      message: 'Сообщение',
      messageHelper: 'Что делаем, для кого и к какому сроку',
      honeypot: 'Не заполняйте это поле',
    },
    errors: {
      summary: 'Проверьте поля:',
      nameRequired: 'Укажите имя',
      contactRequired: 'Укажите email или Telegram',
      contactInvalid: 'Нужен email (name@mail.ru), Telegram-ник (@username) или ссылка t.me',
      messageRequired: 'Напишите пару слов о задаче',
      messageShort: 'Слишком коротко — хотя бы 10 символов',
    },
    consent: 'Нажимая кнопку, вы соглашаетесь на обработку персональных данных',
    submit: 'Отправить',
    sending: 'Отправляю…',
    success: {
      title: 'Спасибо!',
      text: 'Сообщение отправлено. Отвечу в течение дня.',
      close: 'Закрыть',
    },
    failure: {
      title: 'Не получилось отправить',
      server: 'Сервис отправки ответил ошибкой.',
      timeout: 'Сервер не ответил вовремя.',
      network: 'Похоже, пропало соединение.',
      retry: 'Попробовать снова',
      fallback: 'Или напишите на почту:',
    },
    /** Labels used in the body of the fallback mailto letter. */
    mailBody: { name: 'Имя', contact: 'Контакт', topic: 'Тема', message: 'Сообщение' },
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
  clients: {
    eyebrow: 'CLIENTS',
    title: 'Trusted by',
    text: 'Companies and teams I have launched brands, websites and products with.',
    listLabel: 'Clients',
  },
  about: {
    eyebrow: 'ABOUT',
    title: ['More than', 'design'],
    text: '12+ years in design, product development and visual communication. I bring strategy, design and technology together to build products that deliver real value.',
    more: 'Learn more',
    stats: [
      { kind: 'number', value: 12, suffix: '+', label: 'YEARS IN DESIGN' },
      { kind: 'number', value: 50, suffix: '+', label: 'PROJECTS' },
      { kind: 'number', value: 3, suffix: '', label: 'COUNTRIES' },
      { kind: 'infinity', label: 'IDEAS IN MOTION' },
    ],
    infinityLabel: 'infinity',
    quote: ['Good design makes', 'the complex clear', 'and the possible closer.'],
    cta: ["LET'S CREATE", 'SOMETHING', 'TOGETHER'],
    ctaLabel: "Let's create something together — open the contact form",
  },
  feedback: {
    dialogLabel: 'Contact form',
    eyebrow: 'CONTACT',
    title: "Let's talk",
    subtitle: "A few words about the task — and I'll come back with ideas, timing and the next step.",
    closeLabel: 'Close form',
    topicsLabel: 'What you need',
    topics: [
      { id: 'website', label: 'Website' },
      { id: 'brand', label: 'Brand identity' },
      { id: 'product', label: 'Product/UI' },
      { id: 'other', label: 'Other' },
    ],
    fields: {
      name: 'Name',
      contact: 'Email or Telegram',
      contactHelper: 'E.g. name@mail.com or @username',
      message: 'Message',
      messageHelper: 'What we are building, for whom and by when',
      honeypot: 'Leave this field empty',
    },
    errors: {
      summary: 'Please check:',
      nameRequired: 'Enter your name',
      contactRequired: 'Enter an email or Telegram',
      contactInvalid: 'Use an email (name@mail.com), a Telegram handle (@username) or a t.me link',
      messageRequired: 'Write a few words about the task',
      messageShort: 'Too short — at least 10 characters',
    },
    consent: 'By clicking the button, you agree to the processing of your personal data',
    submit: 'Send',
    sending: 'Sending…',
    success: {
      title: 'Thank you!',
      text: "Your message is on its way. I'll reply within a day.",
      close: 'Close',
    },
    failure: {
      title: "Couldn't send",
      server: 'The delivery service returned an error.',
      timeout: 'The server took too long to respond.',
      network: 'Looks like the connection dropped.',
      retry: 'Try again',
      fallback: 'Or email me directly:',
    },
    mailBody: { name: 'Name', contact: 'Contact', topic: 'Topic', message: 'Message' },
  },
  footer: {
    wordmark: 'SIMAKOV',
    copyright: '© 2026',
    center: 'DESIGN. PRODUCTS. IDEAS.',
    links: footerLinks,
  },
}

export const content: Record<Lang, Content> = { ru, en }
