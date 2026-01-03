import "dotenv/config"; 

import express from "express";
import { generateStructure } from "./services/structure.service.js";
import { generateReading } from "./services/openai.service.js";

const app = express();

// 允许 JSON
app.use(express.json());

// 健康检查
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

/**
 * 接收订单（WordPress / 前端 POST 过来）
 * 并生成一段真实命理文本
 */
app.post("/api/order", async (req, res) => {
  const {
    full_name,
    birth_date,
    birth_time,
    birth_place,
    email,
  } = req.body;

  // 最基础校验
  if (!full_name || !birth_date || !birth_place || !email) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields",
    });
  }

  console.log("📥 New Order Received:");
  console.log({
    full_name,
    birth_date,
    birth_time,
    birth_place,
    email,
  });

  try {
    const structure = generateStructure({
      full_name,
      birth_date,
      birth_time,
      birth_place,
      email,
    });

    const reading = await generateReading(structure);

    console.log("🔮 Generated Reading:");
    console.log(reading);

    return res.json({
      success: true,
      next_step: "GENERATED",
      reading,
    });
  } catch (err) {
    console.error("❌ Generation error:", err);
    return res.status(500).json({
      success: false,
      message: "Generation failed",
      error: String(err?.message || err),
    });
  }
});

// 启动服务
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Node API running on http://localhost:${PORT}`);
});
