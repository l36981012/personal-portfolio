const canvas = document.querySelector("#grain");
const ctx = canvas.getContext("2d");
const countNode = document.querySelector("[data-count]");
const curtain = document.querySelector(".transition-curtain");
const screens = document.querySelectorAll(".screen");
const projects = document.querySelectorAll(".project-slide");
const transitionLinks = document.querySelectorAll("[data-transition]");
const aboutScreen = document.querySelector(".about-screen");
const cursor = document.querySelector(".cursor-dot");
const heroScreen = document.querySelector(".hero-screen");
const heroTitle = document.querySelector("[data-hero-title]");
const manifesto = document.querySelector("[data-manifesto]");
const gallery = document.querySelector(".projects-gallery");
const galleryTrack = document.querySelector("[data-project-track]");
const galleryCounter = document.querySelector("[data-project-counter]");
const gallerySlides = document.querySelectorAll(".project-slide");
const canAnimate = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

document.body.classList.add("is-loading");
document.documentElement.style.setProperty("--load-progress", "0%");

function resizeCanvas() {
  const scale = window.devicePixelRatio || 1;
  canvas.width = Math.floor(window.innerWidth * scale);
  canvas.height = Math.floor(window.innerHeight * scale);
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
  drawGrain();
}

function drawGrain() {
  const imageData = ctx.createImageData(canvas.width, canvas.height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const shade = Math.random() * 255;
    data[i] = shade;
    data[i + 1] = shade;
    data[i + 2] = shade;
    data[i + 3] = 34;
  }

  ctx.putImageData(imageData, 0, 0);
}

function runCounter() {
  const duration = 980;
  const start = performance.now();

  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    countNode.textContent = String(Math.round(eased * 100));
    document.documentElement.style.setProperty("--load-progress", `${eased * 100}%`);

    if (progress < 1) {
      requestAnimationFrame(tick);
      return;
    }

    setTimeout(() => {
      passCurtain(() => {
        document.body.classList.remove("is-loading");
        document.body.classList.add("is-loaded");
      });
    }, 280);
  }

  requestAnimationFrame(tick);
}

function passCurtain(onCovered) {
  curtain.classList.remove("is-active");
  void curtain.offsetWidth;
  curtain.classList.add("is-active");

  if (typeof onCovered === "function") {
    window.setTimeout(onCovered, 410);
  }
}

function setupScrollReveal() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
        }
      });
    },
    {
      threshold: 0.38,
      rootMargin: "0px 0px -8% 0px",
    },
  );

  screens.forEach((screen) => observer.observe(screen));
}

function setupProjectHover() {
  projects.forEach((project) => {
    project.addEventListener("mouseenter", () => {
      projects.forEach((item) => item.classList.remove("is-open"));
      project.classList.add("is-open");
    });

    project.addEventListener("focusin", () => {
      projects.forEach((item) => item.classList.remove("is-open"));
      project.classList.add("is-open");
    });
  });
}

function setupCursor() {
  if (!cursor || matchMedia("(pointer: coarse)").matches || !canAnimate) return;

  window.addEventListener("pointermove", (event) => {
    cursor.classList.add("is-visible");
    cursor.style.left = `${event.clientX}px`;
    cursor.style.top = `${event.clientY}px`;
  });

  document.querySelectorAll("a, button, [data-transition]").forEach((node) => {
    node.addEventListener("pointerenter", () => cursor.classList.add("is-hover"));
    node.addEventListener("pointerleave", () => cursor.classList.remove("is-hover"));
  });

  window.addEventListener("pointerdown", () => cursor.classList.add("is-down"));
  window.addEventListener("pointerup", () => cursor.classList.remove("is-down"));
  window.addEventListener("pointerleave", () => cursor.classList.remove("is-visible"));
}

function setupTransitions() {
  transitionLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const targetId = link.getAttribute("href");
      const target = targetId ? document.querySelector(targetId) : null;
      if (!target) return;

      event.preventDefault();
      passCurtain(() => {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  });
}

function updateHeroMotion() {
  if (!heroScreen || !heroTitle || !canAnimate) return;

  const rect = heroScreen.getBoundingClientRect();
  const viewport = window.innerHeight || document.documentElement.clientHeight;
  const progress = Math.max(0, Math.min(-rect.top / viewport, 1));
  heroTitle.style.transform = `translate3d(0, ${progress * -90}px, 0) scale(${1 - progress * 0.04})`;
  heroTitle.style.opacity = String(1 - progress * 0.55);
}

function updateManifestoMotion() {
  if (!manifesto || !canAnimate) return;

  const rect = manifesto.getBoundingClientRect();
  const viewport = window.innerHeight || document.documentElement.clientHeight;
  const progress = Math.max(-1, Math.min((viewport - rect.top) / (viewport + rect.height), 1));
  manifesto.style.transform = `translate3d(0, ${progress * -28}px, 0)`;
}

function updateProjectGallery() {
  if (!gallery || !galleryTrack || gallerySlides.length === 0) return;

  if (window.matchMedia("(max-width: 860px)").matches || !canAnimate) {
    gallerySlides.forEach((slide) => slide.classList.add("is-active"));
    galleryTrack.style.setProperty("--gallery-x", "0px");
    return;
  }

  const rect = gallery.getBoundingClientRect();
  const maxScroll = Math.max(gallery.offsetHeight - window.innerHeight, 1);
  const raw = Math.max(0, Math.min(-rect.top / maxScroll, 1));
  const maxX = galleryTrack.scrollWidth - window.innerWidth;
  galleryTrack.style.setProperty("--gallery-x", `${-raw * maxX}px`);
  galleryTrack.style.setProperty("--poster-scale", `${1.06 - raw * 0.04}`);

  const activeIndex = Math.min(gallerySlides.length - 1, Math.round(raw * (gallerySlides.length - 1)));
  gallerySlides.forEach((slide, index) => {
    slide.classList.toggle("is-active", index === activeIndex);
  });

  if (galleryCounter) {
    galleryCounter.textContent = `${String(activeIndex + 1).padStart(2, "0")} / ${String(gallerySlides.length).padStart(2, "0")}`;
  }
}

function updateAboutLine() {
  if (!aboutScreen) return;

  const rect = aboutScreen.getBoundingClientRect();
  const viewport = window.innerHeight || document.documentElement.clientHeight;
  const raw = (viewport - rect.top) / (viewport + rect.height * 0.35);
  const progress = Math.max(0, Math.min(raw, 1));
  aboutScreen.style.setProperty("--about-line-progress", progress.toFixed(3));
}

function updateScrollEffects() {
  updateHeroMotion();
  updateManifestoMotion();
  updateProjectGallery();
  updateAboutLine();
}

resizeCanvas();
window.addEventListener("resize", resizeCanvas);
window.addEventListener("resize", updateScrollEffects);
window.addEventListener("scroll", updateScrollEffects, { passive: true });
window.setInterval(drawGrain, 180);

setupScrollReveal();
setupProjectHover();
setupCursor();
setupTransitions();
updateScrollEffects();
runCounter();
