import { renderReportHtml } from "../lib/renderReportHtml.js";

export default async function handler(req, res) {
  const mockReport = {
    meta: {
      name: "Test User",
      birth_date: "1990-01-01",
      birth_time: "08:00",
      birth_place: "Guangzhou",
      dominant_element: "WOOD",
    },
    overview: {
      core_theme: "Growth, renewal, and steady expansion define your current life phase.",
      summary: "You are entering a period where clarity and patience bring long-term rewards.",
    },
  };

  const html = renderReportHtml(mockReport);

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.status(200).send(html);
}
