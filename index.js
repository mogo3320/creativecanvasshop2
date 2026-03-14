import FormData from "form-data";

const formData = new FormData();
formData.append("prompt", finalPrompt);
formData.append("output_format", "png");
formData.append("aspect_ratio", "1:1");

const response = await fetch(
  "https://api.stability.ai/v2beta/stable-image/generate/ultra",
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.STABILITY_API_KEY}`,
      Accept: "application/json",
      ...formData.getHeaders(),
    },
    body: formData,
  }
);
