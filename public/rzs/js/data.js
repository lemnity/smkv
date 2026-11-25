/* Контент страницы. Все факты — с rzs.ru (главная, /reklama-na-radio/, /proizvodstvo-reklamy/,
   /kontakty/, /novosti/). Ничего не выдумываем: если данных нет, поле пустое. */
window.RZS = window.RZS || {};

/* stream: URL прямого эфира (MP3 / AAC / HLS). Пока потоков нет — null, плеер работает в демо-режиме. */
RZS.STATIONS = [
  {
    id: 'novoe', f: 87.9, name: 'Новое радио', color: '#2FE3B0',
    logo: 'assets/logos/novoe.webp', site: 'https://newradio.ru', siteLabel: 'newradio.ru',
    stream: null,
    format: 'Хиты и горячие новинки',
    tagline: 'Лучшие проверенные хиты, самые горячие новинки и весёлые шоу.',
    details: 'Микс суперновинок и любимых суперхитов от ярких и актуальных артистов. В эфире «1+1. Шоу Калинина и Райтрауна» и хит-парад «Высшая лига».',
    figs: [],
    synth: { bpm: 124, wave: 'square', notes: [69, 72, 76, 79, 76, 72, 74, 77] },
  },
  {
    id: 'europa', f: 101.8, name: 'Европа Плюс', color: '#4C82FF',
    logo: 'assets/logos/europa.webp', site: 'https://europaplus.ru', siteLabel: 'europaplus.ru',
    stream: null,
    format: 'Радио № 1 в Тюмени',
    tagline: 'Первое место в Тюмени по дневной, недельной и месячной аудитории в категории 12+.',
    details: 'Мощный бренд с европейскими корнями. Отрыв от ближайшего конкурента — больше 40 000 слушателей в день. Ядро аудитории — 20–39 лет: люди, которые следят за модой в музыке, развлечениях и покупках.',
    figs: [['122 100', 'слушателей в день'], ['267 000', 'в неделю'], ['321 300', 'в месяц']],
    synth: { bpm: 120, wave: 'sawtooth', notes: [64, 67, 71, 74, 71, 67, 69, 72] },
  },
  {
    id: 'armiya', f: 104.6, name: 'Красная Армия', color: '#FF4A3D',
    logo: 'assets/logos/armiya.webp', site: 'https://rzs.ru/reklama-na-radio/', siteLabel: 'портрет аудитории',
    stream: null,
    format: 'Локальная станция Тюмени',
    tagline: 'Масштабные ивенты, концерты артистов и диджеев, эфирные акции с ценными призами.',
    details: 'Аудитория 20–39 лет: активный образ жизни, карьера, спорт, путешествия, концерты. Стопроцентно локальный формат и нестандартные эфирные возможности для рекламы.',
    figs: [['19 800', 'слушают 3–4 раза в неделю'], ['8 место', 'среди станций Тюмени, 12+']],
    synth: { bpm: 100, wave: 'triangle', notes: [62, 62, 69, 62, 65, 65, 69, 74] },
  },
  {
    id: 'retro', f: 105.1, name: 'Ретро FM', color: '#FF4FA3',
    logo: 'assets/logos/retro.webp', site: 'https://retrofm.ru', siteLabel: 'retrofm.ru',
    stream: null,
    format: 'Аудитория 30+',
    tagline: 'Очень лояльная аудитория: пик интереса держится весь день, с 7:00 до 21:00.',
    details: 'Больше 66% слушателей — семейные, около 64% с высшим образованием, 67% работают, из них около половины — в офисе. В прайм-тайм станцию слушают 5 500 человек.',
    figs: [['59 000', 'слушателей в день'], ['158 600', 'в неделю'], ['219 600', 'в месяц']],
    synth: { bpm: 112, wave: 'triangle', notes: [60, 64, 67, 72, 70, 67, 64, 67] },
  },
  {
    id: 'doroga', f: 107.0, name: 'Дорожное радио', color: '#FFC23D',
    logo: 'assets/logos/doroga.webp', site: 'https://dorognoe.ru', siteLabel: 'dorognoe.ru',
    stream: null,
    format: 'Аудитория 40+',
    tagline: 'Вещание в 12 городах Тюменской области, ХМАО и ЯНАО — охват трёх регионов без посредников.',
    details: 'Вторая станция России по охвату ежедневной аудитории. 66,6% слушателей работают, 59,5% с высшим образованием, 84,7% с доходом не ниже среднего.',
    figs: [['55 700', 'слушателей в день'], ['154 700', 'в неделю'], ['12', 'городов вещания']],
    synth: { bpm: 96, wave: 'sawtooth', notes: [55, 59, 62, 67, 62, 59, 64, 62] },
  },
];

