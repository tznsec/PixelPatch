(function () {
  "use strict";

  const header = document.querySelector(".site-header");
  const onScroll = () => {
    if (!header) return;
    header.classList.toggle("scrolled", window.scrollY > 8);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // ---- paski postępu -----------------------------------------------------
  document.querySelectorAll(".bar[data-progress]").forEach((bar) => {
    const value = Math.max(0, Math.min(100, parseInt(bar.dataset.progress, 10) || 0));
    const fill = bar.querySelector("span");
    if (!fill) return;
    requestAnimationFrame(() => {
      fill.style.width = value + "%";
    });
  });

  // ---- odliczanie do premiery -------------------------------------------
  const START = new Date(2026, 9, 25, 0, 0, 0); // 25.10.2026 — dzień 1
  const END = new Date(2027, 9, 25, 0, 0, 0);   // 25.10.2027 — premiera

  const cdD = document.getElementById("cd-d");
  const cdH = document.getElementById("cd-h");
  const cdM = document.getElementById("cd-m");
  const cdS = document.getElementById("cd-s");
  const cdDay = document.getElementById("cd-day");
  const cdFill = document.getElementById("cd-fill");
  const cdLabel = document.querySelector(".cd-label");

  const pad2 = (n) => (n < 10 ? "0" + n : String(n));

  function tickCountdown() {
    if (!cdD) return;
    const now = new Date();
    const total = END.getTime() - START.getTime();
    const remain = Math.max(0, END.getTime() - now.getTime());
    const elapsed = Math.min(Math.max(0, now.getTime() - START.getTime()), total);

    cdD.textContent = String(Math.floor(remain / 86400000));
    cdH.textContent = pad2(Math.floor((remain % 86400000) / 3600000));
    cdM.textContent = pad2(Math.floor((remain % 3600000) / 60000));
    cdS.textContent = pad2(Math.floor((remain % 60000) / 1000));

    if (cdDay) {
      cdDay.textContent = String(Math.min(365, Math.floor(elapsed / 86400000) + 1));
    }
    if (cdFill) {
      cdFill.style.width = ((elapsed / total) * 100).toFixed(2) + "%";
    }
    if (remain <= 0 && cdLabel) {
      cdLabel.innerHTML = "Premiera <b>Pixel Patch</b> — jest!";
    }
  }

  tickCountdown();
  window.setInterval(tickCountdown, 1000);


  // ---- liczniki statusu (dzień, premiera, wiek builda, czas) -------------
  const stDay = document.getElementById("st-day");
  const stLeft = document.getElementById("st-left");
  const stBuild = document.getElementById("st-build");
  const stClock = document.getElementById("st-clock");
  const heroDay = document.getElementById("hero-day");
  const BUILD_DATE = new Date(2026, 9, 26, 0, 0, 0);

  function tickStatus() {
    if (!stDay) return;
    const now = new Date();
    const day = Math.min(365, Math.floor((now.getTime() - START.getTime()) / 86400000) + 1);
    const left = Math.max(0, Math.floor((END.getTime() - now.getTime()) / 86400000));
    const build = Math.max(0, Math.floor((now.getTime() - BUILD_DATE.getTime()) / 86400000));
    stDay.textContent = String(day);
    stLeft.textContent = String(left);
    stBuild.textContent = String(build);
    if (heroDay) heroDay.textContent = String(day);
    stClock.textContent = now.toLocaleTimeString("pl-PL", {
      hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false,
    });
  }

  tickStatus();
  window.setInterval(tickStatus, 1000);

  // ---- intro / splash ----------------------------------------------------
  const splash = document.getElementById("splash");
  const splashSkip = document.getElementById("splash-skip");
  const replayIntro = document.getElementById("replay-intro");
  const INTRO_KEY = "pixel_patch_intro_seen";
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let introTimers = [];

  function introSeen() {
    try { return sessionStorage.getItem(INTRO_KEY) === "1"; } catch (_) { return false; }
  }
  function markIntroSeen() {
    try { sessionStorage.setItem(INTRO_KEY, "1"); } catch (_) { /* ignore */ }
  }
  function clearIntroTimers() {
    introTimers.forEach((id) => window.clearTimeout(id));
    introTimers = [];
  }
  function markPageReady() {
    document.body.classList.add("page-ready");
  }
  function finishIntro() {
    if (!splash || splash.hidden) return;
    clearIntroTimers();
    splash.classList.add("out");
    introTimers.push(window.setTimeout(() => {
      splash.hidden = true;
      splash.classList.remove("out", "run", "hit", "labels");
      document.body.classList.remove("intro-open");
      markPageReady();
    }, 420));
  }
  function playIntro(force) {
    if (!splash) {
      markPageReady();
      return;
    }
    if (!force && introSeen()) {
      markPageReady();
      return;
    }
    markIntroSeen();
    clearIntroTimers();
    document.body.classList.remove("page-ready");
    splash.hidden = false;
    splash.classList.remove("out", "run", "hit", "labels");
    void splash.offsetWidth; // restart animacji
    document.body.classList.add("intro-open");
    splash.classList.add("run");

    if (reducedMotion.matches) {
      splash.classList.add("hit", "labels");
      introTimers.push(window.setTimeout(finishIntro, 2400));
    } else {
      introTimers.push(window.setTimeout(() => splash.classList.add("hit"), 900));
      introTimers.push(window.setTimeout(() => splash.classList.add("labels"), 1500));
      introTimers.push(window.setTimeout(finishIntro, 4200));
    }
    if (splashSkip) splashSkip.focus({ preventScroll: true });
  }

  if (splashSkip) splashSkip.addEventListener("click", finishIntro);
  if (splash) {
    splash.addEventListener("click", (event) => {
      if (event.target === splash) finishIntro();
    });
  }
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && splash && !splash.hidden) finishIntro();
  });
  if (replayIntro) {
    replayIntro.addEventListener("click", () => playIntro(true));
  }

  playIntro(false);

  // ---- lightbox ----------------------------------------------------------
  const lb = document.getElementById("lightbox");
  const lbImg = document.getElementById("lb-img");
  const lbClose = document.getElementById("lb-close");
  let lastFocus = null;

  function openLightbox(src, alt) {
    if (!lb || !lbImg) return;
    lastFocus = document.activeElement;
    lbImg.src = src;
    lbImg.alt = alt || "Zrzut ekranu z gry Pixel Patch";
    lb.hidden = false;
    document.body.style.overflow = "hidden";
    if (lbClose) lbClose.focus();
  }

  function closeLightbox() {
    if (!lb) return;
    lb.hidden = true;
    lbImg.src = "";
    document.body.style.overflow = "";
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  document.querySelectorAll(".shot").forEach((shot) => {
    shot.addEventListener("click", () => {
      const img = shot.querySelector("img");
      openLightbox(shot.dataset.full || (img && img.src), img && img.alt);
    });
  });

  if (lbClose) lbClose.addEventListener("click", closeLightbox);
  if (lb) {
    lb.addEventListener("click", (event) => {
      if (event.target === lb) closeLightbox();
    });
  }
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && lb && !lb.hidden) closeLightbox();
  });

  // ---- toast / wishlist --------------------------------------------------
  const toast = document.getElementById("toast");
  let toastTimer = null;

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    if (toastTimer) window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
      toast.classList.remove("show");
    }, 4200);
  }

  const wish = document.getElementById("wishlist");
  if (wish) {
    wish.addEventListener("click", () => {
      showToast("Karta Steam pojawi się bliżej premiery. Do tego czasu buildy testowe leżą obok — w folderach PC i Android.");
    });
  }
})();
