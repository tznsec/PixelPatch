/* Splash / intro + pixel-assembly headings. */
(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const splash = document.getElementById("splash");
  const splashSkip = document.getElementById("splash-skip");
  const replayIntro = document.getElementById("replay-intro");
  const INTRO_KEY = "pixel_patch_intro_11";
  let introTimers = [];
  let heroStarted = false;

  function introSeen() {
    try { return sessionStorage.getItem(INTRO_KEY) === "1"; } catch (_) { return false; }
  }
  function markIntroSeen() {
    try { sessionStorage.setItem(INTRO_KEY, "1"); } catch (_) { /* ignore */ }
  }
  function clearIntroTimers() {
    introTimers.forEach(function (id) { window.clearTimeout(id); });
    introTimers = [];
  }

  // ------------------------------------------------------------ pixel headings
  function fitFont(ctx, text, maxWidth, startSize) {
    let size = startSize;
    while (size > 9) {
      ctx.font = size + 'px "Press Start 2P", monospace';
      if (ctx.measureText(text).width <= maxWidth) break;
      size -= 1;
    }
    return size;
  }

  function drawLogo() {
    const canvas = document.getElementById("pixelLogo");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;
    const off = document.createElement("canvas");
    off.width = canvas.width;
    off.height = canvas.height;
    const c = off.getContext("2d");
    if (!c) return;
    c.imageSmoothingEnabled = false;

    const segments = [
      { text: "PIXEL ", color: "#e7f3ec" },
      { text: "PATCH", color: "#5cffa5" },
    ];
    const full = segments.map(function (s) { return s.text; }).join("");
    const size = fitFont(c, full, canvas.width - 18, 42);
    c.font = size + 'px "Press Start 2P", monospace';
    c.textBaseline = "alphabetic";
    const total = segments.reduce(function (sum, seg) { return sum + c.measureText(seg.text).width; }, 0);
    let x = (canvas.width - total) / 2;
    const baseline = Math.round(canvas.height * 0.73);
    segments.forEach(function (seg) {
      c.fillStyle = seg.color;
      c.fillText(seg.text, x, baseline);
      x += c.measureText(seg.text).width;
    });
    animatePixels(canvas, off, 7, 17);
  }

  function drawTitle() {
    const canvas = document.getElementById("pixelTitle");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;
    const off = document.createElement("canvas");
    off.width = canvas.width;
    off.height = canvas.height;
    const c = off.getContext("2d");
    if (!c) return;
    c.imageSmoothingEnabled = false;

    const lines = [
      { text: "DWÓCH", color: "#e7f3ec" },
      { text: "ZIOMKÓW.", color: "#e7f3ec" },
      { text: "ROK.", color: "#5cffa5" },
      { text: "JEDNA GRA.", color: "#e7f3ec" },
    ];
    c.font = '23px "Press Start 2P", monospace';
    c.textBaseline = "alphabetic";
    c.textAlign = "center";
    const lineH = 42;
    const startY = 34;
    lines.forEach(function (line, i) {
      c.fillStyle = line.color;
      c.fillText(line.text, canvas.width / 2, startY + i * lineH);
    });
    animatePixels(canvas, off, 7, 29);
  }

  function animatePixels(canvas, off, block, seed) {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Fallback: full heading is always visible, even if rAF is paused.
    ctx.drawImage(off, 0, 0);
    if (reduceMotion.matches) return;

    const w = canvas.width;
    const h = canvas.height;
    let s = seed >>> 0;
    function rnd() {
      s = (s * 1664525 + 1013904223) >>> 0;
      return s / 4294967296;
    }
    const blocks = [];
    for (let y = 0; y < h; y += block) {
      for (let x = 0; x < w; x += block) {
        blocks.push({
          x: x,
          y: y,
          w: Math.min(block, w - x),
          h: Math.min(block, h - y),
          start: 0.10 + rnd() * 0.58,
        });
      }
    }
    const dust = [];
    for (let i = 0; i < 34; i++) {
      dust.push({
        x: Math.floor(rnd() * w),
        y: Math.floor(rnd() * h),
        s: 1 + Math.floor(rnd() * 2),
        start: rnd() * 0.55,
        color: rnd() > 0.55 ? "#5cffa5" : "#e7f3ec",
      });
    }

    const t0 = performance.now();
    const total = 0.95;
    function frame() {
      const t = (performance.now() - t0) / 1000;
      if (t >= total) {
        ctx.clearRect(0, 0, w, h);
        ctx.drawImage(off, 0, 0);
        window.clearInterval(timer);
        return;
      }
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < blocks.length; i++) {
        const b = blocks[i];
        if (t >= b.start) {
          ctx.drawImage(off, b.x, b.y, b.w, b.h, b.x, b.y, b.w, b.h);
        }
      }
      if (t < 0.66) {
        for (let i = 0; i < dust.length; i++) {
          const d = dust[i];
          if (t >= d.start && t < d.start + 0.24) {
            ctx.fillStyle = d.color;
            ctx.globalAlpha = 0.55;
            ctx.fillRect(d.x, d.y, d.s, d.s);
            ctx.globalAlpha = 1;
          }
        }
      }
    }
    const timer = window.setInterval(frame, 33);
    frame();
  }

  function startHeroPixelAnimations(force) {
    if (heroStarted && !force) return;
    heroStarted = true;
    let started = false;
    function run() {
      if (started) return;
      started = true;
      drawLogo();
      drawTitle();
    }
    if (document.fonts && document.fonts.load) {
      document.fonts.load('20px "Press Start 2P"')
        .then(function () { return document.fonts.ready; })
        .then(run)
        .catch(run);
      window.setTimeout(run, 1100);
    } else {
      run();
    }
  }

  // ------------------------------------------------------------ splash
  function finishIntro() {
    if (!splash || splash.hidden) return;
    clearIntroTimers();
    splash.classList.add("out");
    introTimers.push(window.setTimeout(function () {
      splash.hidden = true;
      splash.classList.remove("out", "run", "hit", "labels");
      document.body.classList.remove("intro-open");
      startHeroPixelAnimations(true);
    }, 420));
  }

  function playIntro(force) {
    if (!splash) {
      startHeroPixelAnimations(false);
      return;
    }
    if (!force && introSeen()) {
      startHeroPixelAnimations(false);
      return;
    }
    markIntroSeen();
    clearIntroTimers();
    splash.hidden = false;
    splash.classList.remove("out", "run", "hit", "labels");
    void splash.offsetWidth;
    document.body.classList.add("intro-open");
    splash.classList.add("run");

    if (reduceMotion.matches) {
      splash.classList.add("hit", "labels");
      introTimers.push(window.setTimeout(finishIntro, 2400));
    } else {
      introTimers.push(window.setTimeout(function () { splash.classList.add("hit"); }, 900));
      introTimers.push(window.setTimeout(function () { splash.classList.add("labels"); }, 1500));
      introTimers.push(window.setTimeout(finishIntro, 4200));
    }
    if (splashSkip) splashSkip.focus({ preventScroll: true });
  }

  if (splashSkip) splashSkip.addEventListener("click", finishIntro);
  if (splash) {
    splash.addEventListener("click", function (event) {
      if (event.target === splash) finishIntro();
    });
  }
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && splash && !splash.hidden) finishIntro();
  });
  if (replayIntro) {
    replayIntro.addEventListener("click", function () { playIntro(true); });
  }

  playIntro(false);
})();
