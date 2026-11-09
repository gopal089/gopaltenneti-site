import "./style.css";
import Lenis from "lenis";
import Snap from "lenis/snap";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { certificates, issuerMark } from "./certs.js";

gsap.registerPlugin(ScrollTrigger);
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const total = certificates.length;

// 1. Content: an index at the top, then one full-screen section per certificate.
document.getElementById("cert-index").innerHTML = certificates
  .map(
    (c, i) => `<li><a href="#${c.slug}" data-jump="${i}">${issuerMark(c, 15)}<span>${c.name}</span><small>${c.issuer.split(",")[0]}</small></a></li>`,
  )
  .join("");

document.getElementById("cert-slides").innerHTML = certificates
  .map(
    (c, i) => `
    <section class="cert-slide" id="${c.slug}" aria-labelledby="cert-title-${i}" ${i === 0 ? 'data-first' : ""}>
      <span id="cert-${i + 1}" class="sr-anchor"></span>
      <div class="cert-slide-inner">
        <figure class="cert-frame">
          <img src="/certs/${c.file}.webp" alt="${c.name} certificate from ${c.issuer}, awarded to Gopal Tenneti" ${i > 1 ? 'loading="lazy"' : ""} decoding="async">
        </figure>
        <div class="cert-info">
          <p class="cert-step">Certificate ${i + 1} of ${total}</p>
          <p class="cert-issuer-line">${issuerMark(c, 20)}<span>${c.issuer}</span></p>
          <h2 id="cert-title-${i}" class="cert-name font-display">${c.name}</h2>
          ${c.date ? `<p class="cert-when">Awarded ${c.date}</p>` : ""}
          <p class="cert-about">${c.about}</p>
          <a class="btn btn-line mt-8" href="/certs/${c.file}.webp" target="_blank" rel="noopener">Open full size</a>
        </div>
      </div>
    </section>`,
  )
  .join("");
document.getElementById("pager-total").textContent = String(total);
document.getElementById("year").textContent = String(new Date().getFullYear());

const slides = [...document.querySelectorAll(".cert-slide")];

// 2. Smooth scrolling, with gentle snapping to each certificate on larger screens
//    (on phones a certificate can be taller than the screen, so no snapping there).
let lenis = null;
if (!reducedMotion) {
  lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
  if (window.matchMedia("(min-width: 1024px) and (min-height: 680px)").matches) {
    const snap = new Snap(lenis, { type: "proximity", duration: 0.9, debounce: 220 });
    slides.forEach((s) => snap.addElement(s, { align: ["start"] }));
  }
}

function goTo(index) {
  const i = Math.max(0, Math.min(total - 1, index));
  const target = slides[i];
  if (lenis) lenis.scrollTo(target, { duration: 1.1 });
  else target.scrollIntoView();
  history.replaceState(null, "", `#${certificates[i].slug}`);
}

// 3. Which certificate is on screen drives the pager and the address bar.
const pager = document.querySelector(".cert-pager");
const now = document.getElementById("pager-now");
let current = -1;
slides.forEach((slide, i) => {
  ScrollTrigger.create({
    trigger: slide,
    start: "top 55%",
    end: "bottom 55%",
    onToggle: (self) => {
      if (!self.isActive) return;
      current = i;
      now.textContent = String(i + 1);
    },
  });
});
ScrollTrigger.create({
  trigger: "#cert-slides",
  start: "top 70%",
  end: "bottom 30%",
  onToggle: (self) => {
    pager.hidden = !self.isActive;
    if (!self.isActive && self.direction < 0) current = -1;
  },
});

pager.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-dir]");
  if (btn) goTo(current + Number(btn.dataset.dir));
});
document.getElementById("cert-index").addEventListener("click", (e) => {
  const a = e.target.closest("[data-jump]");
  if (!a) return;
  e.preventDefault();
  goTo(Number(a.dataset.jump));
});
window.addEventListener("keydown", (e) => {
  if (e.target.closest("input, textarea, select") || e.metaKey || e.ctrlKey || e.altKey) return;
  if (e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === "PageDown") {
    e.preventDefault();
    goTo(current + 1);
  } else if (e.key === "ArrowLeft" || e.key === "ArrowUp" || e.key === "PageUp") {
    if (current <= 0) return;
    e.preventDefault();
    goTo(current - 1);
  }
});

// 4. Arriving with a link like /certificates/#hackerrank-sql-intermediate opens that one.
//    Image boxes have a fixed shape, so the position is known before images load.
const fromHash = certificates.findIndex((c) => `#${c.slug}` === location.hash);
if (fromHash >= 0) {
  history.scrollRestoration = "manual";
  const jump = () => {
    ScrollTrigger.refresh();
    if (lenis) lenis.scrollTo(slides[fromHash], { immediate: true, force: true });
    else slides[fromHash].scrollIntoView();
  };
  requestAnimationFrame(jump);
  window.addEventListener("load", jump, { once: true });
}

// 5. One motion idea: each certificate settles into place as it arrives.
if (!reducedMotion) {
  slides.forEach((slide) => {
    gsap.fromTo(
      slide.querySelector(".cert-frame"),
      { scale: 0.9, rotate: -1.5, opacity: 0.35 },
      {
        scale: 1,
        rotate: 0,
        opacity: 1,
        ease: "none",
        scrollTrigger: { trigger: slide, start: "top 95%", end: "top 25%", scrub: true },
      },
    );
  });
}
