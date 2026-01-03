import { generateStructure } from "../src/services/structure.service.js";
import { generateReading } from "../src/services/openai.service.js";

export default async function handler(req, res) {
  // 允许 POST / GET
  if (req.method === "GET") {
    if (req.url === "/api/health" || req.url === "/health") {
      return res.status(200).json({ status: "ok" });
    }
    return res.status(404).json({ error: "Not found" });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const {
      full_name,
      birth_date,
      birth_time,
      birth_place,
      email,
    } = req.body || {};

    if (!full_name || !birth_date || !birth_place || !email) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const structure = generateStructure({
      full_name,
      birth_date,
      birth_time,
      birth_place,
      email,
    });

    const reading = await generateReading(structure);

    return res.status(200).json({
      success: true,
      reading,
    });
  } catch (err) {
    console.error("API ERROR:", err);
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
}
