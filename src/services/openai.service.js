// src/services/openai.service.js
import OpenAI from "openai";

/**
 * 创建 OpenAI 客户端
 * - 明确指定 apiKey
 * - 明确指定 timeout，防止本地/首次调用超时
 */
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 60000, // 60 秒超时（非常关键）
});

/**
 * 根据命理结构生成一段真实命理文本
 * @param {Object} structure
 * @returns {Promise<string>}
 */
export async function generateReading(structure) {
  const prompt = `
You are a professional Eastern metaphysics consultant.

User information:
Name: ${structure.user.name}
Birth date: ${structure.user.birth.date}
Birth time: ${structure.user.birth.time}
Birth place: ${structure.user.birth.place}

Task:
Write ONE short paragraph (5–6 sentences).
Focus on personality tendencies only.
Tone: calm, insightful, reassuring.
`;

  const response = await client.responses.create({
    model: "gpt-4.1-mini",
    input: prompt,
    max_output_tokens: 200,
  });

  return response.output_text;
}

