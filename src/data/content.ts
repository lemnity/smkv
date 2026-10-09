/**
 * All page copy lives here in two dictionaries with the same shape: `ru` and `en`.
 * Shared, non-translatable data (contacts, URLs, images, numbers) is defined once below
 * and reused by both dictionaries. Components read the current dictionary via `useLang().t`.
 */
import { BASE } from '../utils/base'

export type Lang = 'ru' | 'en'
export const LANGS: readonly Lang[] = ['ru', 'en']

export const contacts = {
  email: 'CHANGE-ME@example.com',
  telegram: 'https://t.me/',
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
  /** External site; omit while the project has no public link (the card shows no arrow). */
  url?: string
  /**
   * Original logo. A wordmark replaces the typed title; `mark: true` (a symbol without
   * lettering) is shown in its own colours next to the title instead.
   */
  logo?: { src: string; width: number; height: number; mark?: boolean }
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
    logo: { src: `${BASE}clients/lemnity.svg`, width: 375, height: 95 },
    image: { src: `${BASE}assets/lemnity-concept.png`, width: 466, height: 407, crop: { x: 0, y: 176, w: 466, h: 216 }, focus: [0.4, 0.5] },
    url: 'https://lemnity.ru',
  },
  tumtipb: {
    id: 'tumtipb',
    number: '02',
    title: 'Дом науки и техники',
    logo: { src: `${BASE}assets/dom-nauki-mark.webp`, width: 128, height: 160, mark: true },
    image: { src: `${BASE}assets/dom-nauki-site.webp`, width: 1200, height: 750, crop: { x: 0, y: 0, w: 1200, h: 750 }, focus: [0.72, 0.4] },
    url: 'https://new.tumtipb.ru',
  },
  prostyle: {
    id: 'prostyle',
    number: '03',
    title: 'ProStyle',
    logo: { src: `${BASE}clients/prostyle.svg`, width: 340, height: 92 },
    image: { src: `${BASE}assets/prostyle-site.webp`, width: 1200, height: 750, crop: { x: 0, y: 0, w: 1200, h: 750 }, focus: [0.6, 0.45] },
  },
  sphagnum: {
    id: 'sphagnum',
    number: '04',
    title: 'Sphagnum AE',
    image: { src: `${BASE}assets/sphagnum-concept.webp`, width: 1200, height: 750, crop: { x: 0, y: 0, w: 1200, h: 750 }, focus: [0.9, 0.45] },
    url: 'https://lemnity.github.io/sphgnm/',
  },
} satisfies Record<string, Omit<Project, 'description' | 'tags'>>

/** Language-independent hero data. */
const heroBase = {
  portrait: `${BASE}assets/portrait-hero.png`,
  signature: 'Simakov',
}

const footerLinks = [
  { label: 'TELEGRAM', href: contacts.telegram },
  // Opens the feedback form modal instead of following the mailto link.
  { label: 'EMAIL', href: mailto, feedback: true },
]

const drawerContacts = [
  { key: 'telegram', label: 'Telegram', href: contacts.telegram, external: true },
  // Opens the feedback form modal (see src/components/feedback).
  { key: 'email', label: contacts.email, href: mailto, external: false, feedback: true },
]

/* ------------------------------------------------------------------ RU */

