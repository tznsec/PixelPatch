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
  const BUILD_DATE = new Date(2026, 9, 27, 0, 0, 0); // build Snapshot 1

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

  function openLightbox(src, alt) {
    if (!lightbox || !lightboxImg) return;
    lightboxImg.src = src;
    lightboxImg.alt = alt || "";
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
      openLightbox(shot.dataset.src, img ? img.alt : "");
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
})();
