/* Секции страницы: шапка, появление при скролле, счётчики, витрина станций, рекламодателям,
   новости, карта вещания, форма заявки. Зависит от data.js, map-data.js, audio.js, tuner.js. */
(() => {
  const { STATIONS: ST, FACTS, CITIES, NEWS, CONTACTS, MAP } = RZS;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const fmt = (n) => n.toLocaleString('ru-RU');
  const MONTHS = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
  const date = (iso) => { const [, m, d] = iso.split('-').map(Number); return `${d} ${MONTHS[m - 1]}`; };
  document.documentElement.classList.remove('no-js');

  /* ---------- header ---------- */
  const header = $('#header'), burger = $('#burger'), menu = $('#menu');
  const onScroll = () => header.classList.toggle('is-solid', scrollY > 24);
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  const setMenu = (open) => {
    burger.setAttribute('aria-expanded', String(open));
    header.classList.toggle('menu-open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  };
  burger.addEventListener('click', () => setMenu(burger.getAttribute('aria-expanded') !== 'true'));
  $$('a', menu).forEach((a) => a.addEventListener('click', () => setMenu(false)));
  addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

  $$('[data-go-tuner]').forEach((a) => a.addEventListener('click', () => RZS.Tuner.ensureTuned()));

  /* ---------- reveal + counters ---------- */
  const countUp = (el) => {
    const to = Number(el.dataset.count), dur = 1600, t0 = performance.now();
    if (reduce) { el.textContent = fmt(to); return; }
    (function step(now) {
      const p = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - p, 4);
      el.textContent = fmt(Math.round(to * e));
      if (p < 1) requestAnimationFrame(step);
    })(t0);
  };
  const io = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (!e.isIntersecting) return;
    e.target.classList.add('in');
    $$('[data-count]', e.target).forEach(countUp);
    io.unobserve(e.target);
  }), { rootMargin: '0px 0px -10% 0px' });
  const observe = (root = document) => $$('[data-reveal]', root).forEach((el) => io.observe(el));
  /* failsafe: anything already reached is shown even if a browser skipped the observer callback */
  let sweepQueued = false;
  const sweep = () => {
    sweepQueued = false;
    $$('[data-reveal]:not(.in)').forEach((el) => {
      if (el.getBoundingClientRect().top < innerHeight * .92) {
        el.classList.add('in');
        $$('[data-count]', el).forEach(countUp);
        io.unobserve(el);
      }
    });
  };
  addEventListener('scroll', () => { if (!sweepQueued) { sweepQueued = true; requestAnimationFrame(sweep); } }, { passive: true });
  addEventListener('load', sweep);

  /* ---------- facts ---------- */
  $('#facts').innerHTML = FACTS.map((f, i) => `
    <div class="fact" data-reveal style="--d:${i * .08}s">
      <b><span data-count="${f.value}">0</span>${f.suffix ? `<small>${esc(f.suffix)}</small>` : ''}</b><span>${esc(f.label)}</span>
    </div>`).join('');

  /* ---------- frequency ticker: an endless display strip, click tunes ---------- */
  const tick = $('#tickerTrack');
  const run = ST.map((s, i) => `
    <button class="tk" type="button" style="--c:${s.color}" data-i="${i}" tabindex="-1">
      <b>${s.f.toFixed(1)}</b>
      <span class="tk-logo"><img src="${s.logo}" alt="${esc(s.name)}" loading="lazy" decoding="async"></span>
    </button><i class="tk-sep" aria-hidden="true"></i>`).join('');
  tick.innerHTML = run + run;                                   // two copies → seamless loop at -50%
  $$('.tk', tick).forEach((b) => b.addEventListener('click', () => {
    RZS.Tuner.select(Number(b.dataset.i));
    $('#tuner').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  }));

  /* ---------- stations showcase (expanding panels, synced with the tuner) ---------- */
  const shelf = $('#shelf');
  shelf.innerHTML = ST.map((s, i) => `
    <article class="panel" style="--c:${s.color}" data-i="${i}">
      <button class="panel-head" type="button" aria-expanded="false" aria-controls="panel-${s.id}">
        <span class="panel-freq">${s.f.toFixed(1)}</span>
        <span class="panel-name">${esc(s.name)}</span>
      </button>
      <div class="panel-body" id="panel-${s.id}">
        <div class="panel-top">
          <span class="logo-plate"><img src="${s.logo}" alt="Логотип ${esc(s.name)}" loading="lazy" decoding="async"></span>
          <p class="panel-format">${esc(s.format)}</p>
        </div>
        <h3 class="panel-title">${esc(s.name)} <span>${s.f.toFixed(1)} FM</span></h3>
        <p class="panel-text">${esc(s.details)}</p>
        ${s.figs.length ? `<div class="panel-figs">${s.figs.map(([v, l]) => `<div><b>${esc(v)}</b><span>${esc(l)}</span></div>`).join('')}</div>` : ''}
        <div class="panel-actions">
          <a class="btn btn--station" href="#tuner" data-listen="${i}">Слушать в тюнере</a>
          <a class="btn btn--ghost" href="${s.site}" target="_blank" rel="noopener">${esc(s.siteLabel)}<span class="ext" aria-hidden="true">↗</span></a>
        </div>
      </div>
    </article>`).join('');
  const panels = $$('.panel', shelf);
  let openIdx = -1;
  function openPanel(i, fromTuner) {
    if (i === openIdx || i < 0) return;
    openIdx = i;
    panels.forEach((p, k) => {
      p.classList.toggle('is-open', k === i);
      $('.panel-head', p).setAttribute('aria-expanded', String(k === i));
    });
    if (!fromTuner) RZS.Tuner.select(i);
  }
  panels.forEach((p, i) => $('.panel-head', p).addEventListener('click', () => openPanel(i)));
  $$('[data-listen]', shelf).forEach((a) => a.addEventListener('click', () => {
    RZS.Tuner.select(Number(a.dataset.listen));
    if (!RZS.Radio.state.playing) RZS.Radio.play();
  }));
  RZS.Tuner.onChange((i) => { if (i >= 0) openPanel(i, true); });
  openPanel(1, true);

  /* ---------- CTA screen: equalizer bars, each with its own height and tempo ---------- */
  const eq = $('#ctaEq');
  if (eq) {
    const n = innerWidth < 600 ? 22 : 34;
    eq.innerHTML = Array.from({ length: n }, (_, i) => {
      const shape = .35 + .65 * Math.sin((i / n) * Math.PI);            // louder in the middle
      const h = Math.round((.3 + .7 * Math.random()) * shape * 100);
      return `<i style="--h:${Math.max(14, h)}%;--lo:${(.15 + Math.random() * .3).toFixed(2)};--dur:${(.45 + Math.random() * .7).toFixed(2)}s;--delay:${(-Math.random()).toFixed(2)}s"></i>`;
    }).join('');
  }

  /* ---------- news ---------- */
  const withImg = NEWS.filter((n) => n.img), noImg = NEWS.filter((n) => !n.img);
  const stName = (id) => (ST.find((s) => s.id === id) || {}).name;
  const stColor = (id) => (ST.find((s) => s.id === id) || {}).color || '#E2F04A';
  const card = (n, cls) => `
    <a class="news-card ${cls}" href="${n.url}" target="_blank" rel="noopener" data-reveal style="--c:${stColor(n.station)}">
      <span class="news-img"><img src="${n.img}" alt="" loading="lazy" decoding="async"></span>
      <span class="news-meta"><time datetime="${n.date}">${date(n.date)}</time><span class="news-tag">${esc(n.station ? stName(n.station) : n.tag)}</span></span>
      <span class="news-title">${esc(n.title)}</span>
    </a>`;
  $('#newsGrid').innerHTML =
    card(withImg[0], 'news-card--lead') +
    withImg.slice(1, 5).map((n) => card(n, '')).join('');
  $('#newsList').innerHTML = [...withImg.slice(5), ...noImg].map((n) => `
    <li data-reveal><a href="${n.url}" target="_blank" rel="noopener">
      <time datetime="${n.date}">${date(n.date)}</time>
      <span class="news-tag" style="--c:${stColor(n.station)}">${esc(n.station ? stName(n.station) : n.tag)}</span>
      <span class="news-line">${esc(n.title)}</span>
    </a></li>`).join('');

  /* ---------- geography map ---------- */
  const map = $('#mapSvg');
  map.setAttribute('viewBox', MAP.viewBox);
  const hq = CITIES.find((c) => c.hq);
  map.innerHTML = `
    <g class="regions">${MAP.regions.map((r) => `<path class="region" d="${r.d}" data-region="${esc(r.name)}"><title>${esc(r.name)}</title></path>`).join('')}</g>
    <g class="links">${CITIES.filter((c) => !c.hq).map((c) => `<line x1="${hq.x}" y1="${hq.y}" x2="${c.x}" y2="${c.y}" pathLength="1"/>`).join('')}</g>
    <g class="pulse" transform="translate(${hq.x} ${hq.y})"><circle r="10"/><circle r="10"/><circle r="10"/></g>
    <g class="cities">${CITIES.map((c, i) => `
      <g class="city${c.hq ? ' city--hq' : ''}" data-i="${i}" transform="translate(${c.x} ${c.y})" tabindex="0" role="button" aria-label="${esc(c.name)}, ${esc(c.region)}">
        <circle class="city-hit" r="16"/><circle class="city-dot" r="${c.hq ? 7 : 5}"/>
        <text x="12" y="4">${esc(c.name)}</text>
      </g>`).join('')}</g>`;
  const cityEls = $$('.city', map), regionEls = $$('.region', map);
  const list = $('#cityList');
  const regions = [...new Set(CITIES.map((c) => c.region))];
  list.innerHTML = regions.map((r) => `
    <div class="city-group"><h3>${esc(r)}</h3><ul>${CITIES.map((c, i) => c.region === r
      ? `<li><button type="button" data-i="${i}">${esc(c.name)}${c.hq ? ' <small>офис холдинга</small>' : ''}</button></li>` : '').join('')}</ul></div>`).join('');
  const cityBtns = $$('button', list);
  function focusCity(i) {
    const c = i >= 0 ? CITIES[i] : null;
    cityEls.forEach((el, k) => el.classList.toggle('is-active', k === i));
    cityBtns.forEach((b) => b.classList.toggle('is-active', Number(b.dataset.i) === i));
    regionEls.forEach((el) => el.classList.toggle('is-active', !!c && el.dataset.region === c.region));
  }
  cityEls.forEach((el) => {
    const i = Number(el.dataset.i);
    el.addEventListener('pointerenter', () => focusCity(i));
    el.addEventListener('focus', () => focusCity(i));
    el.addEventListener('click', () => focusCity(i));
    el.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); focusCity(i); } });
  });
  map.addEventListener('pointerleave', () => focusCity(-1));
  cityBtns.forEach((b) => {
    const i = Number(b.dataset.i);
    b.addEventListener('pointerenter', () => focusCity(i));
    b.addEventListener('focus', () => focusCity(i));
    b.addEventListener('click', () => focusCity(i));
  });
  list.addEventListener('pointerleave', () => focusCity(-1));

  /* ---------- contacts ---------- */
  $('#departments').innerHTML = CONTACTS.departments.map((d) => `
    <div class="dept">
      <h3>${esc(d.name)}</h3>
      ${d.phone ? `<a href="tel:${d.tel}">${esc(d.phone)}</a>` : ''}
      <a href="mailto:${d.email}">${esc(d.email)}</a>
    </div>`).join('');
  $('#formStations').innerHTML = ST.map((s) => `
    <label class="chip" style="--c:${s.color}"><input type="checkbox" name="stations" value="${esc(s.name)}"><span>${esc(s.name)}</span></label>`).join('');

  const form = $('#leadForm'), status = $('#formStatus');
  const rules = {
    name: (v) => v.trim().length >= 2 || 'Укажите имя',
    phone: (v) => v.replace(/\D/g, '').length >= 10 || 'Укажите телефон: минимум 10 цифр',
    email: (v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'Проверьте адрес почты',
  };
  const check = (field) => {
    const rule = rules[field.name]; if (!rule) return true;
    const res = rule(field.value), err = $(`#${field.name}-error`);
    const ok = res === true;
    field.setAttribute('aria-invalid', String(!ok));
    err.textContent = ok ? '' : res;
    return ok;
  };
  $$('input, textarea', form).forEach((f) => f.addEventListener('blur', () => f.value && check(f)));
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const fields = ['name', 'phone', 'email'].map((n) => form.elements[n]);
    const bad = fields.filter((f) => !check(f));
    if (bad.length) { bad[0].focus(); status.className = 'form-status is-error'; status.textContent = 'Заполните отмеченные поля.'; return; }
    const data = new FormData(form);
    const picked = data.getAll('stations');
    const body = [
      `Имя: ${data.get('name')}`, `Телефон: ${data.get('phone')}`,
      data.get('email') ? `Почта: ${data.get('email')}` : '',
      data.get('company') ? `Компания: ${data.get('company')}` : '',
      picked.length ? `Станции: ${picked.join(', ')}` : '',
      data.get('message') ? `\n${data.get('message')}` : '',
    ].filter(Boolean).join('\n');
    location.href = `mailto:reklama@rzs.ru?subject=${encodeURIComponent('Заявка на рекламу с сайта rzs.ru')}&body=${encodeURIComponent(body)}`;
    status.className = 'form-status is-ok';
    status.textContent = 'Заявка открылась в вашей почтовой программе — осталось нажать «Отправить». Если почта не открылась, позвоните: +7 (3452) 68-82-12.';
  });

  $('#year').textContent = new Date().getFullYear();
  observe();
})();
