import express from "express";
import cors from "cors";

console.log("PORT ENV:", process.env.PORT);

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));

// Test route
app.get("/", (req, res) => {
  res.send("Backend is running!");
});

// Image generation route
app.post("/api/generate", async (req, res) => {
  try {
    const { prompt, style, colors } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    let finalPrompt = prompt;
    if (style) finalPrompt += `, style: ${style}`;
    if (colors) finalPrompt += `, colors: ${colors}`;

    const response = await fetch(
      "https://api.stability.ai/v2beta/stable-image/generate/ultra",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${process.env.STABILITY_API_KEY}`,
        },
        body: JSON.stringify({
          prompt: finalPrompt,
          output_format: "png",
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Stability API Error:", errorText);
      return res.status(500).json({ error: errorText });
    }

    const result = await response.json();
    res.json({ images: result.images });
  } catch (err) {
    console.error("Generation error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Required for Render
app.listen(process.env.PORT || 3000, () => {
  console.log("Server running on port", process.env.PORT || 3000);
});
