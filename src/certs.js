import { iconSvg } from "./icons.js";

// Certificates, most relevant to software roles first. Logos come from Simple
// Icons where the issuer is in that library; otherwise the issuer name is shown.
export const certificates = [
  { file: "oracle-academy-java-programming", name: "Java Programming", issuer: "Oracle Academy", date: "Oct 2026" },
  { file: "hackerrank-software-engineer-intern", name: "Software Engineer Intern role certification", issuer: "HackerRank", logo: "siHackerrank", date: "Sep 2026" },
  { file: "hackerrank-sql-intermediate", name: "SQL (Intermediate)", issuer: "HackerRank", logo: "siHackerrank", date: "Sep 2026" },
  { file: "goldman-sachs-risk-job-simulation", name: "Risk job simulation", issuer: "Goldman Sachs, via Forage", logo: "siGoldmansachs", date: "Mar 2026" },
  { file: "aws-foundations-of-prompt-engineering", name: "Foundations of Prompt Engineering", issuer: "AWS Training & Certification", date: "Jun 2026" },
  { file: "anthropic-claude-101", name: "Claude 101", issuer: "Anthropic", logo: "siAnthropic" },
  { file: "iit-madras-risc-v-hands-on-training", name: "RISC-V hands-on training workshop", issuer: "IIT Madras, Centre for Outreach and Digital Education", date: "Mar 2026" },
];

function issuerMark(c) {
  if (c.logo) return `<span class="issuer-logo">${iconSvg(c.logo, { size: 16, color: "brand" })}</span>`;
  const short = c.issuer.startsWith("AWS") ? "AWS" : c.issuer.startsWith("IIT") ? "IITM" : c.issuer.split(" ")[0];
  return `<span class="issuer-text">${short}</span>`;
}

export function renderCertificates(list, dialog, onOpen, onClose) {
  list.innerHTML = certificates
    .map(
      (c, i) => `
      <li>
        <button type="button" class="cert" data-i="${i}" aria-label="View certificate: ${c.name}, ${c.issuer}">
          <span class="cert-shot"><img src="/certs/${c.file}-sm.webp" alt="" loading="lazy" decoding="async" width="720" height="556"></span>
          <span class="cert-issuer">${issuerMark(c)}<span>${c.issuer}</span></span>
          <span class="cert-title">${c.name}</span>
          ${c.date ? `<span class="cert-date">${c.date}</span>` : ""}
        </button>
      </li>`,
    )
    .join("");

  const img = dialog.querySelector("#cert-viewer-img");
  const title = dialog.querySelector("#cert-viewer-title");
  list.addEventListener("click", (e) => {
    const btn = e.target.closest(".cert");
    if (!btn) return;
    const c = certificates[Number(btn.dataset.i)];
    img.src = `/certs/${c.file}.webp`;
    img.alt = `${c.name} certificate from ${c.issuer}, awarded to Gopal Tenneti`;
    title.textContent = `${c.name}, ${c.issuer}`;
    dialog.showModal();
    onOpen?.();
  });
  dialog.addEventListener("click", (e) => {
    if (e.target === dialog || e.target.closest("[data-close]")) dialog.close();
  });
  dialog.addEventListener("close", () => onClose?.());
}
