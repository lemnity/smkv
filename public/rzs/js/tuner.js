/* FM-тюнер: состояние частоты, переключение станций, шкала, спектр, управление звуком.
   Публичный API: RZS.Tuner.select(i), .next(), .prev(), .onChange(fn), .live (частота/сигнал для других компонентов). */
window.RZS = window.RZS || {};

RZS.Tuner = (() => {
  const ST = RZS.STATIONS, N = ST.length, MIN = 87.5, MAX = 108, LOCK = 0.22;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = document.documentElement;
  const $ = (s, r = document) => r.querySelector(s);
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const smooth = (t) => t * t * (3 - 2 * t);
  const ease = (t) => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

  const dev = $('#device');
  const scale = $('#scale'), strip = $('#scaleStrip');
  const digits = $('#tDigits'), copy = $('#tCopy');
  const elName = $('#tName'), elFormat = $('#tFormat'), elTag = $('#tTagline'), elLogo = $('#tLogo');
  const playBtn = $('#tPlay'), onair = $('#onair'), onairText = $('#onairText'), note = $('#tNote');
  const presets = $('#tPresets'), spec = $('#tSpectrum');

  const live = { freq: MIN, signal: 0, index: -1, color: '#E2F04A', tuning: 0 };
  let anim = null, burst = 0, lastText = '', locked = null, drag = null;
  const listeners = [];

  /* ---------- scale ---------- */
  let PX = innerWidth < 760 ? 64 : 96;
  function buildScale() {
    strip.innerHTML = '';
    strip.style.width = (MAX - MIN) * PX + 'px';
    for (let i = 0; i <= Math.round((MAX - MIN) * 10); i++) {
      const v = MIN + i / 10, x = (v - MIN) * PX, tenth = Math.round(v * 10) % 10;
      const t = document.createElement('i');
      t.className = 'tick' + (tenth === 0 ? ' major' : tenth === 5 ? ' half' : '');
      t.style.left = x + 'px'; strip.appendChild(t);
      if (tenth === 0 && Math.round(v) % 2 === 0) {
        const l = document.createElement('span');
        l.className = 'tick-label'; l.style.left = x + 'px'; l.textContent = Math.round(v);
        strip.appendChild(l);
      }
    }
    ST.forEach((s, i) => {
      const m = document.createElement('button');
      m.type = 'button'; m.tabIndex = -1; m.setAttribute('aria-hidden', 'true');
      m.className = 'mark' + (s.id === 'armiya' ? ' end' : s.id === 'retro' ? ' start' : '');
      m.style.left = (s.f - MIN) * PX + 'px'; m.style.setProperty('--c', s.color);
      m.textContent = s.name;
      m.addEventListener('click', () => select(i));
      strip.appendChild(m);
    });
  }

  /* ---------- presets ---------- */
  ST.forEach((s, i) => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'preset'; b.style.setProperty('--c', s.color);
    b.setAttribute('aria-pressed', 'false');
    b.innerHTML = `<b>${s.f.toFixed(1)}</b><span>${s.name}</span>`;
    b.addEventListener('click', () => select(i));
    s._preset = b; presets.appendChild(b);
  });

  /* ---------- readout ---------- */
  function renderDigits(text) {
    if (text === lastText) return;
    if (text.length !== lastText.length) digits.innerHTML = [...text].map((c) => `<span class="${c === '.' ? 'dot' : 'd'}">${c}</span>`).join('');
    else [...text].forEach((c, i) => { if (lastText[i] !== c) digits.children[i].textContent = c; });
    lastText = text;
  }
  let swapT;
  function showStation(s) {
    clearTimeout(swapT);
    copy.classList.add('out');
    swapT = setTimeout(() => {
      if (s) {
        elName.textContent = s.name; elFormat.textContent = s.format; elTag.textContent = s.tagline;
        elLogo.src = s.logo; elLogo.alt = `Логотип ${s.name}`; elLogo.hidden = false;
        copy.classList.remove('searching');
      } else {
        elName.textContent = 'Поиск станции…'; elFormat.textContent = 'Эфир между станциями';
        elTag.textContent = 'Тяните шкалу или выберите станцию кнопками ниже.';
        elLogo.hidden = true; copy.classList.add('searching');
      }
      copy.classList.remove('out');
    }, reduce ? 0 : 180);
  }

  function nearest(f) {
    let best = 0, d = Infinity;
    ST.forEach((s, i) => { const dd = Math.abs(f - s.f); if (dd < d) { d = dd; best = i; } });
    return { i: best, sig: smooth(Math.max(0, 1 - d / LOCK)) };
  }

  function render(f) {
    live.freq = f = clamp(f, MIN, MAX);
    const { i, sig } = nearest(f);
    live.signal = Math.min(sig, 1 - burst);
    strip.style.transform = `translate3d(${scale.clientWidth / 2 - (f - MIN) * PX}px,0,0)`;
    renderDigits(f.toFixed(1));
    dev.style.setProperty('--noise', (1 - live.signal).toFixed(3));
    scale.setAttribute('aria-valuenow', f.toFixed(1));
    scale.setAttribute('aria-valuetext', `${f.toFixed(1)} FM${sig > .6 ? ', ' + ST[i].name : ''}`);
    RZS.Radio.setSignal(live.signal);

    const now = sig > .6 ? i : -1;
    if (now !== locked) {
      locked = now; live.index = now;
      const s = now >= 0 ? ST[now] : null;
      ST.forEach((x, k) => x._preset.setAttribute('aria-pressed', String(k === now)));
      if (s) {
        live.color = s.color;
        root.style.setProperty('--st', s.color);
        RZS.Radio.setStation(s);
        RZS.Radio.blip();
        mediaSession(s);
      }
      showStation(s);
      listeners.forEach((fn) => fn(now, s));
    }
  }

  /* ---------- switching: glide + analogue burst ---------- */
  function glide(target, dur) {
    cancelAnimationFrame(anim);
    const from = live.freq;
    if (reduce) { burst = 0; render(target); return; }
    dur = dur || clamp(650 + Math.abs(target - from) * 45, 650, 1500);
    const t0 = performance.now();
    dev.classList.remove('flash'); void dev.offsetWidth; dev.classList.add('flash');
    (function step(now) {
      const t = Math.min(1, (now - t0) / dur);
      burst = Math.sin(Math.PI * t) * .85;          // static peaks mid-switch, even for 0.5 MHz hops
      live.tuning = t < 1 ? 1 : 0;
      render(from + (target - from) * ease(t));
      if (t < 1) anim = requestAnimationFrame(step);
      else { burst = 0; render(target); }
    })(t0);
  }
  function select(i) { swept = true; glide(ST[(i + N) % N].f); }
  const current = () => (locked >= 0 ? locked : nearest(live.freq).i);

  /* ---------- drag / wheel / keys on the scale ---------- */
  scale.addEventListener('pointerdown', (e) => {
    if (e.target.closest('.mark')) return;
    cancelAnimationFrame(anim); burst = 0;
    drag = { x: e.clientX, f: live.freq, lastX: e.clientX, t: performance.now(), v: 0 };
    scale.setPointerCapture(e.pointerId);
  });
  scale.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const now = performance.now();
    drag.v = (e.clientX - drag.lastX) / Math.max(1, now - drag.t); drag.lastX = e.clientX; drag.t = now;
    render(drag.f - (e.clientX - drag.x) / PX);
  });
  const endDrag = () => {
    if (!drag) return;
    const land = clamp(live.freq - drag.v * 240 / PX, MIN, MAX);
    drag = null;
    const { i } = nearest(land);
    Math.abs(land - ST[i].f) < .6 ? glide(ST[i].f, 520) : glide(Math.round(land * 10) / 10, 420);
  };
  scale.addEventListener('pointerup', endDrag);
  scale.addEventListener('pointercancel', endDrag);
  let wheelT;
  scale.addEventListener('wheel', (e) => {
    e.preventDefault(); cancelAnimationFrame(anim); burst = 0;
    const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    render(live.freq + d * .004);
    clearTimeout(wheelT);
    wheelT = setTimeout(() => { const { i } = nearest(live.freq); if (Math.abs(live.freq - ST[i].f) < .35) glide(ST[i].f, 380); }, 200);
  }, { passive: false });
  scale.addEventListener('keydown', (e) => {
    const k = e.key;
    if (k === 'ArrowRight' || k === 'ArrowUp') { e.preventDefault(); cancelAnimationFrame(anim); render(Math.round((live.freq + .1) * 10) / 10); }
    if (k === 'ArrowLeft' || k === 'ArrowDown') { e.preventDefault(); cancelAnimationFrame(anim); render(Math.round((live.freq - .1) * 10) / 10); }
    if (k === 'PageUp') { e.preventDefault(); api.next(); }
    if (k === 'PageDown') { e.preventDefault(); api.prev(); }
    if (k === 'Home') { e.preventDefault(); select(0); }
    if (k === 'End') { e.preventDefault(); select(N - 1); }
  });
  $('#tPrev').addEventListener('click', () => api.prev());
  $('#tNext').addEventListener('click', () => api.next());

  /* ---------- play / state ---------- */
  playBtn.addEventListener('click', () => RZS.Radio.toggle());
  RZS.Radio.on((s) => {
    playBtn.setAttribute('aria-pressed', String(s.playing));
    playBtn.setAttribute('aria-label', s.playing ? 'Пауза' : (s.mode === 'live' ? 'Слушать эфир' : 'Включить демо-звук'));
    playBtn.querySelector('.play-label').textContent = s.playing ? 'Пауза' : 'Слушать';
    dev.classList.toggle('is-playing', s.playing);
    const isLive = s.playing && s.mode === 'live';
    onair.dataset.state = isLive ? 'live' : s.playing ? 'demo' : 'idle';
    onairText.textContent = isLive ? 'LIVE' : s.playing ? 'Демо-звук' : 'Демо-режим';
    note.textContent = s.error || (isLive
      ? 'Прямой эфир станции.'
      : 'Демо-режим: прямые эфиры не подключены, звук синтезируется в браузере. Это не трансляция станции.');
    note.classList.toggle('is-error', !!s.error);
  });

  function mediaSession(s) {
    if (!('mediaSession' in navigator)) return;
    try {
      navigator.mediaSession.metadata = new MediaMetadata({ title: `${s.name}, ${s.f.toFixed(1)} FM`, artist: 'Радио Западной Сибири', album: 'Тюмень' });
      navigator.mediaSession.setActionHandler('play', () => RZS.Radio.play());
      navigator.mediaSession.setActionHandler('pause', () => RZS.Radio.pause());
      navigator.mediaSession.setActionHandler('nexttrack', () => api.next());
      navigator.mediaSession.setActionHandler('previoustrack', () => api.prev());
    } catch (e) { /* not supported */ }
  }

  /* ---------- spectrum ---------- */
  const sctx = spec.getContext('2d');
  const bins = new Uint8Array(RZS.Radio.bins);
  const BARS = innerWidth < 760 ? 28 : 44;
  const level = new Float32Array(BARS);
  function sizeSpec() {
    const dpr = Math.min(2, devicePixelRatio || 1);
    spec.width = spec.clientWidth * dpr; spec.height = spec.clientHeight * dpr;
    sctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  let visible = true;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(dev);
  function drawSpectrum(t) {
    const w = spec.clientWidth, h = spec.clientHeight;
    const hasAudio = RZS.Radio.spectrum(bins) && bins.some((v) => v > 0);   // CORS-less streams read as silence
    const gap = 3, bw = (w - gap * (BARS - 1)) / BARS, sig = live.signal, noise = 1 - sig;
    sctx.clearRect(0, 0, w, h);
    for (let b = 0; b < BARS; b++) {
      let v;
      if (hasAudio) {
        v = bins[Math.floor(Math.pow(b / BARS, 1.6) * (bins.length * .72))] / 255;
      } else {
        const x = b / BARS;   // idle: a slow breathing curve, the station "waits" for play
        v = (.18 + .14 * Math.sin(t * 1.6 + x * 7) + .1 * Math.sin(t * 2.7 - x * 13)) * (1 - x * .55) * sig;
      }
      v = v * (.35 + .65 * sig) + noise * Math.random() * .75;
      level[b] += (clamp(v, .02, 1) - level[b]) * (reduce ? 1 : .35);
      const bh = Math.max(2, level[b] * h);
      sctx.fillStyle = sig > .6 ? live.color : '#9AA6B2';
      sctx.globalAlpha = .35 + .65 * (1 - b / BARS * .4);
      const x = b * (bw + gap);
      sctx.beginPath();
      sctx.roundRect ? sctx.roundRect(x, h - bh, bw, bh, Math.min(3, bw / 2)) : sctx.rect(x, h - bh, bw, bh);
      sctx.fill();
    }
    sctx.globalAlpha = 1;
  }
  function frame(now) {
    if (visible) drawSpectrum(now / 1000);
    requestAnimationFrame(frame);
  }

  addEventListener('resize', () => {
    const np = innerWidth < 760 ? 64 : 96;
    if (np !== PX) { PX = np; buildScale(); }
    sizeSpec(); render(live.freq);
  });

  /* ---------- init ---------- */
  buildScale(); sizeSpec();
  render(MIN);
  requestAnimationFrame(frame);
  let swept = false;
  new IntersectionObserver(([e], io) => {
    if (e.isIntersecting && !swept) { swept = true; io.disconnect(); glide(ST[1].f, reduce ? 0 : 2200); }
  }, { threshold: .35 }).observe(dev);

  const api = {
    live, select,
    next() { select(current() + 1); },
    prev() { select(current() - 1); },
    onChange(fn) { listeners.push(fn); },
    ensureTuned(dur) { if (!swept) { swept = true; glide(ST[1].f, reduce ? 0 : dur); } },
    /* free tuning from another scale (hero): follow the finger, then snap like our own scale */
    scrub(f) { swept = true; cancelAnimationFrame(anim); burst = 0; render(f); },
    release(v = 0, px = PX) {
      const land = clamp(live.freq - v * 240 / px, MIN, MAX);
      const { i } = nearest(land);
      Math.abs(land - ST[i].f) < .6 ? glide(ST[i].f, 520) : glide(Math.round(land * 10) / 10, 420);
    },
  };
  return api;
})();
