import "./style.css";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { fillLogoSlots, renderToolbox } from "./icons.js";
import { renderCertList } from "./certs.js";

gsap.registerPlugin(ScrollTrigger, SplitText);

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Content first: logos and toolbox rows are plain HTML, so they show even if
// animation or WebGL is unavailable.
renderToolbox(document.getElementById("toolbox-list"));
fillLogoSlots();
document.getElementById("year").textContent = String(new Date().getFullYear());

// Smooth scrolling with Lenis, driven by GSAP's ticker so ScrollTrigger and
// the 3D field stay in sync with the scroll position.
let lenis = null;
if (!reducedMotion) {
  lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

renderCertList(document.getElementById("cert-list"));

// In-page links glide to their section (Lenis) or jump (reduced motion).
document.querySelectorAll("a[data-scroll]").forEach((a) => {
  a.addEventListener("click", (e) => {
    const id = a.getAttribute("href");
    const target = id === "#top" ? 0 : document.querySelector(id);
    if (target === null) return;
    e.preventDefault();
    if (lenis) lenis.scrollTo(target, { offset: id === "#top" ? 0 : -72, duration: 1.3 });
    else if (target === 0) window.scrollTo(0, 0);
    else target.scrollIntoView();
    history.replaceState(null, "", id === "#top" ? location.pathname : id);
  });
});

// Header becomes solid after the hero starts to scroll away.
const header = document.querySelector(".site-header");
ScrollTrigger.create({
  start: 40,
  onToggle: (self) => header.classList.toggle("is-solid", self.isActive),
});

// The 3D field loads after the text so the page is readable immediately.
import("./field.js").then(({ createField }) => {
  const field = createField(document.getElementById("field"), { reducedMotion });
  if (!field) return;
  if (reducedMotion) {
    field.renderOnce();
    return;
  }
  gsap.ticker.add((time) => field.tick(time));
  // Fly over the field while the hero scrolls away, then let it settle and dim.
  ScrollTrigger.create({
    trigger: ".hero",
    start: "top top",
    end: "bottom top",
    scrub: true,
    onUpdate: (self) => {
      field.state.scroll = self.progress;
    },
  });
  gsap.to(field.state, {
    fade: 0.28,
    ease: "none",
    scrollTrigger: { trigger: "#work", start: "top 80%", end: "top 10%", scrub: true },
  });
  gsap.fromTo("#field", { opacity: 0 }, { opacity: 1, duration: 1.6, ease: "power2.out" });
});

// One orchestrated entrance: the name assembles, then the supporting lines.
if (!reducedMotion) {
  document.fonts.ready.then(() => {
    const split = new SplitText(".hero-name span", { type: "chars", charsClass: "char" });
    const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
    tl.from(split.chars, { yPercent: 110, rotate: 6, opacity: 0, duration: 1.2, stagger: 0.035 })
      .from(".hero-intro", { y: 16, opacity: 0, duration: 0.9 }, 0.35)
      .from(".hero-foot > *", { y: 20, opacity: 0, duration: 0.9, stagger: 0.12 }, 0.55);

    // The name widens slightly as it leaves, an echo of the camera rising.
    gsap.to(".hero-name", {
      fontVariationSettings: '"wdth" 75',
      yPercent: -12,
      ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
    });
  });
}
