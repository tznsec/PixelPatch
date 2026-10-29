(function () {
  "use strict";

  // ------------------------------------------------------------ header
  const header = document.querySelector(".site-header");
  const nav = document.getElementById("nav");
  const navToggle = document.getElementById("navToggle");

  function onScroll() {
    if (header) header.classList.toggle("scrolled", window.scrollY > 8);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (navToggle && nav) {
    navToggle.addEventListener("click", function () {
      const open = nav.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        nav.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  // ------------------------------------------------------------ odliczanie
  const START = new Date(2026, 9, 25, 0, 0, 0); // 25.10.2026
  const END = new Date(2027, 9, 25, 0, 0, 0);   // 25.10.2027
  const BUILD_DATE = new Date(2026, 9, 27, 0, 0, 0); // build Code & Copper 1.0

  const cdD = document.getElementById("cd-d");
  const cdH = document.getElementById("cd-h");
  const cdM = document.getElementById("cd-m");
  const cdS = document.getElementById("cd-s");
  const cdDay = document.getElementById("cd-day");
  const cdFill = document.getElementById("cd-fill");
  const cdLabel = document.querySelector(".cd-label");

  const stDay = document.getElementById("st-day");
  const stLeft = document.getElementById("st-left");
  const stBuild = document.getElementById("st-build");
  const stClock = document.getElementById("st-clock");
  const heroDay = document.getElementById("hero-day");

  const pad2 = (n) => (n < 10 ? "0" + n : String(n));

  function currentDay(now) {
    const elapsed = Math.max(0, now.getTime() - START.getTime());
    return Math.min(365, Math.floor(elapsed / 86400000) + 1);
  }

  function tick() {
    const now = new Date();
    const total = END.getTime() - START.getTime();
    const remain = Math.max(0, END.getTime() - now.getTime());
    const elapsed = Math.min(Math.max(0, now.getTime() - START.getTime()), total);
    const day = currentDay(now);
    const left = Math.max(0, Math.floor(remain / 86400000));
    const build = Math.max(0, Math.floor((now.getTime() - BUILD_DATE.getTime()) / 86400000));

    if (cdD) {
      cdD.textContent = String(Math.floor(remain / 86400000));
      cdH.textContent = pad2(Math.floor((remain % 86400000) / 3600000));
      cdM.textContent = pad2(Math.floor((remain % 3600000) / 60000));
      cdS.textContent = pad2(Math.floor((remain % 60000) / 1000));
    }
    if (cdDay) cdDay.textContent = String(day);
    if (cdFill) cdFill.style.width = ((elapsed / total) * 100).toFixed(2) + "%";
    if (remain <= 0 && cdLabel) cdLabel.innerHTML = "Premiera <b>Pixel Patch</b> — jest!";

    if (stDay) stDay.textContent = String(day);
    if (stLeft) stLeft.textContent = String(left);
    if (stBuild) stBuild.textContent = String(build);
    if (heroDay) heroDay.textContent = String(day);
    if (stClock) {
      stClock.textContent = now.toLocaleTimeString("pl-PL", {
        hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false,
      });
    }
  }

  tick();
  window.setInterval(tick, 1000);

  // ------------------------------------------------------------ reveal
  const revealItems = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    revealItems.forEach(function (el) { io.observe(el); });
    window.setTimeout(function () {
      revealItems.forEach(function (el) { el.classList.add("in"); });
    }, 2200);
  } else {
    revealItems.forEach(function (el) { el.classList.add("in"); });
  }

  // ------------------------------------------------------------ galeria / lightbox
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightboxImg");
  const lightboxClose = document.getElementById("lightboxClose");
  const shots = document.querySelectorAll(".shot");

  function openLightbox(src, alt, caption) {
    if (!lightbox || !lightboxImg) return;
    lightboxImg.src = src;
    lightboxImg.alt = alt || "";
    const cap = document.getElementById("lightboxCap");
    if (cap) cap.textContent = caption || alt || "";
    lightbox.hidden = false;
    document.body.style.overflow = "hidden";
    if (lightboxClose) lightboxClose.focus();
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.hidden = true;
    lightboxImg.src = "";
    document.body.style.overflow = "";
  }

  shots.forEach(function (shot) {
    shot.addEventListener("click", function () {
      const img = shot.querySelector("img");
      const label = shot.querySelector("span");
      openLightbox(shot.dataset.src, img ? img.alt : "", label ? label.textContent : "");
    });
  });

  if (lightboxClose) lightboxClose.addEventListener("click", closeLightbox);
  if (lightbox) {
    lightbox.addEventListener("click", function (event) {
      if (event.target === lightbox) closeLightbox();
    });
  }
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && lightbox && !lightbox.hidden) closeLightbox();
  });

  // ------------------------------------------------------------ kalkulator FPS
  const fpsForm = document.getElementById("fpsForm");
  if (fpsForm) {
    const fpsCpu = document.getElementById("fpsCpu");
    const fpsGpu = document.getElementById("fpsGpu");
    const fpsRam = document.getElementById("fpsRam");
    const fpsRes = document.getElementById("fpsRes");
    const fpsVsync = document.getElementById("fpsVsync");
    const fpsValue = document.getElementById("fpsValue");
    const fpsBar = document.getElementById("fpsBar");
    const fpsLabel = document.getElementById("fpsLabel");
    const fpsDetail = document.getElementById("fpsDetail");
    const fpsLimit = document.getElementById("fpsLimit");
    const fpsBadge = document.getElementById("fpsBadge");
    const fpsResult = document.querySelector(".bench-result");
    const FPS_STORAGE = "pixel_patch_fps_v1";

    const num = (el) => Number(el && el.selectedOptions && el.selectedOptions[0] ? el.selectedOptions[0].dataset.score : 0) || 0;
    const penalty = () => Number(fpsRes && fpsRes.selectedOptions[0] ? fpsRes.selectedOptions[0].dataset.penalty : 0) || 0;
    const selectedText = (el) => el && el.selectedOptions[0] ? el.selectedOptions[0].textContent.trim() : "";

    function calculateFps(animate) {
      const cpu = num(fpsCpu);
      const gpu = num(fpsGpu);
      const ram = num(fpsRam);
      const raw = Math.max(12, Math.round(16 + cpu * 1.1 + gpu * 0.65 + ram * 0.8 - penalty()));
      const vsync = !fpsVsync || fpsVsync.checked;
      const shown = vsync ? Math.min(60, raw) : raw;

      let label = "Płynnie";
      let badge = "BARDZO PŁYNNIE";
      let cls = "good";
      if (raw < 30) {
        label = "Za mało mocy";
        badge = "NISKO";
        cls = "bad";
      } else if (raw < 45) {
        label = "Grywalnie, ale mogą być spadki";
        badge = "GRYWALNIE";
        cls = "warn";
      } else if (raw < 60) {
        label = "Blisko pełnej płynności";
        badge = "OK";
        cls = "warn";
      } else if (raw < 100) {
        label = "Płynnie";
        badge = "PŁYNNIE";
        cls = "good";
      } else {
        label = "Bardzo płynnie — duży zapas";
        badge = "BARDZO PŁYNNIE";
        cls = "good";
      }

      const cpuPart = cpu * 1.1;
      const gpuPart = gpu * 0.65;
      let bottleneck = "Zbalansowany";
      if (cpuPart < gpuPart * 0.55) bottleneck = "CPU";
      else if (gpuPart < cpuPart * 0.45) bottleneck = "GPU";

      if (fpsValue) fpsValue.textContent = String(shown);
      if (fpsLabel) fpsLabel.textContent = label;
      if (fpsBadge) {
        fpsBadge.textContent = badge;
        fpsBadge.className = "fps-badge " + cls;
      }
      if (fpsBar) {
        fpsBar.style.width = Math.max(5, Math.min(100, (shown / 120) * 100)) + "%";
        fpsBar.style.background = raw < 30 ? "var(--red)" : (raw < 60 ? "var(--amber)" : "var(--mint)");
      }
      if (fpsValue) fpsValue.style.color = raw < 30 ? "var(--red)" : (raw < 60 ? "var(--amber)" : "var(--mint)");
      if (fpsDetail) {
        fpsDetail.textContent = selectedText(fpsCpu) + " · " + selectedText(fpsGpu) + " · " +
          selectedText(fpsRam) + " RAM · " + selectedText(fpsRes) + " · wąskie gardło: " + bottleneck;
      }
      if (fpsLimit) {
        fpsLimit.textContent = raw < 60
          ? "VSync nie obniża wyniku — bez limitu ok. " + raw + " FPS."
          : (vsync ? "VSync: max 60 FPS · bez limitu ok. " + raw + " FPS." : "Bez limitu · VSync 60 FPS.");
      }
      if (animate && fpsResult) {
        fpsResult.classList.remove("pop");
        void fpsResult.offsetWidth;
        fpsResult.classList.add("pop");
      }
    }

    function saveFps() {
      try {
        localStorage.setItem(FPS_STORAGE, JSON.stringify({
          cpu: fpsCpu.value, gpu: fpsGpu.value, ram: fpsRam.value,
          res: fpsRes.value, vsync: !!(fpsVsync && fpsVsync.checked),
        }));
      } catch (_) { /* ignore */ }
    }

    function restoreFps() {
      try {
        const saved = JSON.parse(localStorage.getItem(FPS_STORAGE) || "{}");
        if (saved.cpu) fpsCpu.value = saved.cpu;
        if (saved.gpu) fpsGpu.value = saved.gpu;
        if (saved.ram) fpsRam.value = saved.ram;
        if (saved.res) fpsRes.value = saved.res;
        if (fpsVsync && typeof saved.vsync === "boolean") fpsVsync.checked = saved.vsync;
      } catch (_) { /* ignore */ }
    }

    [fpsCpu, fpsGpu, fpsRam, fpsRes].forEach(function (sel) {
      if (!sel) return;
      sel.addEventListener("change", function () { saveFps(); calculateFps(true); });
    });
    if (fpsVsync) fpsVsync.addEventListener("change", function () { saveFps(); calculateFps(true); });
    const fpsCalc = document.getElementById("fpsCalc");
    if (fpsCalc) fpsCalc.addEventListener("click", function () { saveFps(); calculateFps(true); });

    restoreFps();
    calculateFps(false);
  }

})();


