import fs from "fs";
import path from "path";
import Mustache from "mustache";
import { mapReportToPages } from "../lib/reportMapping.js";

export default async function handler(req, res) {
  try {
    // 1️⃣ mock report（后面会换成 OpenAI）
    const report = {
      meta: {
        brand: "Eastern Alchemy",
        client_name: "Test User",
      },
      overview: {
        core_theme: "Balance & Transformation",
        summary: "This is a test overview summary.",
      },
    };

    // 2️⃣ 映射成页面数据
    const pages = mapReportToPages(report);

    // 3️⃣ 读取模板（⚠️ 关键修复：绝对路径）
    const templatePath = path.join(
      process.cwd(),
      "templates",
      "report.html"
    );

    const template = fs.readFileSync(templatePath, "utf-8");

    // 4️⃣ 渲染 HTML
    const html = Mustache.render(template, { pages });

    // 5️⃣ 返回 HTML
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    return res.status(200).send(html);
  } catch (err) {
    console.error("RENDER HTML ERROR:", err);

    return res.status(500).json({
      ok: false,
      error: err.message,
      stack: err.stack,
    });
  }
}
