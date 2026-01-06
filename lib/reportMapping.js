// lib/reportMapping.js

export function mapReportToPages(report) {
  const pages = [];

  // Page 1: Cover
  pages.push({
    key: "cover",
    data: report.meta,
  });

  // Page 2: Welcome
  pages.push({
    key: "welcome",
    data: {
      core_theme: report.overview.core_theme,
    },
  });

  // Page 3: Overview
  pages.push({
    key: "overview",
    data: report.overview,
  });

  // Page 4: Snapshot
  pages.push({
    key: "snapshot",
    data: {
      dominant: report.meta.dominant_element,
      strengths: report.strengths_and_challenges.strengths,
    },
  });

  // Page 5–9: Five Elements
  pages.push({ key: "wood", data: { text: report.five_element_analysis.wood } });
  pages.push({ key: "fire", data: { text: report.five_element_analysis.fire } });
  pages.push({ key: "earth", data: { text: report.five_element_analysis.earth } });
  pages.push({ key: "metal", data: { text: report.five_element_analysis.metal } });
  pages.push({ key: "water", data: { text: report.five_element_analysis.water } });

  // Page 10–11: Strengths & Challenges
  pages.push({ key: "strengths", data: { text: report.strengths_and_challenges.strengths } });
  pages.push({ key: "challenges", data: { text: report.strengths_and_challenges.challenges } });

  // Page 12–14: Life Guidance
  pages.push({ key: "career", data: { text: report.life_guidance.career } });
  pages.push({ key: "relationships", data: { text: report.life_guidance.relationships } });
  pages.push({ key: "health", data: { text: report.life_guidance.health_energy } });

  // Page 15: Rituals (组合页)
  pages.push({
    key: "rituals",
    data: {
      dominant: report.meta.dominant_element,
      career: report.life_guidance.career,
      relationships: report.life_guidance.relationships,
      health: report.life_guidance.health_energy,
    },
  });

  // Page 16: Protective Card
  pages.push({
    key: "card",
    data: {
      dominant: report.meta.dominant_element,
    },
  });

  // Page 17–18: Closing
  pages.push({ key: "next_steps", data: report.closing_message });
  pages.push({ key: "closing", data: report.closing_message });

  return pages;
}