const ru = {
  /** <title>, meta description and Open Graph (applied at runtime on language change). */
  meta: {
    title: 'SIMAKOOV — разработка сайтов и UI/UX дизайн, Тюмень',
    description:
      'Александр Симаков (SIMAKOOV): разработчик и UI/UX дизайнер из Тюмени. Сайты, веб-приложения, интерфейсы и бренды. 12+ лет, 50+ проектов. Работаю удалённо.',
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
    { label: 'УСЛУГИ', href: '#services' },
    { label: 'ПРОЕКТЫ', href: '#work' },
    { label: 'РАБОТЫ', href: '#gallery' },
    { label: 'ОБО МНЕ', href: '#about' },
    { label: 'КОНТАКТЫ', href: '#contact' },
  ],
  loader: {
    label: 'Загрузка сайта SIMAKOOV',
  },
  header: {
    wordmark: 'SIMAKOOV',
    tagline: ['СОЗДАВАТЬ', 'БОЛЬШЕ, ЧЕМ ОЖИДАЮТ'],
    homeLabel: 'SIMAKOOV — наверх',
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
    side: { top: ['ИДЕИ', 'ПРОДУКТЫ', 'ЛЮДИ'], est: 'С', year: '1991' },
    signatureLabel: 'АЛЕКСАНДР СИМАКОВ',
    places: ['ТЮМЕНЬ', 'РОССИЯ', 'ВЕСЬ МИР'],
    eyebrow: 'РАЗРАБОТЧИК · UI/UX ДИЗАЙНЕР · ПРОДЮСЕР · ОСНОВАТЕЛЬ',
    /** Three heading lines; the last one is accented. */
    lines: ['Делаю', 'сложное', 'простым.'],
    text: 'Создаю цифровые продукты, бренды и пользовательские опыты, которые помогают людям и бизнесу расти.',
    cta: 'Смотреть работы',
    write: 'Написать мне',
    portraitAlt: 'Александр Симаков',
  },
  projects: {
    title: 'Избранные проекты',
    text: 'Продукты, бренды и цифровые решения, которые делают идеи реальностью.',
    prevLabel: 'Предыдущий проект',
    nextLabel: 'Следующий проект',
    openLabel: 'Открыть проект',
    /** Shown instead of the arrow on projects without a public link yet. */
    soonLabel: 'Скоро',
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
      {
        ...projectBase.sphagnum,
        description: 'Живые субстраты для зелёных крыш, вертикальных садов и интерьеров',
        tags: ['Сайт', 'Эко', 'B2B'],
      },
    ] as Project[],
  },
  gallery: {
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
    title: 'Мне доверяют',
    text: 'Компании и команды, с которыми мы запускали бренды, сайты и продукты.',
    listLabel: 'Клиенты',
  },
  services: {
    title: 'Чем я занимаюсь',
    text: 'Сайты, интерфейсы, бренды и цифровые продукты — от идеи до запуска.',
    deliverablesLabel: 'Что входит',
    items: [
      {
        title: 'Разработка сайтов и веб-приложений',
        text: 'Делаю сайты и веб-приложения, которые быстро загружаются и понятны с первого экрана. Беру на себя и дизайн, и код, поэтому в проекте нет разрыва между макетом и тем, что получилось. Подходит для компаний, сервисов и образовательных платформ.',
        deliverables: ['корпоративный сайт или сервис', 'адаптивная вёрстка для телефона и компьютера', 'личные кабинеты и формы'],
      },
      {
        title: 'UI/UX-дизайн интерфейсов',
        text: 'Проектирую интерфейсы, в которых пользователь не думает, куда нажать. Начинаю с сценариев и структуры, затем рисую макеты и прототип. Результат передаю в виде, удобном для разработки.',
        deliverables: ['структура и пользовательские сценарии', 'прототип', 'макеты экранов', 'дизайн-система и UI-кит', 'передача макетов в разработку'],
      },
      {
        title: 'Лендинги и интернет-магазины',
        text: 'Делаю страницы, которые ведут посетителя к одному действию, и магазины, где удобно выбирать и покупать. Работаю над текстовой структурой, визуалом и скоростью. Примеры из практики: сайт ProStyle (корпоративные подарки и сувениры, Тюмень).',
        deliverables: ['лендинг или многостраничный сайт', 'интернет-магазин с каталогом и корзиной', 'форма заявки', 'адаптивная версия'],
      },
      {
        title: 'Брендинг и айдентика',
        text: 'Помогаю бренду выглядеть цельно: от логотипа до сайта и мерча. Сначала формулируем, чем вы отличаетесь, потом превращаем это в визуальный язык. Всё собирается в правила, которыми удобно пользоваться команде.',
        deliverables: ['логотип и знак', 'цвета, шрифты, стиль', 'фирменные носители и мерч', 'гайд по использованию', 'оформление сайта в стиле бренда'],
      },
      {
        title: 'Цифровой продукт и MVP',
        text: 'Помогаю превратить идею в работающий продукт: от гипотезы и прототипа до первой версии. Как продюсер я знаю, что на старте важно, а что можно отложить. Среди моих проектов — Lemnity, платформа для создания сайтов, чат-ботов и цифровых продуктов.',
        deliverables: ['уточнение идеи и состава первой версии', 'кликабельный прототип', 'дизайн и разработка MVP', 'план развития продукта', 'запуск и первые доработки'],
      },
    ],
    process: {
      title: 'Как я работаю',
      steps: [
        { title: 'Знакомство и задача', text: 'Вы рассказываете о задаче, аудитории и сроках. Я задаю вопросы и честно говорю, что реально, а что лучше убрать.' },
        { title: 'Структура и концепция', text: 'Собираю структуру, сценарии и первую концепцию. Согласуем направление до того, как появится детальная работа.' },
        { title: 'Дизайн и прототип', text: 'Рисую макеты и кликабельный прототип. Вы видите, как продукт будет работать, и вносите правки на раннем этапе.' },
        { title: 'Разработка', text: 'Верстаю и программирую. Промежуточные версии показываю по ходу, а не в конце.' },
        { title: 'Запуск и поддержка', text: 'Проверяю на разных устройствах, запускаю и остаюсь на связи для доработок.' },
      ],
    },
  },
  faq: {
    title: 'Частые вопросы',
    items: [
      { q: 'Сколько времени занимает проект?', a: 'Зависит от объёма: лендинг делается быстрее, чем сервис с личным кабинетом. После короткого знакомства с задачей я называю реалистичный срок и этапы, а не общую цифру «на глаз».' },
      { q: 'Сколько это стоит?', a: 'Стоимость зависит от задачи, объёма и сроков, поэтому фиксированных цен на сайте нет. Напишите, что нужно сделать, и я оценю проект и расскажу, из чего складывается цена.' },
      { q: 'На каких технологиях вы работаете?', a: 'Выбираю инструмент под задачу, а не наоборот. Этот сайт, например, сделан на React и TypeScript. Если нужен готовый конструктор или другая платформа, подберём подходящее решение.' },
      { q: 'Вы работаете удалённо?', a: 'Да. Я живу в Тюмени, а работаю с клиентами из разных городов и стран. Общаемся в удобном вам мессенджере или по видео.' },
      { q: 'Кто будет делать проект: вы лично?', a: 'Да, с вами работаю я сам: и дизайн, и разработка, и организация процесса.' },
      { q: 'Поддерживаете ли вы сайт после запуска?', a: 'Да. После запуска я остаюсь на связи: исправляю недочёты, дорабатываю и развиваю проект. Формат поддержки обсуждаем заранее.' },
    ],
  },
  about: {
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
  /** Floating call-to-action shown while scrolling. */
  floatingCta: {
    label: 'Заказать проект',
  },
  feedback: {
    dialogLabel: 'Форма обратной связи',
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
    wordmark: 'SIMAKOOV',
    copyright: '© 2026',
    center: 'ДИЗАЙН. ПРОДУКТЫ. ИДЕИ.',
    links: footerLinks,
  },
}

