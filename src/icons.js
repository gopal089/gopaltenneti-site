// Brand marks come straight from the Simple Icons library (official brand paths),
// bundled at build time so the site makes no third-party requests.
import {
  siAnthropic,
  siApachekafka,
  siBluetooth,
  siDeno,
  siDocker,
  siGithub,
  siGoldmansachs,
  siGoogle,
  siGooglecalendar,
  siGooglecloud,
  siGooglegemini,
  siHackerrank,
  siHuggingface,
  siKubernetes,
  siOpenjdk,
  siPostgresql,
  siPython,
  siRazorpay,
  siReact,
  siRedis,
  siRender,
  siResend,
  siSpring,
  siSpringboot,
  siSpringsecurity,
  siSupabase,
  siSwift,
} from "simple-icons";

// Only the icons used are imported, so the bundle stays small.
const si = { siAnthropic, siApachekafka, siBluetooth, siDeno, siDocker, siGithub, siGoldmansachs, siGoogle, siGooglecalendar, siGooglecloud, siGooglegemini, siHackerrank, siHuggingface, siKubernetes, siOpenjdk, siPostgresql, siPython, siRazorpay, siReact, siRedis, siRender, siResend, siSpring, siSpringboot, siSpringsecurity, siSupabase, siSwift };

export function iconSvg(name, { size = 18, color = "#16211D" } = {}) {
  const icon = si[name];
  if (!icon) return "";
  const fill = color === "brand" ? `#${icon.hex}` : color;
  return `<svg role="img" aria-label="${icon.title}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="${fill}"><path d="${icon.path}"/></svg>`;
}

// Fill every <span class="logo-slot" data-logo="siReact"> on the page.
export function fillLogoSlots(root = document) {
  root.querySelectorAll(".logo-slot[data-logo]").forEach((el) => {
    el.innerHTML = iconSvg(el.dataset.logo, {
      size: Number(el.dataset.size || 18),
      color: el.dataset.color || "#16211D",
    });
  });
}

// Toolbox groups. A missing icon key just shows the name.
export const toolbox = [
  ["Languages", [["Java", "siOpenjdk"], ["Python", "siPython"], ["SQL", null], ["Swift", "siSwift"]]],
  ["Distributed systems", [["Redis", "siRedis"], ["Apache Kafka", "siApachekafka"], ["Microservices", null]]],
  ["Frameworks", [["Spring Boot", "siSpringboot"], ["Spring Security", "siSpringsecurity"], ["Spring Data JPA", "siSpring"], ["React", "siReact"], ["SwiftUI", "siSwift"], ["REST API design", null]]],
  ["AI and LLMs", [["Gemini API", "siGooglegemini"], ["Hugging Face", "siHuggingface"], ["Pinecone", null], ["LLM-as-a-Judge", null], ["RAG pipelines", null]]],
  ["Databases", [["PostgreSQL (Row-Level Security)", "siPostgresql"], ["Supabase", "siSupabase"], ["Redis", "siRedis"], ["Neon", null]]],
  ["Cloud and DevOps", [["Google Cloud Run", "siGooglecloud"], ["AWS (EC2, S3, RDS)", null], ["Docker", "siDocker"], ["Kubernetes", "siKubernetes"], ["CI/CD", null], ["Render", "siRender"]]],
  ["Core CS", [["Data structures and algorithms", null], ["OOP", null], ["System design", null], ["Debugging", null], ["Testing", null]]],
];


export function renderToolbox(target) {
  target.innerHTML = toolbox
    .map(
      ([group, items]) => `
      <div class="tool-row">
        <dt>${group}</dt>
        <dd>${items
          .map(([label, key]) => {
            const brand = key && si[key] ? `#${si[key].hex}` : "";
            return `<span class="tool" style="${brand ? `--tool-brand:${brand}` : ""}">${key ? iconSvg(key, { size: 17, color: "#16211D" }).replace('fill="#16211D"', "") : ""}${label}</span>`;
          })
          .join("")}</dd>
      </div>`,
    )
    .join("");
}
