/* Pixel Patch — hero CRT scene.
   Low-res 320×180 canvas: night city, workshop, rain, traffic, day/night toggle. */
(function () {
  "use strict";

  const canvas = document.getElementById("cityCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const W = canvas.width;
  const H = canvas.height;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const stage = canvas.closest(".crt-screen") || canvas;

  ctx.imageSmoothingEnabled = false;

  const DAY = {
    skyTop: [55, 96, 76],
    skyBot: [158, 191, 156],
    far: [102, 136, 110],
    mid: [80, 112, 88],
    near: [62, 90, 70],
    ground: [70, 92, 72],
    road: [48, 62, 50],
    line: [206, 222, 164],
    window: [242, 246, 192],
    windowOff: [92, 118, 96],
    neon: [122, 214, 150],
    neon2: [169, 239, 189],
    lamp: [236, 255, 214],
    moon: [255, 255, 222],
    star: 0,
    rain: 0.25,
    glow: 0.18,
  };

  const NIGHT = {
    skyTop: [4, 14, 9],
    skyBot: [14, 42, 28],
    far: [8, 25, 15],
    mid: [14, 38, 23],
    near: [18, 48, 30],
    ground: [14, 32, 20],
    road: [7, 17, 11],
    line: [190, 214, 150],
    window: [201, 242, 168],
    windowOff: [30, 54, 36],
    neon: [122, 214, 150],
    neon2: [169, 239, 189],
    lamp: [214, 255, 196],
    moon: [234, 246, 214],
    star: 1,
    rain: 1,
    glow: 1,
  };

  let night = true;
  let mixNow = 1;
  let mixTarget = 1;
  let mixFrom = 1;
  let mixStart = 0;

  function lerp(a, b, t) { return a + (b - a) * t; }
  function mixColor(a, b, t) {
    return [
      Math.round(lerp(a[0], b[0], t)),
      Math.round(lerp(a[1], b[1], t)),
      Math.round(lerp(a[2], b[2], t)),
    ];
  }
  function pal(key, t) {
    if (Array.isArray(NIGHT[key])) return mixColor(DAY[key], NIGHT[key], t);
    return lerp(DAY[key], NIGHT[key], t);
  }
  function rgb(c, a) {
    if (a === undefined) return "rgb(" + c[0] + "," + c[1] + "," + c[2] + ")";
    return "rgba(" + c[0] + "," + c[1] + "," + c[2] + "," + a + ")";
  }

  // Deterministic pseudo-random.
  let seed = 1337;
  function rnd() {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  }

  // ---------------------------------------------------------------- layout
  const farBuildings = [];
  let x = -4;
  while (x < W + 8) {
    const w = 9 + Math.floor(rnd() * 18);
    const h = 26 + Math.floor(rnd() * 52);
    const windows = [];
    for (let wy = 4; wy < h - 6; wy += 5) {
      for (let wx = 3; wx < w - 3; wx += 4) {
        if (rnd() > 0.52) windows.push({ x: wx, y: wy, phase: rnd() * 8 });
      }
    }
    farBuildings.push({ x: x, w: w, h: h, windows: windows, antenna: rnd() > 0.7 });
    x += w + 1;
  }

  const midBuildings = [];
  x = -6;
  while (x < W + 10) {
    const w = 16 + Math.floor(rnd() * 22);
    const h = 20 + Math.floor(rnd() * 40);
    const windows = [];
    for (let wy = 5; wy < h - 5; wy += 6) {
      for (let wx = 4; wx < w - 4; wx += 5) {
        if (rnd() > 0.58) windows.push({ x: wx, y: wy, phase: rnd() * 8 });
      }
    }
    midBuildings.push({ x: x, w: w, h: h, windows: windows, roof: rnd() > 0.5 });
    x += w + 2;
  }

  const lamps = [112, 186, 260];
  const rain = [];
  for (let i = 0; i < 70; i++) {
    rain.push({
      x: rnd() * W,
      y: rnd() * H,
      len: 2 + Math.floor(rnd() * 4),
      speed: 26 + rnd() * 34,
      alpha: 0.12 + rnd() * 0.3,
    });
  }

  const steam = [];
  for (let i = 0; i < 10; i++) {
    steam.push({ x: 74 + rnd() * 4, y: 134 - rnd() * 18, r: 1 + rnd() * 2, phase: rnd() * 6 });
  }

  const cars = [
    { x: 30, dir: 1, speed: 34, color: [126, 191, 143], y: 165 },
    { x: 250, dir: -1, speed: 25, color: [96, 160, 142], y: 175 },
  ];

  let ptrX = 0, ptrY = 0;
  let targetPtrX = 0, targetPtrY = 0;
  let visible = true;
  let last = 0;
  let acc = 0;
  let t = 0;

  // ---------------------------------------------------------------- drawing
  function drawSky(p) {
    const g = ctx.createLinearGradient(0, 0, 0, 126);
    g.addColorStop(0, rgb(pal("skyTop", p)));
    g.addColorStop(1, rgb(pal("skyBot", p)));
    ctx.fillStyle = g;
    ctx.fillRect(-6, -6, W + 12, 132);

    // stars
    const starA = pal("star", p);
    if (starA > 0.03) {
      for (let i = 0; i < 46; i++) {
        const sx = (i * 71) % W;
        const sy = (i * 37) % 70 + 4;
        const tw = 0.4 + 0.6 * Math.abs(Math.sin(t * 0.7 + i));
        ctx.fillStyle = "rgba(238,246,222," + (0.18 + tw * 0.55) * starA + ")";
        ctx.fillRect(sx, sy, 1, 1);
      }
    }

    // moon / sun
    const mx = 248, my = 32;
    ctx.fillStyle = rgb(pal("moon", p), 0.94);
    ctx.beginPath();
    ctx.arc(mx, my, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = rgb(pal("skyTop", p), 0.92);
    ctx.beginPath();
    ctx.arc(mx + 5, my - 3, 10, 0, Math.PI * 2);
    ctx.fill();

    // clouds
    for (let i = 0; i < 4; i++) {
      const cx = ((i * 97 + t * (3 + i)) % (W + 120)) - 60;
      const cy = 28 + i * 13;
      ctx.fillStyle = rgb(pal("skyBot", p), 0.32);
      ctx.fillRect(cx, cy, 38 + i * 8, 2);
      ctx.fillRect(cx + 8, cy - 2, 24 + i * 5, 2);
    }
  }

  function drawBuildings(list, baseY, p, depth) {
    const off = ptrX * depth;
    const col = rgb(pal("far", p));
    const winOn = pal("window", p);
    const winOff = pal("windowOff", p);
    const winA = 0.35 + pal("glow", p) * 0.65;
    for (let i = 0; i < list.length; i++) {
      const b = list[i];
      const bx = Math.round(b.x + off);
      ctx.fillStyle = col;
      ctx.fillRect(bx, baseY - b.h, b.w, b.h);
      // roof detail
      ctx.fillStyle = rgb(pal("skyTop", p), 0.35);
      ctx.fillRect(bx, baseY - b.h, b.w, 1);
      if (b.antenna) {
        ctx.fillStyle = rgb(pal("neon2"), 0.8);
        ctx.fillRect(bx + Math.floor(b.w / 2), baseY - b.h - 5, 1, 5);
        if (Math.sin(t * 2.2 + i) > 0.2) {
          ctx.fillStyle = rgb([185, 245, 201], 0.9);
          ctx.fillRect(bx + Math.floor(b.w / 2), baseY - b.h - 6, 1, 1);
        }
      }
      for (let j = 0; j < b.windows.length; j++) {
        const w = b.windows[j];
        const lit = Math.sin(t * 0.24 + w.phase) > -0.55;
        ctx.fillStyle = lit ? rgb(winOn, winA) : rgb(winOff, 0.55);
        ctx.fillRect(bx + w.x, baseY - b.h + w.y, 2, 2);
      }
    }
  }

  function drawShop(p) {
    const off = Math.round(ptrX * 3);
    const sx = 8 + off;
    const base = 158;
    const w = 88;
    const h = 66;

    // body
    ctx.fillStyle = rgb(pal("near", p));
    ctx.fillRect(sx, base - h, w, h);
    ctx.fillStyle = "rgba(0,0,0,0.18)";
    ctx.fillRect(sx, base - h, w, 2);

    // roof edge + vents
    ctx.fillStyle = rgb(pal("ground", p));
    ctx.fillRect(sx - 2, base - h - 3, w + 4, 3);
    ctx.fillStyle = rgb(pal("mid", p));
    ctx.fillRect(sx + 10, base - h - 8, 9, 5);
    ctx.fillRect(sx + 62, base - h - 7, 13, 4);
    ctx.fillStyle = rgb(pal("neon2"), 0.55);
    ctx.fillRect(sx + 14, base - h - 7, 2, 2);

    // upper windows
    for (let i = 0; i < 3; i++) {
      const wx = sx + 8 + i * 18;
      const lit = Math.sin(t * 0.5 + i * 1.7) > -0.2;
      ctx.fillStyle = lit ? rgb(pal("window", p), 0.85) : rgb(pal("windowOff", p), 0.8);
      ctx.fillRect(wx, base - h + 9, 12, 9);
      ctx.fillStyle = "rgba(0,0,0,0.4)";
      ctx.fillRect(wx + 5, base - h + 9, 1, 9);
      ctx.fillRect(wx, base - h + 13, 12, 1);
    }

    // sign board
    const signY = base - h + 24;
    ctx.fillStyle = "rgba(4,10,12,0.88)";
    ctx.fillRect(sx + 4, signY, w - 8, 14);
    ctx.strokeStyle = rgb(pal("neon", p), 0.9);
    ctx.lineWidth = 1;
    ctx.strokeRect(sx + 4.5, signY + 0.5, w - 9, 13);

    const flicker = Math.sin(t * 9.1) > -0.86 ? 1 : 0.25;
    ctx.fillStyle = rgb(pal("neon", p), 0.95 * flicker);
    ctx.font = "6px monospace";
    ctx.textAlign = "center";
    ctx.fillText("PIXEL PATCH", sx + w / 2, signY + 8);
    ctx.fillStyle = rgb(pal("neon2", p), 0.9);
    ctx.font = "4px monospace";
    ctx.fillText("SERWIS 24H", sx + w / 2, signY + 12);

    // shop window
    const wy = signY + 20;
    ctx.fillStyle = "rgba(6,14,18,0.94)";
    ctx.fillRect(sx + 6, wy, 48, 20);
    ctx.fillStyle = rgb(pal("window", p), 0.20 + pal("glow", p) * 0.12);
    ctx.fillRect(sx + 8, wy + 2, 44, 16);
    // silhouettes of parts on shelves
    ctx.fillStyle = "rgba(8,16,20,0.85)";
    ctx.fillRect(sx + 11, wy + 8, 9, 8);
    ctx.fillRect(sx + 23, wy + 11, 7, 5);
    ctx.fillRect(sx + 34, wy + 7, 12, 9);
    ctx.fillStyle = rgb(pal("neon2", p), 0.75);
    ctx.fillRect(sx + 14, wy + 10, 2, 1);
    ctx.fillStyle = rgb(pal("neon", p), 0.8);
    ctx.fillRect(sx + 38, wy + 10, 3, 1);
    // window frame
    ctx.fillStyle = "rgba(0,0,0,0.45)";
    ctx.fillRect(sx + 29, wy, 1, 20);

    // door with warm light
    const doorX = sx + 60;
    ctx.fillStyle = "rgba(5,12,15,0.95)";
    ctx.fillRect(doorX, base - 24, 18, 24);
    ctx.fillStyle = rgb(pal("window", p), 0.22 + pal("glow", p) * 0.14);
    ctx.fillRect(doorX + 2, base - 22, 14, 22);
    ctx.fillStyle = rgb(pal("neon2", p), 0.9);
    ctx.fillRect(doorX + 12, base - 13, 1, 2);

    // awning
    ctx.fillStyle = rgb(pal("neon", p), 0.9);
    for (let i = 0; i < 7; i++) {
      ctx.fillRect(sx + 4 + i * 12, base - 27, 6, 5);
    }
    ctx.fillStyle = "rgba(4,10,12,0.55)";
    for (let i = 0; i < 7; i++) {
      ctx.fillRect(sx + 10 + i * 12, base - 27, 6, 5);
    }

    // glow pool from the shop
    const g = ctx.createRadialGradient(sx + 40, base - 12, 2, sx + 40, base - 12, 46);
    g.addColorStop(0, rgb(pal("window", p), 0.16 * pal("glow", p)));
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(sx - 12, base - 54, 116, 64);

    // steam from vent
    for (let i = 0; i < steam.length; i++) {
      const s = steam[i];
      const life = (t * 0.22 + s.phase) % 4;
      ctx.fillStyle = "rgba(214,228,220," + Math.max(0, (0.16 - life * 0.035)) + ")";
      ctx.beginPath();
      ctx.arc(s.x + Math.sin(t + i) * 3, s.y - life * 6, s.r + life * 0.4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawGround(p) {
    // sidewalk
    ctx.fillStyle = rgb(pal("ground", p));
    ctx.fillRect(0, 140, W, 10);
    ctx.fillStyle = "rgba(0,0,0,0.22)";
    for (let i = 0; i < W; i += 14) ctx.fillRect(i, 140, 1, 10);
    ctx.fillRect(0, 149, W, 1);

    // road
    ctx.fillStyle = rgb(pal("road", p));
    ctx.fillRect(0, 150, W, 30);
    ctx.fillStyle = rgb(pal("line", p), 0.55);
    for (let i = -10; i < W; i += 26) ctx.fillRect(i, 158, 12, 1);
    ctx.fillStyle = rgb(pal("line", p), 0.24);
    ctx.fillRect(0, 150, W, 1);
    ctx.fillRect(0, 179, W, 1);

    // crosswalk hint
    for (let i = 0; i < 8; i++) {
      ctx.fillStyle = rgb(pal("line", p), 0.16);
      ctx.fillRect(120 + i * 7, 171, 3, 7);
    }

    // lamp posts + pools of light
    for (let i = 0; i < lamps.length; i++) {
      const lx = lamps[i] + Math.round(ptrX * 4);
      ctx.fillStyle = "rgba(8,16,20,0.9)";
      ctx.fillRect(lx, 118, 1, 30);
      ctx.fillRect(lx, 118, 4, 1);
      ctx.fillStyle = rgb(pal("lamp", p), 0.95);
      ctx.fillRect(lx + 3, 119, 2, 2);
      if (pal("glow", p) > 0.2) {
        const lg = ctx.createRadialGradient(lx + 4, 120, 1, lx + 4, 120, 18);
        lg.addColorStop(0, rgb(pal("lamp", p), 0.22 * pal("glow", p)));
        lg.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = lg;
        ctx.fillRect(lx - 16, 104, 40, 40);
      }
      // pool on pavement
      ctx.fillStyle = rgb(pal("lamp", p), 0.05 + pal("glow", p) * 0.05);
      ctx.beginPath();
      ctx.ellipse(lx + 4, 146, 14, 3, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawCar(c, p) {
    const baseY = c.y;
    const bx = Math.round(c.x) + Math.round(ptrX * 5);
    const dir = c.dir;
    // shadow
    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.fillRect(bx - 1, baseY + 5, 18, 2);
    // body
    ctx.fillStyle = rgb(c.color);
    ctx.fillRect(bx, baseY, 16, 5);
    ctx.fillStyle = "rgba(255,255,255,0.10)";
    ctx.fillRect(bx, baseY, 16, 1);
    // cabin
    ctx.fillStyle = rgb([18, 34, 40]);
    ctx.fillRect(bx + (dir > 0 ? 4 : 3), baseY - 3, 7, 3);
    ctx.fillStyle = rgb([92, 150, 160], 0.7);
    ctx.fillRect(bx + (dir > 0 ? 5 : 4), baseY - 2, 5, 2);
    // wheels
    ctx.fillStyle = "#070c0e";
    ctx.fillRect(bx + 2, baseY + 4, 3, 2);
    ctx.fillRect(bx + 11, baseY + 4, 3, 2);
    // headlights / tail lights
    if (dir > 0) {
      ctx.fillStyle = rgb([228, 255, 214], 0.95);
      ctx.fillRect(bx + 16, baseY + 1, 2, 2);
      ctx.fillStyle = rgb([185, 245, 201], 0.85);
      ctx.fillRect(bx - 1, baseY + 1, 1, 2);
      const beam = ctx.createLinearGradient(bx + 18, baseY, bx + 62, baseY + 3);
      beam.addColorStop(0, "rgba(228,255,214," + 0.14 * pal("glow", p) + ")");
      beam.addColorStop(1, "rgba(228,255,214,0)");
      ctx.fillStyle = beam;
      ctx.fillRect(bx + 18, baseY, 44, 4);
    } else {
      ctx.fillStyle = rgb([228, 255, 214], 0.95);
      ctx.fillRect(bx - 2, baseY + 1, 2, 2);
      ctx.fillStyle = rgb([185, 245, 201], 0.85);
      ctx.fillRect(bx + 16, baseY + 1, 1, 2);
      const beam = ctx.createLinearGradient(bx - 2, baseY, bx - 46, baseY + 3);
      beam.addColorStop(0, "rgba(228,255,214," + 0.12 * pal("glow", p) + ")");
      beam.addColorStop(1, "rgba(228,255,214,0)");
      ctx.fillStyle = beam;
      ctx.fillRect(bx - 46, baseY, 44, 4);
    }
    // wet road reflection
    ctx.fillStyle = rgb(c.color, 0.10);
    ctx.fillRect(bx + 2, baseY + 6, 12, 1);
  }

  function drawRain(p) {
    const a = pal("rain", p);
    if (a < 0.05) return;
    ctx.strokeStyle = "rgba(180,214,220," + 0.22 * a + ")";
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i < rain.length; i++) {
      const d = rain[i];
      ctx.moveTo(Math.round(d.x), Math.round(d.y));
      ctx.lineTo(Math.round(d.x - 1), Math.round(d.y + d.len));
    }
    ctx.stroke();
  }

  function drawVignette() {
    const g = ctx.createRadialGradient(W / 2, H / 2, 60, W / 2, H / 2, 210);
    g.addColorStop(0, "rgba(0,0,0,0)");
    g.addColorStop(1, "rgba(0,0,0,0.32)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }

  function draw() {
    const p = mixNow;
    ctx.save();
    ctx.translate(0, ptrY * 1.2);
    drawSky(p);
    drawBuildings(farBuildings, 118, p, 1.2);
    drawBuildings(midBuildings, 140, p, 2.2);
    drawShop(p);
    drawGround(p);
    for (let i = 0; i < cars.length; i++) drawCar(cars[i], p);
    drawRain(p);
    ctx.restore();
    drawVignette();
  }

  // ---------------------------------------------------------------- loop
  function update(dt) {
    t += dt;

    mixNow = mixTarget;
    if (mixStart) {
      const k = Math.min(1, (performance.now() - mixStart) / 900);
      mixNow = lerp(mixFrom, mixTarget, k * k * (3 - 2 * k));
      if (k >= 1) mixStart = 0;
    }

    ptrX += (targetPtrX - ptrX) * 0.06;
    ptrY += (targetPtrY - ptrY) * 0.06;

    for (let i = 0; i < cars.length; i++) {
      const c = cars[i];
      c.x += c.dir * c.speed * dt;
      if (c.dir > 0 && c.x > W + 20) c.x = -24;
      if (c.dir < 0 && c.x < -20) c.x = W + 24;
    }
    for (let i = 0; i < rain.length; i++) {
      const d = rain[i];
      d.y += d.speed * dt;
      d.x -= 6 * dt;
      if (d.y > H) { d.y = -6; d.x = Math.random() * W; }
    }
  }

  function frame(now) {
    const dt = Math.min(0.06, (now - last) / 1000 || 0);
    last = now;
    if (!reduceMotion.matches) update(dt);
    draw();
    if (visible && !reduceMotion.matches) requestAnimationFrame(frame);
  }

  // ---------------------------------------------------------------- interaction
  canvas.addEventListener("pointermove", function (e) {
    if (reduceMotion.matches) return;
    const rect = canvas.getBoundingClientRect();
    targetPtrX = (e.clientX / rect.width - 0.5) * 2;
    targetPtrY = (e.clientY / rect.height - 0.5) * 2;
  }, { passive: true });
  canvas.addEventListener("pointerleave", function () {
    targetPtrX = 0;
    targetPtrY = 0;
  });

  function setLine() {
    const line = document.getElementById("crtLine");
    if (!line) return;
    line.textContent = night
      ? "Nocna zmiana. Miasto nie śpi."
      : "Dzienna zmiana. Kawa już wystygła.";
  }

  canvas.addEventListener("click", function () {
    toggleTime();
  });

  function toggleTime() {
    night = !night;
    mixFrom = mixNow;
    mixTarget = night ? 1 : 0;
    mixStart = performance.now();
    setLine();
    if (reduceMotion.matches) {
      mixNow = mixTarget;
      draw();
    }
  }

  canvas.addEventListener("keydown", function (event) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggleTime();
    }
  });
  canvas.style.cursor = "pointer";

  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      const wasVisible = visible;
      visible = !!(entries[0] && entries[0].isIntersecting);
      if (visible && !wasVisible) {
        last = performance.now();
        requestAnimationFrame(frame);
      }
    }, { rootMargin: "100px" }).observe(stage);
  }

  // clock in the CRT corner
  const clock = document.getElementById("crtClock");
  if (clock) {
    const upd = function () {
      clock.textContent = new Date().toLocaleTimeString("pl-PL", {
        hour: "2-digit", minute: "2-digit", hour12: false,
      });
    };
    upd();
    window.setInterval(upd, 15000);
  }

  setLine();
  draw();
  last = performance.now();
  if (!reduceMotion.matches) requestAnimationFrame(frame);

  reduceMotion.addEventListener("change", function () {
    if (reduceMotion.matches) { draw(); }
    else { last = performance.now(); requestAnimationFrame(frame); }
  });
})();
