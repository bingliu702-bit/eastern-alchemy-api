import { generateStructure } from "../src/services/structure.service.js";
import { generateReading } from "../src/services/openai.service.js";

export default async function handler(req, res) {
  // 只允许 POST
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

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

  try {
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
    console.error("❌ Generation error:", err);
    return res.status(500).json({
      success: false,
      error: err.message || String(err),
    });
  }
}
