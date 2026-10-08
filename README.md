# SIMAKOV — личный сайт

Одностраничный сайт-портфолио: обложка, избранные проекты, «Обо мне», контакты.

## Стек

- [Vite](https://vite.dev) + React + TypeScript
- [MUI](https://mui.com) (`@mui/material`, `@mui/icons-material`, Emotion) — вёрстка, компоненты, иконки, единая тема в `src/theme.ts`
- [Motion](https://motion.dev) (`motion/react`) — анимации; учитывается системная настройка «уменьшить движение»
- Шрифты подключены локально через `@fontsource`: Onest, Cormorant Garamond, Great Vibes

## Запуск

Нужен Node.js 20.19+ (или 22.12+).

```bash
npm install       # установить зависимости
npm run dev       # режим разработки: http://localhost:5173
npm run build     # проверка типов + production-сборка в папку dist/
npm run preview   # локальный просмотр собранной версии из dist/
```

Для публикации загрузите содержимое `dist/` на любой статический хостинг.

## Где править тексты

Все тексты, ссылки и контакты собраны в одном файле: **`src/data/content.ts`**
(меню, обложка, проекты, блок «Обо мне», цифры, цитата, подвал).

- Цвета, шрифты и общие стили — `src/theme.ts`.
- Компоненты секций — `src/components/`.
- Мета-теги (заголовок вкладки, описание, Open Graph, favicon) — `index.html`.
- Изображения — `public/assets/` (в коде указываются как `/assets/имя-файла`).

## Что заменить перед публикацией

1. **Email** — `CHANGE-ME@example.com` в `src/data/content.ts` (`contacts.email`).
2. **Telegram** — сейчас `https://t.me/` без имени пользователя (`contacts.telegram`).
3. **Instagram** — сейчас `https://instagram.com/` без профиля (`contacts.instagram`).
4. **Изображения проектов** — `public/assets/tumtipb-concept.png` и `prostyle-concept.png` вырезаны из макета и имеют ширину всего 282 px (на больших экранах выглядят мягко), `lemnity-concept.png` — тоже фрагмент концепта. На них есть надписи из макета — это не настоящие скриншоты сайтов. Замените на реальные изображения кейсов (рекомендуется от 1200 px по ширине).
   - **Важно:** у каждого проекта в `src/data/content.ts` есть поле `image` с `width`, `height` и `crop`. Поле `crop` обрезает надписи и рамки, «впечатанные» в концепт. При замене картинки укажите новые `width`/`height` и сбросьте `crop` на всё изображение: `crop: { x: 0, y: 0, w: <width>, h: <height> }`. При необходимости поправьте `focus` (точка фокуса 0–1 по X и Y).
5. **Портрет** — `public/assets/portrait-hero.png` имеет размер 344×572 px и тоже вырезан из макета. Желательно заменить на фото в 2–3 раза крупнее с теми же пропорциями и тёмным фоном. Если имя файла изменится, обновите `hero.portrait` в `content.ts` и строку `preload` в `index.html`.
6. **Open Graph** — в `index.html` картинка для превью ссылок указана относительным путём `/assets/portrait-hero.png`. Многие соцсети требуют абсолютный URL: после выбора домена замените на `https://ваш-домен/assets/...` и, по возможности, используйте отдельную картинку 1200×630.
7. Проверьте тексты, цифры («12+ лет», «50+ проектов» и т. д.), названия и ссылки проектов.

## Прочее

- `public/assets/full-design-reference.png` — утверждённый визуальный референс макета.
- `public/assets/portrait-original.jpg`, `portrait-new.jpg` — исходные фотографии.
- Сборка разбивает JS на отдельные чанки (`react`, `mui`, `motion`, код сайта) — см. `vite.config.ts`.
- Прелоадер (`src/components/Loader.tsx`): внутри букв «SIMAKOOV» текут волнистые полосы акцентного цвета; держится, пока не загрузится страница (не меньше ~2,6 с, не больше 6 с); при включённом «уменьшении движения» не показывается. Эффект основан на [The Xandali Effect](https://codepen.io/grayghostvisuals/pen/pjbNQY) (Gray Ghost, MIT).
