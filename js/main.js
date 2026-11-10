/* ============================================================
   main.js — dirige la experiencia
     1. Portada → "Abrir": el polvo de estrellas forma el corazón
     2. Corazón → late, huye del dedo, y al tocarlo escribe palabras
     3. Carta   → sale del botón y se escribe letra a letra
   El contenido llega de window.Gift (store.js).
   ============================================================ */
(function () {
  'use strict';

  var Gift = window.Gift;
  var FX = window.HeartFX;
  var reduce = Gift.reduce;
  function $(id) { return document.getElementById(id); }

  var scene = $('scene'), phrase = $('phrase'), phraseTop = $('phraseTop'), hint = $('hint');
  var startBtn = $('startBtn'), backBtn = $('backBtn'), letterBtn = $('letterBtn');
  var heartHit = $('heartHit');
  var letter = $('letter'), note = $('note'), noteText = $('noteText'), noteSign = $('noteSign'), closeLetterBtn = $('closeLetterBtn');

  var started = false, touched = false, letterOpen = false;
  var timers = [], typeTimer = 0, fullText = '';

  function later(fn, ms) { timers.push(setTimeout(fn, ms)); }
  function clearTimers() { timers.forEach(clearTimeout); timers = []; }

  /* ---------- Pintar una configuración ---------- */
  function setLetters(node, text) {
    node.textContent = '';
    var i = 0;
    String(text).split(/\s+/).filter(Boolean).forEach(function (word) {
      var w = document.createElement('span');          // la palabra no se parte entre líneas
      w.style.cssText = 'display:inline-block;white-space:nowrap';
      Array.from(word).forEach(function (ch) {
        var s = document.createElement('span');
        s.className = 'letter-ch';
        s.style.setProperty('--i', i++);
        s.textContent = ch;
        w.appendChild(s);
      });
      node.appendChild(w);
      node.appendChild(document.createTextNode(' '));
    });
    return i;
  }

  function render(cfg) {
    var theme = Gift.themes[cfg.tema] || Gift.themes[Gift.defaults.tema];
    document.documentElement.style.setProperty('--h', theme.hue);
    FX.setHue(theme.hue);
    Gift.applyFont(cfg.letra).then(function (f) { if (f) FX.setFont(f.titulo, f.peso); });

    Array.prototype.forEach.call(document.querySelectorAll('[data-t]'), function (n) {
      n.textContent = Gift.text(cfg, n.getAttribute('data-t'));
    });
    var name = cfg.para || '';
    document.querySelector('.gate__name').style.setProperty('--len', Math.max(3, Array.from(name).length));
    var count = setLetters(phraseTop, Gift.text(cfg, 'frase'));
    phrase.style.setProperty('--name-delay', (count * 55 + 350) + 'ms');

    FX.setWords(Gift.text(cfg, 'formas').split('\n').map(function (w) { return w.trim(); }).filter(Boolean));

    fullText = Gift.text(cfg, 'cartaTexto');
    if (letterOpen && !typeTimer) noteText.textContent = fullText;
    document.title = name ? 'Para ' + name : 'Para ti';
  }

  /* ---------- 1 → 2 ---------- */
  function start() {
    if (started) return;
    started = true; touched = false;
    document.body.classList.remove('is-gate');
    FX.assemble();
    later(function () { phrase.classList.add('is-in'); }, reduce ? 300 : 1100);
    later(function () { phrase.classList.add('is-static'); }, 5200);
    later(function () { if (!touched) hint.classList.add('is-on'); }, 4200);
    later(function () { heartHit.focus({ preventScroll: true }); }, 600);
  }

  function back() {
    if (!started) return;
    started = false;
    clearTimers();
    closeLetter(true);
    document.body.classList.add('is-gate');
    phrase.classList.remove('is-in', 'is-static');
    hint.classList.remove('is-on');
    FX.scatter();
    startBtn.focus({ preventScroll: true });
  }

  startBtn.addEventListener('click', start);
  backBtn.addEventListener('click', back);

  /* ---------- 2: tocar ---------- */
  heartHit.addEventListener('click', function () {
    if (!started) return;
    touched = true;
    hint.classList.remove('is-on');
    FX.touchHeart();
  });
  scene.addEventListener('pointerdown', function (e) {
    if (!started || e.target.closest('button')) return;
    var r = scene.getBoundingClientRect();
    FX.tap(e.clientX - r.left, e.clientY - r.top);
  });
  FX.onLayout(function (g) {
    var d = g.r * 1.7;
    heartHit.style.left = g.x + 'px'; heartHit.style.top = g.y + 'px';
    heartHit.style.width = d + 'px'; heartHit.style.height = d + 'px';
    hint.style.top = (g.y + g.r * 1.13) + 'px';
  });

  /* ---------- 3: carta ---------- */
  function finishTyping() {
    clearInterval(typeTimer); typeTimer = 0;
    noteText.textContent = fullText;
    noteText.classList.remove('is-typing');
    noteSign.classList.add('is-on');
  }
  function typeLetter() {
    clearInterval(typeTimer); typeTimer = 0;
    noteSign.classList.remove('is-on');
    noteText.textContent = '';
    if (reduce) { finishTyping(); return; }
    var chars = Array.from(fullText), i = 0;
    noteText.classList.add('is-typing');
    typeTimer = setInterval(function () {
      if (i >= chars.length) { finishTyping(); return; }
      noteText.textContent += chars[i++];
    }, 30);
  }

  function openLetter() {
    if (letterOpen || !started) return;
    letterOpen = true;
    letter.hidden = false;
    // La carta crece desde el botón que la abre.
    var b = letterBtn.getBoundingClientRect(), l = letter.getBoundingClientRect();
    var left = l.left + (l.width - note.offsetWidth) / 2, top = l.top + (l.height - note.offsetHeight) / 2;
    note.style.setProperty('--ox', (b.left + b.width / 2 - left) + 'px');
    note.style.setProperty('--oy', (b.top + b.height / 2 - top) + 'px');
    void letter.offsetWidth;
    letter.classList.add('is-open');
    later(typeLetter, reduce ? 0 : 420);
    closeLetterBtn.focus({ preventScroll: true });
  }

  function closeLetter(instant) {
    if (!letterOpen) return;
    letterOpen = false;
    clearInterval(typeTimer); typeTimer = 0;
    noteText.classList.remove('is-typing');
    letter.classList.remove('is-open');
    setTimeout(function () { if (!letterOpen) letter.hidden = true; }, instant === true ? 0 : 280);
    if (instant !== true) letterBtn.focus({ preventScroll: true });
  }

  letterBtn.addEventListener('click', openLetter);
  closeLetterBtn.addEventListener('click', closeLetter);
  $('letterBackdrop').addEventListener('click', closeLetter);
  noteText.addEventListener('click', function () { if (typeTimer) finishTyping(); });
  document.addEventListener('keydown', function (e) {
    if (!letterOpen) return;
    if (e.key === 'Escape') closeLetter();
    // El único control de la carta es "Cerrar": el foco se queda dentro.
    if (e.key === 'Tab' && !e.target.closest('.editor')) { e.preventDefault(); closeLetterBtn.focus(); }
  });

  /* ---------- Arranque ---------- */
  Gift.render = render;
  render(Gift.config);
})();