/* Масштаб холдинга. «27 лет» и «около 2 млн» — с главной rzs.ru; «900 000 ежедневно» — с /reklama-na-radio/. */
RZS.FACTS = [
  { value: 5, label: 'радиостанций' },
  { value: 10, label: 'городов вещания' },
  { value: 900, suffix: ' тыс.', label: 'слушателей ежедневно' },
  { value: 27, label: 'лет на медиарынке' },
];

/* Координаты — центры точек на карте rzs.ru (viewBox 0 0 554 726). */
RZS.CITIES = [
  { name: 'Тюмень', region: 'Тюменская область', x: 141, y: 670, hq: true },
  { name: 'Тобольск', region: 'Тюменская область', x: 166, y: 604 },
  { name: 'Ханты-Мансийск', region: 'ХМАО — Югра', x: 192, y: 486 },
  { name: 'Нягань', region: 'ХМАО — Югра', x: 112, y: 432 },
  { name: 'Мегион', region: 'ХМАО — Югра', x: 288, y: 458 },
  { name: 'Когалым', region: 'ХМАО — Югра', x: 266, y: 422 },
  { name: 'Ноябрьск', region: 'ЯНАО', x: 300, y: 384 },
  { name: 'Надым', region: 'ЯНАО', x: 236, y: 300 },
  { name: 'Новый Уренгой', region: 'ЯНАО', x: 323, y: 258 },
  { name: 'Салехард', region: 'ЯНАО', x: 148, y: 272 },
];

RZS.NEWS = [
  { date: '2026-11-24', title: 'Выигрывайте пригласительные на концерт группы «Краски» в Тюмени', tag: 'Розыгрыш', station: 'retro', img: 'assets/img/news-kraski.jpg', url: 'https://rzs.ru/vyigryvajte-priglasitelnye-na-koncert-gruppy-kraski-v-tjumeni/' },
  { date: '2026-11-23', title: 'Концерт группы «Рок-Острова»', tag: 'Концерт', station: 'retro', img: 'assets/img/news-rok-ostrova.webp', url: 'https://rzs.ru/koncert-gruppy-rok-ostrova/' },
  { date: '2026-11-19', title: 'Европа Плюс Тюмень продолжает сезон игры «Фан Зона»: впереди Коста Лакоста', tag: 'Акция', station: 'europa', img: 'assets/img/news-fan-zona.webp', url: 'https://rzs.ru/evropa-pljus-tjumen-prodolzhaet-sezon-igry-fan-zona-vperedi-kosta-lakosta/' },
  { date: '2026-11-17', title: 'Ретро FM запускает акцию «Ёлка в каждый дом»', tag: 'Акция', station: 'retro', img: 'assets/img/news-retro-elka.webp', url: 'https://rzs.ru/retro-fm-zapuskaet-akciju-jolka-v-kazhdyj-dom/' },
  { date: '2026-11-17', title: 'Вечеринка Ретро FM Тюмень', tag: 'Событие', station: 'retro', img: 'assets/img/news-retro-party.webp', url: 'https://rzs.ru/vecherinka-retro-fm-tjumen/' },
  { date: '2026-11-16', title: 'Счастливый номер на Дорожном радио в Тюмени', tag: 'Акция', station: 'doroga', img: 'assets/img/news-doroga-nomer.webp', url: 'https://rzs.ru/schastlivyj-nomer-na-dorozhnom-radio-v-tjumeni/' },
  { date: '2026-11-16', title: 'Розыгрыш двух парных билетов на концерт SULA FRAY', tag: 'Розыгрыш', url: 'https://rzs.ru/rozygrysh-dvuh-parnyh-biletov-na-koncert-sula-fray/' },
  { date: '2026-11-05', title: 'КиноКайф: «Рокки — это я» на Европе Плюс Тюмень', tag: 'Проект', station: 'europa', img: 'assets/img/news-kinokaif.webp', url: 'https://rzs.ru/kinokajf-rokki-jeto-ja-na-evrope-pljus-tjumen/' },
  { date: '2026-10-23', title: 'XIV Народная премия «Звёзды Дорожного радио»: любимые артисты, душевные песни и грандиозное шоу', tag: 'Событие', station: 'doroga', url: 'https://rzs.ru/xiv-narodnaja-premija-zvjozdy-dorozhnogo-radio-ljubimye-artisty-dushevnye-pesni-i-grandioznoe-shou/' },
];

RZS.CONTACTS = {
  address: 'Тюмень, ул. Республики, 211а, 7-й этаж',
  hours: 'По будням с 10:00 до 18:00',
  departments: [
    { name: 'Отдел рекламы', phone: '+7 (3452) 68-82-12', tel: '+73452688212', email: 'reklama@rzs.ru' },
    { name: 'Рекламная служба', phone: '+7 (3452) 68-82-24', tel: '+73452688224', email: 'reklama@rzs.ru' },
    { name: 'Общие вопросы', phone: '+7 (3452) 68-82-21', tel: '+73452688221', email: 'info@rzs.ru' },
    { name: 'Юридический отдел', email: 'law@rzs.ru' },
  ],
};
