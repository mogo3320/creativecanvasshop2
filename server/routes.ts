import { generateGroqImage } from "./groq/generateImage";
import type { Express } from "express";
import { z } from "zod";
import { storage } from "./storage";

const generateRequestSchema = z.object({
  prompt: z.string().min(1, "Prompt is required"),
  style: z.string().optional(),
  colors: z.string().optional(),
});

async function generateImage(
  prompt: string,
  transparent = false
): Promise<string | null> {
  const result = await generateGroqImage(prompt, transparent);
  return result?.base64 || null;
}

async function generateMockupFromImage(
  designDescription: string,
  productType: string
): Promise<string | null> {
  const prompts: Record<string, string> = {
    "T-Shirt": `A photorealistic product mockup of a modern plain t-shirt with a print design on the chest. The print shows: ${designDescription}. Clean white background, centered print, professional product photography style.`,
    "Mug": `A photorealistic product mockup of a white ceramic coffee mug with a print design on the side. The print shows: ${designDescription}. Clean background, professional product photography style.`,
    "Poster": `A photorealistic product mockup of a framed poster print hanging on a minimalist white wall. The poster shows: ${designDescription}. Professional interior mockup style.`,
  };

  const prompt = prompts[productType];
  if (!prompt) return null;

  const result = await generateGroqImage(prompt, false);
  return result?.base64 || null;
}

export async function registerRoutes(app: Express): Promise<void> {
  app.post("/api/generate", async (req, res) => {
    try {
      const parsed = generateRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          error: parsed.error.errors[0]?.message || "Invalid request",
        });
      }

      const { prompt, style, colors } = parsed.data;

      console.log("Generating design for prompt:", prompt);

      const mainPrompt = `
Create a single, high-quality product illustration for a print-on-demand design.

The artwork must be generated as a high-resolution PNG with a fully transparent background.
No white background, no color fill, no borders, no canvas box.
The artwork should float cleanly with alpha transparency.

Style: ${style || "modern"}.
${colors ? `Color vibe: ${colors}.` : ""}

Primary subject: ${prompt}
`;

      const mainImageUrl = await generateImage(mainPrompt, true);

      if (!mainImageUrl) {
        return res.status(500).json({ error: "Failed to generate main design image" });
      }

      console.log("Main image generated successfully");

      const mockupTypes = ["T-Shirt", "Mug", "Poster"];
      console.log("Generating mockups for:", mockupTypes.join(", "));

      const mockupResults = await Promise.all(
        mockupTypes.map(async (type) => {
          const url = await generateMockupFromImage(prompt, type);
          return { type, url };
        })
      );

      const images: string[] = [mainImageUrl];

      for (const type of mockupTypes) {
        const result = mockupResults.find((r) => r.type === type);
        if (result?.url) {
          images.push(result.url);
        }
      }

      console.log("Generated", images.length, "images total");

      await storage.createDesign({
        prompt,
        style: style || null,
        colors: colors || null,
        images,
      });

      return res.json({ images });
    } catch (error) {
      console.error("Error in generate endpoint:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      return res.status(500).json({ error: errorMessage });
    }
  });

  app.get("/api/designs", async (_req, res) => {
    try {
      const designs = await storage.getDesigns();
      return res.json(designs);
    } catch (error) {
      console.error("Error fetching designs:", error);
      return res.status(500).json({ error: "Failed to fetch designs" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }

      const token = Buffer.from(`${email}:${Date.now()}`).toString("base64");

      return res.json({ token, email });
    } catch (error) {
      console.error("Login error:", error);
      return res.status(500).json({ error: "Login failed" });
    }
  });
}