/* Odslanianie wiekszych blokow + aktywna sekcja w nawigacji. */
(function () {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

  if (!("IntersectionObserver" in window)) return;

  const blocks = document.querySelectorAll(
    ".sec-head, .story, .game, .voxel-stage, .bench, .patch-hero, .release-latest, .mods, .gallery, .faq, .download"
  );

  if (!reduce.matches) {
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("in");
        io.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -10% 0px", threshold: 0.06 });

    blocks.forEach(function (el) {
      el.classList.add("reveal");
      io.observe(el);
    });
    window.setTimeout(function () {
      blocks.forEach(function (el) { el.classList.add("in"); });
    }, 2600);
  }

  const links = Array.prototype.slice.call(document.querySelectorAll(".nav a"));
  const sections = links
    .map(function (link) {
      const id = link.getAttribute("href");
      return id && id.length > 1 ? document.querySelector(id) : null;
    })
    .filter(Boolean);

  if (sections.length) {
    const navIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        const id = "#" + entry.target.id;
        links.forEach(function (link) {
          link.classList.toggle("active", link.getAttribute("href") === id);
        });
      });
    }, { rootMargin: "-42% 0px -50% 0px", threshold: 0 });
    sections.forEach(function (section) { navIo.observe(section); });
  }
})();

/* Galeria: strzalki, licznik, przeciaganie. */
(function () {
  const gallery = document.getElementById("gallery");
  if (!gallery) return;
  const shots = Array.prototype.slice.call(gallery.querySelectorAll(".shot"));
  const prev = document.getElementById("galleryPrev");
  const next = document.getElementById("galleryNext");
  const index = document.getElementById("galleryIndex");
  const pad = function (n) { return n < 10 ? "0" + n : String(n); };

  function step() {
    const first = shots[0];
    if (!first) return 440;
    const gap = parseFloat(getComputedStyle(gallery).columnGap || "14") || 14;
    return first.getBoundingClientRect().width + gap;
  }

  function sync() {
    const s = step();
    const current = Math.min(shots.length, Math.max(1, Math.round(gallery.scrollLeft / s) + 1));
    if (index) index.textContent = pad(current);
    if (prev) prev.disabled = gallery.scrollLeft < 8;
    if (next) next.disabled = gallery.scrollLeft > gallery.scrollWidth - gallery.clientWidth - 8;
  }

  function setIndexAt(left) {
    if (!index) return;
    const s = step();
    const current = Math.min(shots.length, Math.max(1, Math.round(left / s) + 1));
    index.textContent = pad(current);
  }

  function go(dir) {
    const s = step();
    const max = Math.max(0, gallery.scrollWidth - gallery.clientWidth);
    const target = Math.max(0, Math.min(max, gallery.scrollLeft + dir * s));
    setIndexAt(target);
    gallery.scrollTo({ left: target, behavior: "smooth" });
    if (prev) prev.disabled = target < 8;
    if (next) next.disabled = target > max - 8;
  }

  if (prev) prev.addEventListener("click", function () { go(-1); });
  if (next) next.addEventListener("click", function () { go(1); });
  gallery.addEventListener("scroll", function () {
    window.clearTimeout(sync._t);
    sync._t = window.setTimeout(sync, 80);
  }, { passive: true });
  gallery.addEventListener("scrollend", sync);

  let down = false, startX = 0, startLeft = 0, moved = false;
  gallery.addEventListener("pointerdown", function (e) {
    if (e.pointerType === "touch") return;
    down = true;
    moved = false;
    startX = e.clientX;
    startLeft = gallery.scrollLeft;
    gallery.classList.add("dragging");
  });
  window.addEventListener("pointermove", function (e) {
    if (!down) return;
    const dx = e.clientX - startX;
    if (Math.abs(dx) > 5) moved = true;
    gallery.scrollLeft = startLeft - dx;
  });
  window.addEventListener("pointerup", function () {
    if (!down) return;
    down = false;
    gallery.classList.remove("dragging");
    if (moved) {
      const guard = function (ev) { ev.stopPropagation(); };
      gallery.addEventListener("click", guard, { capture: true, once: true });
    }
  });

  sync();
  window.addEventListener("resize", sync);
})();

/* Delikatny tilt na kartach modow. */
(function () {
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  document.querySelectorAll(".mod").forEach(function (card) {
    card.addEventListener("pointermove", function (e) {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      card.style.setProperty("--ry", (px * 7).toFixed(2) + "deg");
      card.style.setProperty("--rx", (-py * 7).toFixed(2) + "deg");
      card.classList.add("tilting");
    });
    card.addEventListener("pointerleave", function () {
      card.classList.remove("tilting");
      card.style.removeProperty("--rx");
      card.style.removeProperty("--ry");
    });
  });
})();

