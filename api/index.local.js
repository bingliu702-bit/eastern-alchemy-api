import express from "express";
import "dotenv/config";

import { generateStructure } from "../src/services/structure.service.js";
import { generateMetaphysicsContent } from "../src/services/openai.service.js";

const app = express();
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ ok: true }));

app.post("/api/order", async (req, res) => {
  try {
    const order = req.body;
    const structure = generateStructure(order);
    const content = await generateMetaphysicsContent(order, structure);

    res.json({ success: true, next_step: "CONTENT_READY", content });
  } catch (err) {
    console.error("LOCAL API ERROR:", err);
    res.status(500).json({ success: false, error: err?.message || "Error" });
  }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`LOCAL API running http://localhost:${PORT}`));
