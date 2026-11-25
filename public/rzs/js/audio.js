/* Аудио-движок тюнера.
   Два режима:
   - live: у станции есть stream (MP3/AAC, HLS там, где браузер умеет его нативно) — играет настоящий эфир;
   - demo: потока нет — в браузере синтезируется короткая мелодия станции. Это честно подписано в интерфейсе.
   Шум эфира между станциями синтезируется в обоих режимах. */
window.RZS = window.RZS || {};

RZS.Radio = (() => {
  const AC = window.AudioContext || window.webkitAudioContext;
  let ctx = null, master, analyser, noiseGain, music, lp, streamGain;
  let el = null, elNode = null, timer = null, step = 0, next = 0;
  let station = null, signal = 1;
  const state = { playing: false, mode: 'demo', error: '' };
  const listeners = [];
  const emit = () => listeners.forEach((fn) => fn({ ...state }));

  function build() {
    if (ctx) return true;
    if (!AC) { state.error = 'Браузер не поддерживает Web Audio'; emit(); return false; }
    ctx = new AC();
    master = ctx.createGain(); master.gain.value = 0;
    analyser = ctx.createAnalyser(); analyser.fftSize = 256; analyser.smoothingTimeConstant = .78;
    master.connect(analyser).connect(ctx.destination);

    const buf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate), ch = buf.getChannelData(0);
    for (let i = 0; i < ch.length; i++) ch[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true;
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 2400; bp.Q.value = .55;
    noiseGain = ctx.createGain(); noiseGain.gain.value = 0;
    src.connect(bp).connect(noiseGain).connect(master); src.start();

    lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 7000;
    music = ctx.createGain(); music.gain.value = 0;
    music.connect(lp).connect(master);
    streamGain = ctx.createGain(); streamGain.gain.value = 0;
    streamGain.connect(lp);
    return true;
  }

  /* ---------- demo synth ---------- */
  function note(m, t, dur, type, vol) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.value = 440 * Math.pow(2, (m - 69) / 12);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + .01);
    g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    o.connect(g).connect(music); o.start(t); o.stop(t + dur + .02);
  }
  function schedule() {
    if (!state.playing || state.mode !== 'demo' || !station) return;
    const s = station.synth, dt = 60 / s.bpm / 2;
    if (next < ctx.currentTime) next = ctx.currentTime + .03;
    while (next < ctx.currentTime + .12) {
      const i = step % s.notes.length;
      note(s.notes[i], next, dt * 1.6, s.wave, s.wave === 'triangle' ? .2 : .08);
      if (i % 4 === 0) note(s.notes[0] - 24, next, dt * 3, 'sine', .32);
      if (i % 2 === 1) note(s.notes[i] + 12, next, dt * .5, 'sine', .05);
      next += dt; step++;
    }
  }

  /* ---------- live stream ---------- */
  function stopStream() {
    if (!el) return;
    el.pause(); el.removeAttribute('src'); el.load();
    try { elNode && elNode.disconnect(); } catch (e) {}
    el = null; elNode = null;
  }
  function startStream(url) {
    stopStream();
    const isHls = /\.m3u8(\?|$)/i.test(url);
    const probe = document.createElement('audio');
    if (isHls && !probe.canPlayType('application/vnd.apple.mpegurl')) {
      return fail('Этот браузер не воспроизводит HLS без hls.js. Включён демо-режим.');
    }
    el = new Audio(); el.crossOrigin = 'anonymous'; el.preload = 'none'; el.src = url;
    try { elNode = ctx.createMediaElementSource(el); elNode.connect(streamGain); }
    catch (e) { /* без CORS-заголовков анализатор недоступен, но звук всё равно пойдёт */ }
    el.addEventListener('error', () => fail('Поток станции недоступен. Включён демо-режим.'), { once: true });
    el.play().then(() => { state.mode = 'live'; state.error = ''; levels(); emit(); })
      .catch(() => fail('Не удалось запустить поток. Включён демо-режим.'));
  }
  function fail(message) {
    stopStream();
    state.mode = 'demo'; state.error = message;
    levels(); emit();
  }

  /* ---------- levels: signal 0…1 mixes programme vs static ---------- */
  function levels() {
    if (!ctx) return;
    const t = ctx.currentTime, on = state.playing ? 1 : 0, n = 1 - signal;
    master.gain.setTargetAtTime(on * .8, t, .08);
    noiseGain.gain.setTargetAtTime(n * .18, t, .03);
    music.gain.setTargetAtTime(state.mode === 'demo' ? signal * .9 : 0, t, .05);
    streamGain.gain.setTargetAtTime(state.mode === 'live' ? signal : 0, t, .05);
    lp.frequency.setTargetAtTime(400 + signal * signal * 7600, t, .05);
  }

  return {
    on(fn) { listeners.push(fn); fn({ ...state }); },
    get state() { return { ...state }; },
    setStation(s) {
      const changed = s !== station;
      station = s;
      if (!changed || !state.playing) return;
      if (s.stream) startStream(s.stream);
      else if (state.mode === 'live') { stopStream(); state.mode = 'demo'; state.error = ''; levels(); emit(); }
    },
    setSignal(v) { signal = v; if (state.playing) levels(); },
    play() {
      if (!build()) return;
      ctx.resume();
      state.playing = true; state.error = '';
      if (!timer) timer = setInterval(schedule, 25);
      if (station && station.stream) startStream(station.stream);
      else state.mode = 'demo';
      levels(); emit();
    },
    pause() {
      state.playing = false;
      stopStream(); state.mode = 'demo';
      levels(); emit();
    },
    toggle() { state.playing ? this.pause() : this.play(); },
    blip() {
      if (!ctx || !state.playing) return;
      const t = ctx.currentTime, o = ctx.createOscillator(), g = ctx.createGain();
      o.frequency.setValueAtTime(1500, t); o.frequency.exponentialRampToValueAtTime(900, t + .07);
      g.gain.setValueAtTime(.05, t); g.gain.exponentialRampToValueAtTime(.0001, t + .09);
      o.connect(g).connect(master); o.start(t); o.stop(t + .1);
    },
    /* Fills `out` with frequency data; returns false when silent. */
    spectrum(out) {
      if (!ctx || !state.playing) return false;
      analyser.getByteFrequencyData(out);
      return true;
    },
    bins: 128,
  };
})();
