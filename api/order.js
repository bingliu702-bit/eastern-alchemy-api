import { generateStructure } from "../src/services/structure.service.js";
import { generateContent } from "../src/services/openai.service.js";

/**
 * POST /api/order
 * Body:
 * {
 *   "name": "Ruby",
 *   "email": "test@easternalchemy.one",
 *   "birth_date": "1990-01-01",
 *   "birth_time": "08:00",
 *   "birth_place": "Guangzhou",
 *   "mode": "TEST" // or "REAL"
 * }
 */
export default async function handler(req, res) {
  // 只允许 POST
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      error: "Method Not Allowed",
    });
  }

  try {
    const {
      name,
      email,
      birth_date,
      birth_time,
      birth_place,
      mode = "TEST",
    } = req.body || {};

    // ===== 1️⃣ 基础校验 =====
    if (!name || !email || !birth_date || !birth_time || !birth_place) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
      });
    }

    // ===== 2️⃣ 生成订单 ID =====
    const orderId = `EA-${Date.now()}`;

    // ===== 3️⃣ 结构分析（五行 / 命盘骨架）=====
    const structure = await generateStructure({
      name,
      birth_date,
      birth_time,
      birth_place,
    });

    // ===== 4️⃣ 内容生成（OpenAI）=====
    const content = await generateContent({
      name,
      email,
      structure,
    });

    // ===== 5️⃣ 返回统一商业结构 =====
    return res.status(200).json({
      success: true,
      order_id: orderId,
      mode,
      status: "CONTENT_READY",
      data: {
        user: {
          name,
          email,
          birth_date,
          birth_time,
          birth_place,
        },
        five_element_structure: structure,
        core_analysis: content.core_analysis,
        guidance: content.guidance,
        summary: content.summary,
      },
      next_step:
        mode === "TEST"
          ? "READY_FOR_PDF"
          : "WAITING_FOR_PAYMENT",
    });
  } catch (error) {
    console.error("ORDER API ERROR:", error);

    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: error.message,
    });
  }
}
