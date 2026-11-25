/* Первый экран — большое табло приёмника: частота во весь экран, «снег» эфира, расслоение цифр
   на помехах, волна, шкала и пресеты. Это дисплей того же RZS.Tuner, что и блок ниже:
   шкала и пресеты здесь управляют общим состоянием, звук — общий RZS.Radio. */
window.RZS = window.RZS || {};

RZS.Hero = (() => {
  const hero = document.getElementById('top');
  if (!hero) return null;
  const ST = RZS.STATIONS, MIN = 87.5, MAX = 108;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (id) => document.getElementById(id);
  const digits = $('hxDigits'), freqEl = $('hxFreq'), nameEl = $('hxName'), factEl = $('hxFact');
  const strip = $('hxStrip'), scale = $('hxScale'), presets = $('hxPresets'), hint = $('hxHint');
  const snow = $('hxSnow'), sctx = snow.getContext('2d');
  const wave = $('hxWave'), wctx = wave.getContext('2d');
  const sound = $('hxSound');
  let PX = innerWidth < 760 ? 70 : 104, lastText = '', img, visible = true;

  /* ---------- tape ---------- */
  function buildStrip() {
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
      m.addEventListener('click', () => RZS.Tuner.select(i));
      strip.appendChild(m);
    });
  }

  /* ---------- presets ---------- */
  ST.forEach((s, i) => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'hx-preset'; b.style.setProperty('--c', s.color);
    b.setAttribute('aria-pressed', 'false');
    b.innerHTML = `<b>${s.f.toFixed(1)}</b><span>${s.name}</span>`;
    b.addEventListener('click', () => RZS.Tuner.select(i));
    s._hx = b; presets.appendChild(b);
  });

  /* ---------- station name: letters settle out of noise ---------- */
  const GLYPHS = 'АБВГДЕЖЗИКЛМНОПРСТУФХЦЧШЭЮЯ0123456789#%';
  let scr = 0;
  function scramble(text) {
    const id = ++scr;
    if (reduce) { nameEl.textContent = text; return; }
    let frame = 0; const total = 22;
    (function step() {
      if (id !== scr) return;
      const k = Math.floor((frame / total) * text.length);
      nameEl.textContent = [...text].map((c, i) => (i < k || c === ' ' ? c : GLYPHS[(Math.random() * GLYPHS.length) | 0])).join('');
      if (frame++ < total) requestAnimationFrame(step); else nameEl.textContent = text;
    })();
  }
  RZS.Tuner.onChange((i, s) => {
    ST.forEach((x, k) => x._hx.setAttribute('aria-pressed', String(k === i)));
    if (s) {
      nameEl.classList.remove('is-search');
      scramble(s.name);
      factEl.textContent = s.tagline;
    } else {
      scr++;
      nameEl.classList.add('is-search');
      nameEl.textContent = 'Поиск станции…';
      factEl.textContent = 'Между станциями только эфир. Тяните шкалу или выберите станцию.';
    }
  });

  /* ---------- drag the tape ---------- */
  let drag = null;
  scale.addEventListener('pointerdown', (e) => {
    if (e.target.closest('.mark')) return;
    drag = { x: e.clientX, f: RZS.Tuner.live.freq, lastX: e.clientX, t: performance.now(), v: 0 };
    scale.setPointerCapture(e.pointerId);
    hint.style.opacity = 0;
  });
  scale.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const now = performance.now();
    drag.v = (e.clientX - drag.lastX) / Math.max(1, now - drag.t); drag.lastX = e.clientX; drag.t = now;
    RZS.Tuner.scrub(drag.f - (e.clientX - drag.x) / PX);
  });
  const end = () => { if (!drag) return; const v = drag.v; drag = null; RZS.Tuner.release(v, PX); };
  scale.addEventListener('pointerup', end);
  scale.addEventListener('pointercancel', end);
  scale.addEventListener('keydown', (e) => {
    const live = RZS.Tuner.live;
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { e.preventDefault(); RZS.Tuner.scrub(Math.round((live.freq + .1) * 10) / 10); }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { e.preventDefault(); RZS.Tuner.scrub(Math.round((live.freq - .1) * 10) / 10); }
    if (e.key === 'PageUp') { e.preventDefault(); RZS.Tuner.next(); }
    if (e.key === 'PageDown') { e.preventDefault(); RZS.Tuner.prev(); }
  });

  /* ---------- sound ---------- */
  sound.addEventListener('click', () => RZS.Radio.toggle());
  RZS.Radio.on((s) => {
    sound.setAttribute('aria-pressed', String(s.playing));
    sound.querySelector('.hx-sound-label').textContent = s.playing ? 'Выключить звук' : 'Включить звук';
  });

  /* ---------- canvases ---------- */
  function size() {
    const r = hero.getBoundingClientRect();
    snow.width = Math.max(1, Math.ceil(r.width / 3)); snow.height = Math.max(1, Math.ceil(r.height / 3));
    img = sctx.createImageData(snow.width, snow.height);
    const dpr = Math.min(2, devicePixelRatio || 1);
    wave.width = wave.clientWidth * dpr; wave.height = wave.clientHeight * dpr;
    wctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  function drawSnow(noise) {
    const d = img.data, a = Math.min(255, 30 + noise * 120), roll = (performance.now() / 6) % snow.height;
    for (let y = 0; y < snow.height; y++) {
      const band = Math.abs(y - roll) < 6 ? 1.7 : 1;
      for (let x = 0; x < snow.width; x++) {
        const i = (y * snow.width + x) * 4, v = Math.random() * 255 * band;
        d[i] = v; d[i + 1] = v; d[i + 2] = v + 18; d[i + 3] = a;
      }
    }
    sctx.putImageData(img, 0, 0);
    snow.style.opacity = (0.04 + noise * 0.3).toFixed(3);
  }
  function drawWave(t, sig, noise, color) {
    const w = wave.clientWidth, h = wave.clientHeight, mid = h / 2;
    wctx.clearRect(0, 0, w, h);
    for (const [amp, lw, c, glow] of [[.55, 1, 'rgba(245,247,248,.3)', 0], [1, 1.8, color, sig > .6 ? 14 : 0]]) {
      wctx.beginPath();
      for (let x = 0; x <= w; x += 3) {
        const env = Math.sin((x / w) * Math.PI);
        const clean = Math.sin(x * .021 * amp + t * 3.2) * .55 + Math.sin(x * .057 - t * 2.1) * .3 + Math.sin(x * .009 + t) * .15;
        const y = mid + env * h * .38 * amp * (sig * clean + noise * (Math.random() - .5) * 1.3);
        x ? wctx.lineTo(x, y) : wctx.moveTo(x, y);
      }
      wctx.shadowColor = c; wctx.shadowBlur = glow;
      wctx.strokeStyle = c; wctx.lineWidth = lw; wctx.stroke();
    }
    wctx.shadowBlur = 0;
  }
  function renderDigits(text) {
    if (text === lastText) return;
    if (text.length !== lastText.length) digits.innerHTML = [...text].map((c) => `<span class="${c === '.' ? 'dot' : 'd'}">${c}</span>`).join('');
    else [...text].forEach((c, i) => { if (lastText[i] !== c) digits.children[i].textContent = c; });
    lastText = text;
  }

  let lastSnow = 0;
  function frame(now) {
    if (visible) {
      const live = RZS.Tuner.live, sig = live.signal, noise = 1 - sig;
      const color = live.index >= 0 ? live.color : '#E2F04A';
      renderDigits(live.freq.toFixed(1));
      hero.style.setProperty('--hn', noise.toFixed(3));
      strip.style.transform = `translate3d(${scale.clientWidth / 2 - (live.freq - MIN) * PX}px,0,0)`;
      scale.setAttribute('aria-valuenow', live.freq.toFixed(1));
      if (now - lastSnow > (reduce ? 400 : noise > .02 ? 0 : 120)) { drawSnow(noise); lastSnow = now; }
      drawWave(reduce ? 0 : now / 1000, sig, noise, color);
      freqEl.style.transform = !reduce && noise > .05
        ? `translate(${(Math.random() - .5) * noise * 4}px, ${(Math.random() - .5) * noise * 2.4}px)` : '';
    }
    requestAnimationFrame(frame);
  }

  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(hero);
  addEventListener('resize', () => {
    const np = innerWidth < 760 ? 70 : 104;
    if (np !== PX) { PX = np; buildStrip(); }
    size();
  });
  buildStrip(); size();
  requestAnimationFrame(frame);
  setTimeout(() => RZS.Tuner.ensureTuned(2600), reduce ? 0 : 500);   // the opening sweep 87.5 → 101.8
  return { size };
})();
