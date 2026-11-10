/* ============================================================
   heart.js — todo lo que se dibuja en el canvas
     · estrellas con parallax, estrellas fugaces, corazoncitos al fondo
     · un único enjambre de partículas que puede ser:
         polvo (portada) → corazón que late → palabras
     · anillo que orbita, chispas, ondas y corazones que suben
   Expone window.HeartFX para que main.js lo dirija.
   ============================================================ */
(function () {
  'use strict';

  var scene = document.getElementById('scene');
  var cv = document.getElementById('space');
  var ctx = cv.getContext('2d');
  var reduce = window.Gift.reduce;

  var W = 0, H = 0, dpr = 1;
  var cx = 0, cy = 0, unit = 1;       // centro del corazón y tamaño de 1 unidad
  var hue = 328;
  var sprites = [];                   // puntos de luz pre-dibujados (rápido)
  var parts = [], stars = [], minis = [], sparks = [], waves = [], risers = [], ring = [];
  var shooting = null, nextShoot = 0;

  var mode = 'dust';                  // 'dust' | 'heart' | 'text'
  var textPts = null, currentWord = '';
  var words = [], wordIndex = -1, backTimer = 0;
  var pulse = 0, ringAlpha = 0, ringAngle = 0;
  var pointer = { x: -999, y: -999, on: false, nx: 0, ny: 0 };
  var par = { x: 0, y: 0 };
  var raf = 0, last = 0, layoutCb = null;

  function rand(a, b) { return a + Math.random() * (b - a); }

  /* ---------- Forma del corazón (coordenadas en "unidades") ---------- */
  function heartPoint(t, f) {
    return {
      x: 16 * Math.pow(Math.sin(t), 3) * f,
      y: (-(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) - 2.6) * f,
    };
  }

  function makeParticles() {
    var n = reduce ? 420 : (W < 700 ? 760 : 1150);
    parts = [];
    for (var i = 0; i < n; i++) {
      var edge = Math.random() < 0.64;
      var f = edge ? 1 - Math.pow(Math.random(), 2.2) * 0.12 : Math.sqrt(Math.random()) * 0.9;
      var hp = heartPoint(rand(0, 6.2832), f);
      parts.push({
        x: rand(0, W), y: rand(0, H), vx: 0, vy: 0,
        hx: hp.x, hy: hp.y, tx: 0, ty: 0,
        size: edge ? rand(5, 11) : rand(3.5, 7), dim: edge ? 1 : 0.6,
        sprite: Math.random() < 0.18 ? 2 : (Math.random() < 0.5 ? 1 : 0),
        k: rand(0.028, 0.075), ph: rand(0, 6.28), drift: rand(0, 6.28),
      });
    }
  }

  function makeSprites() {
    var cols = [
      'hsl(' + hue + ',100%,62%)',
      'hsl(' + (hue + 16) + ',100%,74%)',
      'hsl(' + hue + ',100%,92%)',
    ];
    sprites = cols.map(function (col) {
      var c = document.createElement('canvas');
      c.width = c.height = 32;
      var g = c.getContext('2d');
      var grad = g.createRadialGradient(16, 16, 0, 16, 16, 16);
      grad.addColorStop(0, '#fff');
      grad.addColorStop(0.18, col);
      grad.addColorStop(0.5, col.replace('hsl(', 'hsla(').replace(')', ',0.28)'));
      grad.addColorStop(1, col.replace('hsl(', 'hsla(').replace(')', ',0)'));
      g.fillStyle = grad; g.fillRect(0, 0, 32, 32);
      return c;
    });
  }

  /* ---------- Tamaño ---------- */
  function resize() {
    var r = scene.getBoundingClientRect();
    W = Math.max(1, r.width); H = Math.max(1, r.height);
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cx = W / 2; cy = H * (H / W > 1.6 ? 0.45 : 0.42);
    unit = Math.min((W * 0.86) / 34, (H * 0.56) / 30);

    var ns = Math.round(Math.min(200, (W * H) / 6000));
    stars = [];
    for (var i = 0; i < ns; i++) {
      stars.push({ x: Math.random(), y: Math.random(), r: rand(0.4, 1.6), depth: rand(0.2, 1), ph: rand(0, 6.28), sp: rand(0.5, 1.8), cross: Math.random() > 0.86 });
    }
    minis = [];
    for (var j = 0; j < (reduce ? 6 : 14); j++) {
      minis.push({ x: rand(0, W), y: rand(0, H), s: rand(5, 11), v: rand(0.25, 0.7), a: rand(0.08, 0.3), sw: rand(0, 6.28), ss: rand(0.008, 0.025) });
    }
    ring = [];
    for (var k = 0; k < (reduce ? 30 : 80); k++) ring.push({ a: rand(0, 6.2832), off: rand(-0.6, 0.6), size: rand(3, 7) });

    if (!parts.length || Math.abs(parts.length - (reduce ? 420 : (W < 700 ? 760 : 1150))) > 0) makeParticles();
    if (mode === 'text' && currentWord) textPts = sampleText(currentWord);
    if (layoutCb) layoutCb({ x: cx, y: cy, r: unit * 15 });
  }

  /* ---------- Palabras → puntos ---------- */
  function sampleText(str) {
    var text = String(str).toUpperCase().trim();
    if (!text) return null;
    var lines = [text];
    if (W < 620 && text.indexOf(' ') > 0 && text.length > 6) {       // en pantallas angostas, dos líneas
      var bits = text.split(' '), best = 1, diff = 1e9;
      for (var b = 1; b < bits.length; b++) {
        var d = Math.abs(bits.slice(0, b).join(' ').length - bits.slice(b).join(' ').length);
        if (d < diff) { diff = d; best = b; }
      }
      lines = [bits.slice(0, best).join(' '), bits.slice(best).join(' ')];
    }
    var bw = Math.floor(Math.min(W * 0.9, 780)), bh = Math.floor(H * 0.46);
    var off = document.createElement('canvas');
    off.width = bw; off.height = bh;
    var g = off.getContext('2d');
    var family = '"Cinzel", Georgia, serif';
    g.font = '700 100px ' + family;
    var widest = Math.max.apply(null, lines.map(function (l) { return g.measureText(l).width; }));
    var fs = Math.min((bw * 0.96) / widest * 100, (bh * 0.8) / lines.length);
    g.font = '700 ' + fs + 'px ' + family;
    g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#fff';
    lines.forEach(function (l, i) { g.fillText(l, bw / 2, bh / 2 + (i - (lines.length - 1) / 2) * fs * 1.08); });

    // Paso de la rejilla: se ajusta para que salgan tantos puntos como partículas
    // (cada partícula ocupa un punto distinto y la palabra se lee nítida).
    var data = g.getImageData(0, 0, bw, bh).data, pts = [], filled = 0;
    for (var a = 3; a < data.length; a += 16) if (data[a] > 130) filled++;
    var step = Math.max(2, Math.sqrt((filled * 4) / Math.max(1, parts.length)));
    for (var fy = 0; fy < bh; fy += step) {
      for (var fx = 0; fx < bw; fx += step) {
        var x = Math.round(fx), y = Math.round(fy);
        if (data[(y * bw + x) * 4 + 3] > 130) pts.push({ x: x - bw / 2, y: y - bh / 2 });
      }
    }
    for (var i2 = pts.length - 1; i2 > 0; i2--) {                     // mezclar
      var j = Math.floor(Math.random() * (i2 + 1)), tmp = pts[i2]; pts[i2] = pts[j]; pts[j] = tmp;
    }
    return pts.length ? pts : null;
  }

  /* ---------- Dibujo ---------- */
  function heartPath(c, x, y, s) {
    c.beginPath();
    c.moveTo(x, y + s * 0.9);
    c.bezierCurveTo(x - s * 1.5, y - s * 0.2, x - s * 0.75, y - s * 1.25, x, y - s * 0.45);
    c.bezierCurveTo(x + s * 0.75, y - s * 1.25, x + s * 1.5, y - s * 0.2, x, y + s * 0.9);
  }

  function drawBackdrop(t, dt) {
    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      var a = 0.25 + 0.75 * (0.5 + 0.5 * Math.sin(t * 0.001 * s.sp + s.ph));
      var x = s.x * W - par.x * 16 * s.depth, y = s.y * H - par.y * 10 * s.depth;
      ctx.globalAlpha = a * 0.85;
      ctx.fillStyle = 'hsl(' + hue + ',70%,94%)';
      ctx.beginPath(); ctx.arc(x, y, s.r, 0, 6.2832); ctx.fill();
      if (s.cross) {
        ctx.globalAlpha = a * 0.4; ctx.strokeStyle = '#fff'; ctx.lineWidth = 0.6;
        ctx.beginPath(); ctx.moveTo(x - 4, y); ctx.lineTo(x + 4, y); ctx.moveTo(x, y - 4); ctx.lineTo(x, y + 4); ctx.stroke();
      }
    }
    ctx.fillStyle = 'hsl(' + hue + ',100%,72%)';
    for (var m = 0; m < minis.length; m++) {
      var h = minis[m];
      h.y += h.v * dt; h.sw += h.ss * dt;
      if (h.y > H + 14) { h.y = -14; h.x = rand(0, W); }
      ctx.globalAlpha = h.a * (mode === 'dust' ? 0.5 : 1);
      heartPath(ctx, h.x + Math.sin(h.sw) * 12 - par.x * 6, h.y, h.s); ctx.fill();
    }
    ctx.globalAlpha = 1;

    if (reduce) return;
    if (!shooting && t > nextShoot) {
      shooting = { x: rand(0, 0.6) * W, y: rand(0, 0.3) * H, v: rand(9, 15), len: rand(80, 150), life: 1 };
      nextShoot = t + rand(3500, 8000);
    }
    if (shooting) {
      var st = shooting;
      st.x += st.v * dt; st.y += st.v * 0.6 * dt; st.life -= 0.02 * dt;
      if (st.life <= 0) { shooting = null; return; }
      var g = ctx.createLinearGradient(st.x, st.y, st.x - st.len, st.y - st.len * 0.6);
      g.addColorStop(0, 'hsla(' + hue + ',100%,92%,' + st.life + ')');
      g.addColorStop(1, 'hsla(' + hue + ',100%,80%,0)');
      ctx.strokeStyle = g; ctx.lineWidth = 1.8; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(st.x, st.y); ctx.lineTo(st.x - st.len, st.y - st.len * 0.6); ctx.stroke();
    }
  }

  function drawRing(front) {
    if (ringAlpha <= 0.01) return;
    var rx = unit * 21, ry = unit * 6, tilt = -0.38;
    var ct = Math.cos(tilt), sn = Math.sin(tilt);
    for (var i = 0; i < ring.length; i++) {
      var p = ring[i], a = p.a + ringAngle, depth = Math.sin(a);
      if ((depth > 0) !== front) continue;
      var ex = Math.cos(a) * rx, ey = depth * ry + p.off * unit;
      var x = cx + ex * ct - ey * sn, y = cy + ex * sn + ey * ct;
      var sz = p.size * (0.75 + 0.35 * depth);
      ctx.globalAlpha = ringAlpha * (0.35 + 0.4 * (depth + 1) / 2);
      ctx.drawImage(sprites[1], x - sz / 2, y - sz / 2, sz, sz);
    }
    ctx.globalAlpha = 1;
  }

  function beat(t) {
    if (reduce) return 0;
    var p = (t % 1150) / 1150;
    if (p < 0.13) return Math.sin((p / 0.13) * Math.PI) * 0.075;
    if (p > 0.2 && p < 0.33) return Math.sin(((p - 0.2) / 0.13) * Math.PI) * 0.045;
    return 0;
  }

  function drawParticles(t, dt) {
    var scale = unit * (1 + beat(t) + pulse);
    var n = parts.length, pts = textPts, np = pts ? pts.length : 0;
    var R = Math.max(70, unit * 6);
    for (var i = 0; i < n; i++) {
      var p = parts[i];
      if (mode === 'dust') {
        p.drift += rand(-0.1, 0.1);
        p.vx += Math.cos(p.drift) * 0.012; p.vy += Math.sin(p.drift) * 0.012;
        p.vx *= 0.985; p.vy *= 0.985;
        if (p.x < -10) p.x = W + 10; else if (p.x > W + 10) p.x = -10;
        if (p.y < -10) p.y = H + 10; else if (p.y > H + 10) p.y = -10;
      } else {
        if (mode === 'text' && np) {
          var q = pts[i % np];
          p.tx = cx + q.x + Math.sin(t * 0.002 + p.ph) * 0.8; p.ty = cy + q.y + Math.cos(t * 0.002 + p.ph) * 0.8;
        } else {
          var wob = Math.sin(t * 0.004 + p.ph) * 1.6;
          p.tx = cx + p.hx * scale + wob; p.ty = cy + p.hy * scale + wob;
        }
        p.vx += (p.tx - p.x) * p.k; p.vy += (p.ty - p.y) * p.k;
        p.vx *= 0.84; p.vy *= 0.84;
      }
      if (pointer.on) {
        var dx = p.x - pointer.x, dy = p.y - pointer.y, d2 = dx * dx + dy * dy;
        if (d2 < R * R) {
          var d = Math.sqrt(d2) || 1, force = (1 - d / R) * (mode === 'dust' ? 0.5 : 3.2);
          p.vx += (dx / d) * force; p.vy += (dy / d) * force;
        }
      }
      p.x += p.vx * dt; p.y += p.vy * dt;
      var tw = 0.6 + 0.4 * Math.sin(t * 0.004 + p.ph);
      ctx.globalAlpha = tw * p.dim * (mode === 'dust' ? 0.4 : 1);
      var sz = mode === 'text' ? Math.min(p.size, 5.5) : p.size;
      ctx.drawImage(sprites[p.sprite], p.x - sz / 2, p.y - sz / 2, sz, sz);
    }
    ctx.globalAlpha = 1;
  }

  function drawExtras(dt) {
    for (var i = sparks.length - 1; i >= 0; i--) {
      var s = sparks[i];
      s.x += s.vx * dt; s.y += s.vy * dt; s.vy += 0.02 * dt; s.life -= s.decay * dt;
      if (s.life <= 0) { sparks.splice(i, 1); continue; }
      ctx.globalAlpha = s.life;
      ctx.drawImage(sprites[s.sprite], s.x - s.size / 2, s.y - s.size / 2, s.size, s.size);
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
    for (var w = waves.length - 1; w >= 0; w--) {
      var wv = waves[w];
      wv.r += (wv.max - wv.r) * 0.07 * dt; wv.a -= 0.022 * dt;
      if (wv.a <= 0) { waves.splice(w, 1); continue; }
      ctx.strokeStyle = 'hsla(' + hue + ',100%,78%,' + wv.a + ')'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(wv.x, wv.y, wv.r, 0, 6.2832); ctx.stroke();
    }
    ctx.fillStyle = 'hsl(' + hue + ',100%,80%)';
    for (var r = risers.length - 1; r >= 0; r--) {
      var h = risers[r];
      h.y -= h.v * dt; h.sw += 0.05 * dt; h.life -= 0.012 * dt;
      if (h.life <= 0) { risers.splice(r, 1); continue; }
      ctx.globalAlpha = Math.min(1, h.life * 1.6);
      heartPath(ctx, h.x + Math.sin(h.sw) * 10, h.y, h.s * (1.2 - h.life * 0.2)); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function frame(t) {
    raf = requestAnimationFrame(frame);
    var dt = Math.min(2.5, (t - last) / 16.7 || 1); last = t;
    par.x += (pointer.nx - par.x) * 0.05; par.y += (pointer.ny - par.y) * 0.05;
    if (pulse > 0.001) pulse *= Math.pow(0.9, dt); else pulse = 0;
    ringAlpha += ((mode === 'heart' ? 1 : 0) - ringAlpha) * 0.04 * dt;
    ringAngle += 0.008 * dt;

    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'source-over';
    drawBackdrop(t, dt);
    ctx.globalCompositeOperation = 'lighter';
    drawRing(false);
    drawParticles(t, dt);
    drawRing(true);
    drawExtras(dt);
  }
  function run() { if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame); } }
  function stop() { cancelAnimationFrame(raf); raf = 0; }

  /* ---------- Efectos sueltos ---------- */
  function burst(x, y, n, speed) {
    n = reduce ? Math.ceil(n / 4) : n;
    for (var i = 0; i < n; i++) {
      var a = rand(0, 6.2832), v = rand(0.4, 1) * (speed || 5);
      if (sparks.length > 420) sparks.shift();
      sparks.push({ x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 1, decay: rand(0.014, 0.03), size: rand(4, 10), sprite: Math.random() < 0.3 ? 2 : 1 });
    }
  }
  function kick(force) {                         // empuja las partículas hacia afuera desde el centro
    if (reduce) return;
    parts.forEach(function (p) {
      var dx = p.x - cx, dy = p.y - cy, d = Math.hypot(dx, dy) || 1;
      var f = rand(0.3, 1) * force;
      p.vx += (dx / d) * f; p.vy += (dy / d) * f;
    });
  }

  function showHeart() { mode = 'heart'; textPts = null; currentWord = ''; clearTimeout(backTimer); }
  function showWord(word) {
    var pts = sampleText(word);
    if (!pts) { showHeart(); return; }
    textPts = pts; currentWord = word; mode = 'text';
    clearTimeout(backTimer);
    backTimer = setTimeout(function () { if (mode === 'text') { kick(5); showHeart(); } }, 4200);
  }

  /* ---------- Entrada ---------- */
  function local(e) { var r = scene.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
  var lastTrail = 0;
  scene.addEventListener('pointermove', function (e) {
    var p = local(e);
    pointer.x = p.x; pointer.y = p.y; pointer.on = true;
    pointer.nx = (p.x / W - 0.5) * 2; pointer.ny = (p.y / H - 0.5) * 2;
    var now = performance.now();
    if (!reduce && mode !== 'dust' && now - lastTrail > 28) {
      lastTrail = now;
      sparks.push({ x: p.x + rand(-5, 5), y: p.y + rand(-5, 5), vx: rand(-0.4, 0.4), vy: rand(-1.1, -0.3), life: 0.9, decay: 0.03, size: rand(4, 8), sprite: 1 });
    }
  }, { passive: true });
  function pointerOff() { pointer.on = false; }
  scene.addEventListener('pointerleave', pointerOff);
  scene.addEventListener('pointerup', function (e) { if (e.pointerType !== 'mouse') pointerOff(); });
  scene.addEventListener('pointercancel', pointerOff);
  window.addEventListener('deviceorientation', function (e) {
    if (e.gamma == null || pointer.on) return;
    pointer.nx = Math.max(-1, Math.min(1, e.gamma / 30));
    pointer.ny = Math.max(-1, Math.min(1, (e.beta - 45) / 40));
  }, { passive: true });
  document.addEventListener('visibilitychange', function () { if (document.hidden) stop(); else run(); });
  if (window.ResizeObserver) new ResizeObserver(resize).observe(scene); else window.addEventListener('resize', resize);

  /* ---------- API ---------- */
  window.HeartFX = {
    setHue: function (h) { hue = h; makeSprites(); },
    setWords: function (list) {
      words = list.slice(0, 4); wordIndex = -1;
      if (mode === 'text') showHeart();
    },
    onLayout: function (cb) { layoutCb = cb; cb({ x: cx, y: cy, r: unit * 15 }); },
    /* Portada → corazón: el polvo se junta */
    assemble: function () {
      showHeart();
      nextShoot = performance.now() + 2500;
      burst(cx, cy, 40, 7);
      waves.push({ x: cx, y: cy, r: 10, max: unit * 26, a: 0.9 });
    },
    /* Corazón → polvo */
    scatter: function () {
      clearTimeout(backTimer); mode = 'dust'; textPts = null; currentWord = ''; wordIndex = -1;
      parts.forEach(function (p) { p.vx += rand(-9, 9); p.vy += rand(-9, 9); });
    },
    /* Toque al corazón: late fuerte y pasa a la siguiente palabra (o vuelve a ser corazón) */
    touchHeart: function () {
      pulse = reduce ? 0 : 0.22;
      waves.push({ x: cx, y: cy, r: unit * 6, max: unit * 30, a: 1 });
      burst(cx, cy, 46, 8);
      kick(7);
      if (mode === 'text' || !words.length) { showHeart(); return 'heart'; }
      wordIndex = (wordIndex + 1) % words.length;
      showWord(words[wordIndex]);
      return 'text';
    },
    /* Toque en cualquier otra parte: chispas y corazones que suben */
    tap: function (x, y) {
      burst(x, y, 14, 3.5);
      var n = reduce ? 1 : 4;
      for (var i = 0; i < n; i++) risers.push({ x: x + rand(-18, 18), y: y + rand(-6, 6), v: rand(0.8, 1.9), s: rand(5, 10), life: 1, sw: rand(0, 6.28) });
      if (risers.length > 60) risers.splice(0, risers.length - 60);
    },
  };

  makeSprites();
  resize();
  run();
  // Cuando llega la tipografía, las palabras se vuelven a muestrear con la letra correcta.
  if (document.fonts && document.fonts.load) {
    document.fonts.load('700 40px Cinzel').then(function () { if (mode === 'text' && currentWord) textPts = sampleText(currentWord); });
  }
})();
