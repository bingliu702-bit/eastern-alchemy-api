import fs from "fs";
import path from "path";
import Mustache from "mustache";

export function renderReportHtml(reportJson) {
  const templatePath = path.join(
    process.cwd(),
    "templates",
    "report.html"
  );

  const template = fs.readFileSync(templatePath, "utf8");

  return Mustache.render(template, reportJson);
}
