import express from "express";
import cors from "cors";
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "../shared/schema";
import { groq } from "./groq/client";
import { saveImage, saveSession, getImagesForSession } from "./storage";

// -----------------------------
// Database (SQLite + Drizzle)
// -----------------------------
const sqlite = new Database("database.sqlite");
export const db = drizzle(sqlite, { schema });

// -----------------------------
// Express App
// -----------------------------
const app = express();
app.use(cors());
app.use(express.json());

// -----------------------------
// Routes
// -----------------------------

// Create or update a session
app.post("/api/session", async (req, res) => {
  const { sessionId } = req.body;

  if (!sessionId) {
    return res.status(400).json({ error: "Missing sessionId" });
  }

  await saveSession(sessionId);
  res.json({ success: true });
});

// Generate an image using Groq
app.post("/api/generate", async (req, res) => {
  const { prompt, sessionId } = req.body;

  if (!prompt || !sessionId) {
    return res.status(400).json({ error: "Missing prompt or sessionId" });
  }

  try {
    const result = await groq.images.generate({
      model: "llama-3.2-11b-vision-preview",
      prompt,
      size: "1024x1024",
    });

    const imageUrl = result.data[0].url;

    await saveImage({
      sessionId,
      prompt,
      imageUrl,
    });

    res.json({ imageUrl });
  } catch (err) {
    console.error("Groq error:", err);
    res.status(500).json({ error: "Image generation failed" });
  }
});

// Get all images for a session
app.get("/api/images/:sessionId", async (req, res) => {
  const { sessionId } = req.params;
  const images = await getImagesForSession(sessionId);
  res.json(images);
});

// -----------------------------
// Test Route (for connectivity)
// -----------------------------
app.get("/test", (req, res) => {
  res.send("Backend is working!");
});

// -----------------------------
// Start Server
// -----------------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Production server running on port ${PORT}`);
});
