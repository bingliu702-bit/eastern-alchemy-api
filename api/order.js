export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method Not Allowed" });
  }

  try {
    const {
      name,
      email,
      birth_date,
      birth_time,
      birth_place,
      mode = "PROD",
    } = req.body || {};

    if (!name || !birth_date) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
      });
    }

    // ===== TEST MODE（100% 稳定，不触发 OpenAI）=====
    if (mode === "TEST") {
      return res.status(200).json({
        success: true,
        next_step: "CONTENT_READY",
        content: `TEST MODE: ${name}, your Five-Element energy shows a Water-dominant signature.`,
      });
    }

    // ===== PROD MODE =====
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        success: false,
        error: "OPENAI_API_KEY not set",
      });
    }

    // ⚠️ 关键：在函数内部再 import & 初始化
    const { default: OpenAI } = await import("openai");

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const prompt = `
User: ${name}
Birth: ${birth_date} ${birth_time || ""}
Place: ${birth_place || ""}

Give a short Five-Element (Wu Xing) insight in English.
`;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a professional Eastern metaphysics advisor." },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
    });

    const content =
      completion?.choices?.[0]?.message?.content ||
      "Content generation failed.";

    return res.status(200).json({
      success: true,
      next_step: "CONTENT_READY",
      content,
    });
  } catch (err) {
    console.error("ORDER API ERROR:", err);

    return res.status(500).json({
      success: false,
      error: "Order generation failed",
      message: err?.message || "Unknown error",
    });
  }
}
