import OpenAI from "openai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { name, birth_date, mode = "PAID" } = req.body;

    if (!name || !birth_date) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // TEST 模式：永远不调 OpenAI
    if (mode === "TEST") {
      return res.status(200).json({
        success: true,
        content: `TEST MODE: ${name}, your Five-Element energy shows a Water-dominant signature.`
      });
    }

    // PAID 模式：真实 AI
    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    const prompt = `
You are an Eastern metaphysics expert.
Generate a refined Five-Element (Wu Xing) analysis.

User name: ${name}
Birth date: ${birth_date}

Tone: elegant, calm, premium.
Length: 3–5 sentences.
`;

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7
    });

    return res.status(200).json({
      success: true,
      content: response.choices[0].message.content
    });

  } catch (err) {
    console.error("GENERATE ERROR:", err);
    return res.status(500).json({
      error: "Generation failed",
      message: err.message
    });
  }
}

