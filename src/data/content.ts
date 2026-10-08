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

export const header = {
  wordmark: 'SIMAKOV',
  tagline: ['СОЗДАВАТЬ', 'БОЛЬШЕ, ЧЕМ ОЖИДАЮТ'],
}

export const hero = {
  eyebrow: 'ДИЗАЙНЕР · ПРОДЮСЕР · ОСНОВАТЕЛЬ',
  lines: ['Делаю', 'сложное', 'простым.'],
  text: 'Создаю цифровые продукты, бренды и пользовательские опыты, которые помогают людям и бизнесу расти.',
  cta: 'Смотреть работы',
  write: 'Написать мне',
  portrait: '/assets/portrait-hero.png',
  side: { top: ['IDEAS', 'PRODUCTS', 'PEOPLE'], est: 'EST.', year: '1991' },
  signature: 'Simakov',
  signatureLabel: 'ALEXANDER SIMAKOV',
  places: ['TYUMEN', 'RUSSIA', 'WORLDWIDE'],
}

export interface Project {
  id: string
  number: string
  title: string
  description: string
  tags: string[]
  image: string
  url: string
}

export const projects = {
  eyebrow: 'ПОРТФОЛИО',
  title: 'Избранные проекты',
  text: 'Продукты, бренды и цифровые решения, которые делают идеи реальностью.',
  items: [
    {
      id: 'lemnity',
      number: '01',
      title: 'Lemnity',
      description: 'Платформа для создания сайтов, чат-ботов и цифровых продуктов',
      tags: ['SaaS', 'Конструктор', 'AI', 'Продукт'],
      image: '/assets/lemnity-concept.png',
      url: 'https://lemnity.ru',
    },
    {
      id: 'tumtipb',
      number: '02',
      title: 'Tumtipb',
      description: 'Образовательная платформа для профессионалов',
      tags: ['Образование', 'Сайт', 'Гос. сектор'],
      image: '/assets/tumtipb-concept.png',
      url: 'https://tumtipb.ru',
    },
    {
      id: 'prostyle',
      number: '03',
      title: 'ProStyle',
      description: 'Сувенирная продукция и корпоративные подарки',
      tags: ['Бренд', 'Интернет-магазин', 'Дизайн'],
      image: '/assets/prostyle-concept.png',
      url: 'https://prostyle.gifts',
    },
  ] as Project[],
}

export const about = {
  eyebrow: 'ОБО МНЕ',
  title: ['Больше, чем', 'дизайн'],
  text: '12+ лет опыта в дизайне, продуктовой разработке и визуальных коммуникациях. Объединяю стратегию, дизайн и технологии, чтобы создавать продукты с реальной ценностью.',
  more: 'Узнать больше',
  stats: [
    { value: 12, suffix: '+', label: 'ЛЕТ ОПЫТА' },
    { value: 50, suffix: '+', label: 'ПРОЕКТОВ' },
    { value: 3, suffix: '', label: 'СТРАНЫ' },
    { value: null, suffix: '', label: 'ИДЕЙ В РАБОТЕ' },
  ],
  quote: ['Хороший дизайн делает', 'сложное понятным,', 'а возможное — ближе.'],
  cta: ['ДАВАЙТЕ', 'СОЗДАДИМ', 'ЧТО-ТО ВМЕСТЕ'],
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
