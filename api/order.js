import { generateStructure } from "../src/services/structure.service.js";
import { generateMetaphysicsContent } from "../src/services/openai.service.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  try {
    const order = req.body || {};
    const structure = generateStructure(order);
    const content = await generateMetaphysicsContent(order, structure);

    return res.status(200).json({
      success: true,
      next_step: "CONTENT_READY",
      content,
    });
  } catch (err) {
    console.error("VERCEL /api/order ERROR:", err);
    return res.status(500).json({
      success: false,
      error: err?.message || "Connection error",
    });
  }
}