export type Content = typeof ru

/* ------------------------------------------------------------------ EN */

const en: Content = {
  meta: {
    title: 'SIMAKOOV — web developer & UI/UX designer, Tyumen',
    description:
      'Alexander Simakov (SIMAKOOV): developer and UI/UX designer from Tyumen. Websites, web apps, interfaces and brands. 12+ years, 50+ projects. Remote worldwide.',
    ogDescription: 'I build digital products, brands and user experiences that help people and businesses grow.',
    ogLocale: 'en_US',
    ogImageAlt: 'Alexander Simakov',
  },
  langSwitch: {
    label: 'Язык / Language',
    names: { ru: 'Русский', en: 'English' },
  },
  nav: [
    { label: 'SERVICES', href: '#services' },
    { label: 'PROJECTS', href: '#work' },
    { label: 'WORK', href: '#gallery' },
    { label: 'ABOUT', href: '#about' },
    { label: 'CONTACT', href: '#contact' },
  ],
  loader: {
    label: 'Loading SIMAKOOV',
  },
  header: {
    wordmark: 'SIMAKOOV',
    tagline: ['CREATING', 'BEYOND EXPECTATIONS'],
    homeLabel: 'SIMAKOOV — back to top',
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
    side: { top: ['IDEAS', 'PRODUCTS', 'PEOPLE'], est: 'EST.', year: '1991' },
    signatureLabel: 'ALEXANDER SIMAKOV',
    places: ['TYUMEN', 'RUSSIA', 'WORLDWIDE'],
    eyebrow: 'DEVELOPER · UI/UX DESIGNER · PRODUCER · FOUNDER',
    lines: ['Complex,', 'made', 'simple.'],
    text: 'I build digital products, brands and user experiences that help people and businesses grow.',
    cta: 'View my work',
    write: 'Get in touch',
    portraitAlt: 'Alexander Simakov',
  },
  projects: {
    title: 'Featured projects',
    text: 'Products, brands and digital solutions that turn ideas into reality.',
    prevLabel: 'Previous project',
    nextLabel: 'Next project',
    openLabel: 'Open project',
    soonLabel: 'Coming soon',
    items: [
      {
        ...projectBase.lemnity,
        description: 'A platform for building websites, chatbots and digital products',
        tags: ['SaaS', 'Site builder', 'AI', 'Product'],
      },
      {
        ...projectBase.tumtipb,
        title: 'House of Science and Technology',
        description: 'An education platform for professionals',
        tags: ['Education', 'Website', 'Public sector'],
      },
      {
        ...projectBase.prostyle,
        description: 'Branded merchandise and corporate gifts',
        tags: ['Brand', 'E-commerce', 'Design'],
      },
      {
        ...projectBase.sphagnum,
        description: 'Living substrates for green roofs, vertical gardens and interiors',
        tags: ['Website', 'Eco', 'B2B'],
      },
    ],
  },
  gallery: {
    title: 'Gallery',
    text: 'Branding, interfaces, websites and merch — a selection of work from over the years.',
    openLabel: 'Open work',
    dialogLabel: 'Viewing work',
    closeLabel: 'Close viewer',
    prevLabel: 'Previous work',
    nextLabel: 'Next work',
  },
  clients: {
    title: 'Trusted by',
    text: 'Companies and teams I have launched brands, websites and products with.',
    listLabel: 'Clients',
  },
  services: {
    title: 'What I do',
    text: 'Websites, interfaces, brands and digital products — from idea to launch.',
    deliverablesLabel: 'What is included',
    items: [
      {
        title: 'Websites and web apps',
        text: 'I build websites and web apps that load fast and make sense from the first screen. I handle both design and code, so nothing gets lost between the mockup and the result. Suitable for companies, services and educational platforms.',
        deliverables: ['a company site or service', 'responsive layout for phone and desktop', 'accounts and forms'],
      },
      {
        title: 'UI/UX design',
        text: 'I design interfaces where the user never has to wonder where to click. I start with scenarios and structure, then move to mockups and a prototype. You get a result that is ready for development.',
        deliverables: ['structure and user flows', 'a prototype', 'screen mockups', 'a design system and UI kit', 'handoff to development'],
      },
      {
        title: 'Landing pages and online stores',
        text: 'I make pages that lead a visitor to one action, and stores that are easy to browse and buy from. I work on content structure, visuals and speed. From my work: the ProStyle site (corporate gifts and souvenirs, Tyumen).',
        deliverables: ['a landing page or multi-page site', 'an online store with catalog and cart', 'a request form', 'a responsive version'],
      },
      {
        title: 'Branding and identity',
        text: 'I help a brand look coherent, from the logo to the website and merch. First we pin down what makes you different, then turn that into a visual language. Everything is collected into rules your team can actually use.',
        deliverables: ['a logo and mark', 'colors, type and style', 'branded materials and merch', 'a usage guide', "a website in the brand's style"],
      },
      {
        title: 'Digital product and MVP',
        text: 'I help turn an idea into a working product, from hypothesis and prototype to a first version. As a producer I know what matters at the start and what can wait. Among my projects is Lemnity, a platform for building sites, chatbots and digital products.',
        deliverables: ['clarifying the idea and the scope of version one', 'a clickable prototype', 'MVP design and development', 'a product roadmap', 'launch and first improvements'],
      },
    ],
    process: {
      title: 'How I work',
      steps: [
        { title: 'Brief', text: 'You tell me about the task, the audience and the deadline. I ask questions and say honestly what is realistic and what is better left out.' },
        { title: 'Concept', text: 'I put together the structure, flows and a first concept. We agree on a direction before detailed work begins.' },
        { title: 'Design', text: 'I draw the mockups and a clickable prototype. You see how the product will work and can make changes early.' },
        { title: 'Build', text: 'I code the layout and logic. I show intermediate versions along the way, not only at the end.' },
        { title: 'Launch and support', text: 'I test on different devices, launch and stay in touch for improvements.' },
      ],
    },
  },
  faq: {
    title: 'FAQ',
    items: [
      { q: 'How long does a project take?', a: 'It depends on scope: a landing page takes less time than a service with user accounts. After a short brief I give a realistic timeline and stages, not a ballpark guess.' },
      { q: 'How much does it cost?', a: 'The cost depends on the task, scope and deadline, so there are no fixed prices on the site. Tell me what you need, and I will estimate the project and explain what the price is made of.' },
      { q: 'What technologies do you use?', a: 'I choose tools to fit the task, not the other way round. This site, for example, is built with React and TypeScript. If you need a ready-made builder or another platform, we will find the right fit.' },
      { q: 'Do you work remotely?', a: 'Yes. I am based in Tyumen and work with clients from different cities and countries. We can talk in your preferred messenger or by video.' },
      { q: 'Will you do the work yourself?', a: 'Yes, you work with me directly on design, development and project management.' },
      { q: 'Do you support the site after launch?', a: 'Yes. After launch I stay in touch: I fix issues, and improve and grow the project. We agree on the format of support in advance.' },
    ],
  },
  about: {
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
  floatingCta: {
    label: 'Order a project',
  },
  feedback: {
    dialogLabel: 'Contact form',
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
    wordmark: 'SIMAKOOV',
    copyright: '© 2026',
    center: 'DESIGN. PRODUCTS. IDEAS.',
    links: footerLinks,
  },
}

export const content: Record<Lang, Content> = { ru, en }
