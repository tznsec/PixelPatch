/* Easter egg: 6 clicks on the logo = Halloween mode + spooky music. */
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

  let audioCtx = null;
  let master = null;
  let musicTimer = null;
  let noiseBuffer = null;

  function ensureLayer() {
    if (layer) return;
    layer = document.createElement("div");
    layer.className = "halloween-layer";
    layer.setAttribute("aria-hidden", "true");
    const items = [
      { icon: "🎃", x: "6%", y: "18%", size: 44, dur: 9, delay: 0 },
      { icon: "🎃", x: "88%", y: "64%", size: 34, dur: 11, delay: 1.2 },
      { icon: "🦇", x: "14%", y: "72%", size: 28, dur: 8, delay: 0.4 },
      { icon: "🦇", x: "72%", y: "14%", size: 22, dur: 10, delay: 0.9 },
      { icon: "🦇", x: "46%", y: "82%", size: 18, dur: 7, delay: 1.6 },
      { icon: "🎃", x: "76%", y: "86%", size: 26, dur: 12, delay: 2.1 },
    ];
    items.forEach(function (item) {
      const el = document.createElement("span");
      el.className = "h-decor";
      el.textContent = item.icon;
      el.style.left = item.x;
      el.style.top = item.y;
      el.style.fontSize = item.size + "px";
      el.style.animationDuration = item.dur + "s";
      el.style.animationDelay = "-" + item.delay + "s";
      layer.appendChild(el);
    });
    document.body.appendChild(layer);

    badge = document.createElement("button");
    badge.type = "button";
    badge.className = "halloween-badge";
    badge.textContent = "🎃 HALLOWEEN MODE · 6× logo = OFF";
    badge.addEventListener("click", toggleHalloween);
    document.body.appendChild(badge);
  }

  function toggleHalloween() {
    active = !active;
    ensureLayer();
    document.body.classList.toggle("halloween-mode", active);
    badge.classList.toggle("on", active);
    if (active) {
      startMusic();
      document.title = "🎃 Pixel Patch — Halloween";
      showToast("HALLOWEEN MODE: muzyka i klimat włączone.");
    } else {
      stopMusic();
      document.title = baseTitle;
      showToast("HALLOWEEN MODE wyłączony.");
    }
  }

  function showToast(text) {
    let toast = document.querySelector(".halloween-toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.className = "halloween-toast";
      document.body.appendChild(toast);
    }
    toast.textContent = text;
    toast.classList.add("show");
    window.clearTimeout(showToast._timer);
    showToast._timer = window.setTimeout(function () {
      toast.classList.remove("show");
    }, 2600);
  }

  function getCtx() {
    if (audioCtx) return audioCtx;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    audioCtx = new AC();
    master = audioCtx.createGain();
    master.gain.value = 0.18;
    master.connect(audioCtx.destination);
    noiseBuffer = audioCtx.createBuffer(1, audioCtx.sampleRate * 3, audioCtx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    return audioCtx;
  }

  function tone(freq, start, dur, type, vol, detune) {
    const ctx = audioCtx;
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type || "triangle";
    osc.frequency.value = freq;
    if (detune) osc.detune.value = detune;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.linearRampToValueAtTime(vol, start + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    osc.connect(gain);
    gain.connect(master);
    osc.start(start);
    osc.stop(start + dur + 0.05);
  }

  function wind(start, dur, vol) {
    if (!audioCtx || !noiseBuffer) return;
    const src = audioCtx.createBufferSource();
    const filter = audioCtx.createBiquadFilter();
    const gain = audioCtx.createGain();
    src.buffer = noiseBuffer;
    src.loop = true;
    filter.type = "lowpass";
    filter.frequency.value = 420;
    filter.Q.value = 1.2;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.linearRampToValueAtTime(vol, start + 1.2);
    gain.gain.setValueAtTime(vol, start + dur - 1.5);
    gain.gain.linearRampToValueAtTime(0.0001, start + dur);
    src.connect(filter);
    filter.connect(gain);
    gain.connect(master);
    src.start(start);
    src.stop(start + dur + 0.1);
  }

  function scheduleLoop() {
    if (!audioCtx || !master) return;
    const t = audioCtx.currentTime + 0.08;
    // Low organ drone.
    tone(73.42, t, 9.6, "sine", 0.055);
    tone(110.0, t, 9.6, "triangle", 0.022, -7);
    tone(146.83, t, 9.6, "sine", 0.014, 5);
    wind(t, 9.6, 0.035);

    // Creepy music-box melody in D minor.
    const melody = [
      [0.00, 293.66, 0.42], [0.48, 349.23, 0.34], [0.88, 440.00, 0.40],
      [1.36, 523.25, 0.34], [1.74, 466.16, 0.42], [2.20, 440.00, 0.38],
      [2.62, 392.00, 0.44], [3.10, 349.23, 0.36], [3.50, 329.63, 0.46],
      [4.00, 293.66, 0.62], [4.78, 220.00, 0.44], [5.26, 261.63, 0.40],
      [5.68, 293.66, 0.60], [6.40, 349.23, 0.38], [6.82, 329.63, 0.46],
      [7.30, 293.66, 0.55], [7.92, 220.00, 0.50], [8.46, 196.00, 0.62],
    ];
    melody.forEach(function (n) {
      tone(n[1], t + n[0], n[2], "triangle", 0.105);
      tone(n[1] * 2.01, t + n[0], n[2] * 0.75, "sine", 0.018);
    });
    // Distant bell / sting.
    tone(880.0, t + 0.3, 0.5, "sine", 0.030);
    tone(987.77, t + 4.9, 0.7, "sine", 0.024);
    tone(1567.98, t + 8.7, 0.4, "triangle", 0.016);

    musicTimer = window.setTimeout(scheduleLoop, 9600);
  }

  function startMusic() {
    const ctx = getCtx();
    if (!ctx) return;
    if (ctx.state === "suspended") ctx.resume().catch(function () {});
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

  brand.addEventListener("click", function (event) {
    clicks += 1;
    window.clearTimeout(resetTimer);
    resetTimer = window.setTimeout(function () { clicks = 0; }, 2600);
    if (clicks >= 6) {
      clicks = 0;
      window.clearTimeout(resetTimer);
      event.preventDefault();
      toggleHalloween();
    }
  });

  // Small debug hook for tests; harmless in normal use.
  window.__halloweenToggle = toggleHalloween;
})();
