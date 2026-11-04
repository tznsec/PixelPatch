/* Easter egg: 6 clicks on the logo = New Year 2027 mode + fireworks + music. */
(function () {
  "use strict";

  const brand = document.querySelector(".brand");
  if (!brand) return;

  const baseTitle = document.title;
  let clicks = 0;
  let resetTimer = 0;
  let active = false;
  let layer = null;
  let badge = null;
  let canvas = null;
  let ctx = null;
  let raf = 0;
  let lastSpawn = 0;
  let particles = [];
  let audioCtx = null;
  let master = null;
  let musicTimer = null;
  let noiseBuffer = null;

  function ensureLayer() {
    if (layer) return;
    layer = document.createElement("div");
    layer.className = "newyear-layer";
    layer.setAttribute("aria-hidden", "true");

    canvas = document.createElement("canvas");
    canvas.className = "ny-fireworks";
    ctx = canvas.getContext("2d");
    layer.appendChild(canvas);

    const decors = [
      { t: "2027", x: "1.5%", y: "56%", s: 22, d: 10, delay: 0 },
      { t: "✦", x: "91%", y: "16%", s: 30, d: 8, delay: 0.6 },
      { t: "✦", x: "6%", y: "86%", s: 18, d: 9, delay: 1.2 },
      { t: "❄", x: "92%", y: "72%", s: 20, d: 11, delay: 0.3 },
    ];
    decors.forEach(function (d) {
      const el = document.createElement("span");
      el.className = "ny-decor";
      el.textContent = d.t;
      el.style.left = d.x;
      el.style.top = d.y;
      el.style.fontSize = d.s + "px";
      el.style.animationDuration = d.d + "s";
      el.style.animationDelay = "-" + d.delay + "s";
      layer.appendChild(el);
    });

    for (let i = 0; i < 54; i++) {
      const snow = document.createElement("i");
      snow.className = "ny-snow";
      snow.style.left = (Math.random() * 100).toFixed(2) + "%";
      snow.style.animationDuration = (7 + Math.random() * 9).toFixed(2) + "s";
      snow.style.animationDelay = "-" + (Math.random() * 12).toFixed(2) + "s";
      snow.style.opacity = (0.25 + Math.random() * 0.5).toFixed(2);
      snow.style.fontSize = (1 + Math.random() * 3).toFixed(1) + "px";
      layer.appendChild(snow);
    }
    document.body.appendChild(layer);

    badge = document.createElement("button");
    badge.type = "button";
    badge.className = "newyear-badge";
    badge.textContent = "🎆 NOWY ROK 2027 · 6× logo = OFF";
    badge.addEventListener("click", toggle);
    document.body.appendChild(badge);

    resize();
    window.addEventListener("resize", resize);
  }

  function resize() {
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function burst(x, y) {
    const colors = ["#ffd166", "#8fe3ff", "#ff6b6b", "#fff8e7", "#a8ffcf"];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const n = 24 + Math.floor(Math.random() * 18);
    for (let i = 0; i < n; i++) {
      const a = (Math.PI * 2 * i) / n + Math.random() * 0.2;
      const sp = 70 + Math.random() * 150;
      particles.push({
        x: x, y: y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp,
        life: 1,
        color: color,
        size: 1 + Math.random() * 2,
      });
    }
  }

  function frame(now) {
    if (!active || !ctx) return;
    const w = window.innerWidth;
    const h = window.innerHeight;
    ctx.clearRect(0, 0, w, h);
    if (now - lastSpawn > 850) {
      lastSpawn = now;
      burst(w * (0.18 + Math.random() * 0.64), h * (0.12 + Math.random() * 0.3));
    }
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx * 0.016;
      p.y += p.vy * 0.016;
      p.vy += 55 * 0.016;
      p.vx *= 0.992;
      p.life -= 0.012;
      if (p.life <= 0 || p.y > h) {
        particles.splice(i, 1);
        continue;
      }
      ctx.globalAlpha = Math.max(0, p.life) * 0.9;
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, p.size, p.size);
    }
    ctx.globalAlpha = 1;
    raf = window.requestAnimationFrame(frame);
  }

  function startFx() {
    ensureLayer();
    particles = [];
    lastSpawn = 0;
    if (raf) window.cancelAnimationFrame(raf);
    raf = window.requestAnimationFrame(frame);
  }

  function stopFx() {
    if (raf) window.cancelAnimationFrame(raf);
    raf = 0;
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles = [];
  }

  function getCtx() {
    if (audioCtx) return audioCtx;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    audioCtx = new AC();
    master = audioCtx.createGain();
    master.gain.value = 0.16;
    master.connect(audioCtx.destination);
    noiseBuffer = audioCtx.createBuffer(1, audioCtx.sampleRate * 2, audioCtx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    return audioCtx;
  }

  function tone(freq, start, dur, type, vol) {
    const c = audioCtx;
    if (!c) return;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = type || "sine";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.linearRampToValueAtTime(vol, start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    osc.connect(gain);
    gain.connect(master);
    osc.start(start);
    osc.stop(start + dur + 0.05);
  }

  function shimmer(start, dur, vol) {
    if (!audioCtx || !noiseBuffer) return;
    const src = audioCtx.createBufferSource();
    const filter = audioCtx.createBiquadFilter();
    const gain = audioCtx.createGain();
    src.buffer = noiseBuffer;
    filter.type = "highpass";
    filter.frequency.value = 2400;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.linearRampToValueAtTime(vol, start + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    src.connect(filter);
    filter.connect(gain);
    gain.connect(master);
    src.start(start);
    src.stop(start + dur + 0.05);
  }

  function scheduleLoop() {
    if (!audioCtx || !master) return;
    const t = audioCtx.currentTime + 0.05;
    // Auld Lang Syne-ish festive phrase (public domain), bell + pad.
    const melody = [
      [0.0, 392.0], [0.45, 523.25], [0.90, 523.25], [1.35, 587.33],
      [1.80, 523.25], [2.25, 493.88], [2.70, 440.0], [3.15, 392.0],
      [3.60, 392.0], [4.05, 523.25], [4.50, 523.25], [4.95, 587.33],
      [5.40, 523.25], [5.85, 493.88], [6.30, 440.0], [6.75, 392.0],
      [7.20, 523.25], [7.65, 659.25], [8.10, 587.33], [8.55, 523.25],
      [9.00, 493.88], [9.45, 440.0], [9.90, 392.0], [10.35, 392.0],
      [10.80, 440.0], [11.25, 493.88], [11.70, 523.25], [12.15, 587.33],
      [12.60, 523.25], [13.05, 440.0], [13.50, 392.0], [13.95, 392.0],
    ];
    melody.forEach(function (n) {
      tone(n[1], t + n[0], 0.7, "triangle", 0.075);
      tone(n[1] * 2, t + n[0], 0.35, "sine", 0.018);
    });
    // pad + sleigh bells
    [196, 246.94, 293.66].forEach(function (f) {
      tone(f, t, 7.2, "sine", 0.025);
    });
    for (let b = 0; b < 28; b += 0.5) {
      shimmer(t + b, 0.12, 0.012);
    }
    tone(1046.5, t + 14.0, 1.2, "sine", 0.025);
    musicTimer = window.setTimeout(scheduleLoop, 14500);
  }

  function startMusic() {
    const c = getCtx();
    if (!c) return;
    if (c.state === "suspended") c.resume().catch(function () {});
    if (musicTimer) window.clearTimeout(musicTimer);
    scheduleLoop();
  }

  function stopMusic() {
    if (musicTimer) window.clearTimeout(musicTimer);
    musicTimer = null;
    if (audioCtx) {
      audioCtx.close().catch(function () {});
      audioCtx = null;
      master = null;
      noiseBuffer = null;
    }
  }

  function toggle() {
    active = !active;
    ensureLayer();
    document.body.classList.toggle("newyear-mode", active);
    badge.classList.toggle("on", active);
    if (active) {
      startMusic();
      startFx();
      document.title = "🎆 Pixel Patch — Nowy Rok 2027";
      toast("NOWY ROK 2027: fajerwerki i muzyka włączone.");
    } else {
      stopMusic();
      stopFx();
      document.title = baseTitle;
      toast("NOWY ROK 2027 wyłączony.");
    }
  }

  function toast(text) {
    let el = document.querySelector(".newyear-toast");
    if (!el) {
      el = document.createElement("div");
      el.className = "newyear-toast";
      document.body.appendChild(el);
    }
    el.textContent = text;
    el.classList.add("show");
    window.clearTimeout(toast._t);
    toast._t = window.setTimeout(function () {
      el.classList.remove("show");
    }, 2800);
  }

  brand.addEventListener("click", function (event) {
    clicks += 1;
    window.clearTimeout(resetTimer);
    resetTimer = window.setTimeout(function () { clicks = 0; }, 2600);
    if (clicks >= 6) {
      clicks = 0;
      window.clearTimeout(resetTimer);
      event.preventDefault();
      toggle();
    }
  });

  window.__newyearToggle = toggle;
})();
