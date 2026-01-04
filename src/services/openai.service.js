import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function buildPrompt(order, structure) {
  return `
You are a professional Eastern Five-Element (Wu Xing) metaphysics consultant for an international audience.

Client Order:
- Full name: ${order.full_name}
- Birth date: ${order.birth_date}
- Birth time: ${order.birth_time || "unknown"}
- Birth place: ${order.birth_place || "unknown"}

Five-Element Structure (computed):
${JSON.stringify(structure, null, 2)}

Write a personalized destiny reading in premium, calm, reassuring English.

Requirements:
- 350–550 words
- No bullet points, no emojis
- Must include: (1) core energy signature, (2) strengths & blind spots, (3) relationship/career tendency, (4) 3 practical balancing actions for the next 14 days (written as sentences, not bullets)
- Avoid claiming certainty. Use wise, grounded language.
`;
}

export async function generateMetaphysicsContent(order, structure) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("Missing OPENAI_API_KEY in .env");
  }

  const resp = await client.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.7,
    messages: [
      { role: "system", content: "You are an expert in Eastern Five-Element metaphysics." },
      { role: "user", content: buildPrompt(order, structure) },
    ],
  });

  return resp.choices?.[0]?.message?.content?.trim() || "";
}

