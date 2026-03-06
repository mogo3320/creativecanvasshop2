import express from "express";
import Groq from "groq-sdk";
import { StabilityAI } from "@stability/sdk";
import cors from "cors";
console.log("PORT ENV:", process.env.PORT);

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// ------------------------------
// Test Route
// ------------------------------
app.get("/", (req, res) => {
  res.send("Backend is running!");
});

// ------------------------------
// GROQ: Generate 4 Creative Prompts
// ------------------------------
app.post("/api/designs/prompts", async (req, res) => {
  try {
    const { idea } = req.body;

    if (!idea) {
      return res.status(400).json({ error: "Missing 'idea' field" });
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const prompt = `
      Create 4 creative design prompts based on this idea:
      "${idea}"

      Return them as a numbered list.
    `;

    const completion = await groq.chat.completions.create({
      model: "llama3-8b-8192",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.9,
    });

    const text = completion.choices[0].message.content;

    const prompts = text
      .split("\n")
      .map((line) => line.replace(/^\d+\.\s*/, "").trim())
      .filter((line) => line.length > 0);

    res.json({ prompts });
  } catch (err) {
    console.error("Groq error:", err);
    res.status(500).json({ error: "Failed to generate prompts" });
  }
});

// ------------------------------
// STABILITY: Generate Transparent PNG
// ------------------------------
app.post("/api/designs/generate", async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Missing 'prompt' field" });
    }

    const stability = new StabilityAI({
      apiKey: process.env.STABILITY_API_KEY,
    });

    const result = await stability.images.generate({
      model: "stable-diffusion-xl-1024-v1-0",
      prompt,
      width: 1024,
      height: 1024,
      output_format: "png",
      style_preset: "digital-art",
      transparent: true,
    });

    const imageBase64 = result.images[0].base64;

    res.json({ image: imageBase64 });
  } catch (err) {
    console.error("Stability error:", err);
    res.status(500).json({ error: "Failed to generate image" });
  }
});

// ------------------------------
// Start Server
// ------------------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
