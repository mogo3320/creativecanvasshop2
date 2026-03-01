import { groq } from "./client";
export async function generateGroqImage(
  prompt: string,
  transparent: boolean = false,
) {
  try {
    const finalPrompt = transparent
      ? `${prompt}\n\nThe image must have a fully transparent background. No white, no borders, no canvas box.`
      : prompt;
    const response = await groq.images.generate({
      model: "gpt-image-1",
      prompt: finalPrompt,
      size: "1024x1024",
      response_format: "b64_json",
    });
    const b64 = response.data[0].b64_json;
    const buffer = Buffer.from(b64, "base64");
    return { buffer, base64: `data:image/png;base64,${b64}` };
  } catch (err) {
    console.error("Groq image generation failed:", err);
    return null;
  }
}
