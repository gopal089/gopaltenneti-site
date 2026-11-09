import { iconSvg } from "./icons.js";

// Certificates, most relevant to software roles first. Each one gets its own
// full-screen page section at /certificates/#slug. Logos come from Simple Icons
// where the issuer is in that library; otherwise a short issuer name is shown.
export const certificates = [
  {
    slug: "oracle-java-programming",
    file: "oracle-academy-java-programming",
    name: "Java Programming",
    issuer: "Oracle Academy",
    short: "Oracle",
    date: "20 October 2026",
    about: "Completed all coursework in Oracle Academy's Java Programming course.",
  },
  {
    slug: "hackerrank-software-engineer-intern",
    file: "hackerrank-software-engineer-intern",
    name: "Software Engineer Intern",
    issuer: "HackerRank",
    logo: "siHackerrank",
    date: "1 September 2026",
    about: "Passed HackerRank's Software Engineer Intern role certification test.",
  },
  {
    slug: "hackerrank-sql-intermediate",
    file: "hackerrank-sql-intermediate",
    name: "SQL (Intermediate)",
    issuer: "HackerRank",
    logo: "siHackerrank",
    date: "10 September 2026",
    about: "Passed HackerRank's SQL (Intermediate) skill certification test.",
  },
  {
    slug: "goldman-sachs-risk",
    file: "goldman-sachs-risk-job-simulation",
    name: "Risk Job Simulation",
    issuer: "Goldman Sachs, via Forage",
    logo: "siGoldmansachs",
    date: "25 March 2026",
    about: "Completed practical tasks in Goldman Sachs' risk job simulation: an introduction to risk, and evaluating client profiles and real estate investments.",
  },
  {
    slug: "aws-prompt-engineering",
    file: "aws-foundations-of-prompt-engineering",
    name: "Foundations of Prompt Engineering",
    issuer: "AWS Training & Certification",
    short: "AWS",
    date: "24 June 2026",
    about: "Completed AWS Training & Certification's Foundations of Prompt Engineering course.",
  },
  {
    slug: "anthropic-claude-101",
    file: "anthropic-claude-101",
    name: "Claude 101",
    issuer: "Anthropic",
    logo: "siAnthropic",
    about: "Completed Anthropic's Claude 101 course.",
  },
  {
    slug: "iit-madras-risc-v",
    file: "iit-madras-risc-v-hands-on-training",
    name: "RISC-V Hands-on Training",
    issuer: "IIT Madras, Centre for Outreach and Digital Education",
    short: "IITM",
    date: "21–22 March 2026",
    about: "Took part in a two-day RISC-V hands-on training workshop run by IIT Madras's Centre for Outreach and Digital Education, organised by the Department of Computer Science and Engineering at SCSVMV.",
  },
];

export function issuerMark(c, size = 16) {
  if (c.logo) return `<span class="issuer-logo">${iconSvg(c.logo, { size, color: "brand" })}</span>`;
  return `<span class="issuer-text">${c.short}</span>`;
}

// Homepage: a compact list; each row opens that certificate's own page section.
export function renderCertList(list) {
  list.innerHTML = certificates
    .map(
      (c) => `
      <li>
        <a class="cert-row" href="/certificates/#${c.slug}">
          ${issuerMark(c)}
          <span class="cert-row-text">
            <span class="cert-row-name">${c.name}</span>
            <span class="cert-row-meta">${c.issuer}${c.date ? `, ${c.date.replace(/^\d+(–\d+)? /, "")}` : ""}</span>
          </span>
        </a>
      </li>`,
    )
    .join("");
}
