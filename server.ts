import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Increase JSON payload limit for base64 images
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Lazy GoogleGenAI initialization
function getGenAI(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not set");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    hasApiKey: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

// Available models definition
app.get("/api/models", (req, res) => {
  res.json({
    models: [
      {
        id: "gemini-3.1-flash-lite-image",
        name: "Gemini 3.1 Flash Lite Image",
        tag: "Nano Banana Lite",
        description: "Optimized for fast, low-latency image generation and image-to-image editing.",
        isImageGeneration: true,
        supportsResolution: false,
        supportsAspectRatios: ["1:1", "3:4", "4:3", "9:16", "16:9"],
        badge: "Fastest",
        tier: "Paid API key required by Google"
      },
      {
        id: "gemini-3.1-flash-image",
        name: "Gemini 3.1 Flash Image",
        tag: "Nano Banana 2",
        description: "High-quality image generation and editing with configurable resolutions (512px, 1K, 2K, 4K).",
        isImageGeneration: true,
        supportsResolution: true,
        resolutions: ["512px", "1K", "2K", "4K"],
        supportsAspectRatios: ["1:1", "3:4", "4:3", "9:16", "16:9", "1:4", "1:8", "4:1", "8:1"],
        badge: "High Definition",
        tier: "Paid API key required by Google"
      },
      {
        id: "gemini-3-pro-image",
        name: "Gemini 3 Pro Image",
        tag: "Nano Banana Pro",
        description: "Deep reasoning model for intricate prompt comprehension and high-fidelity image transformations.",
        isImageGeneration: true,
        supportsResolution: true,
        resolutions: ["1K", "2K", "4K"],
        supportsAspectRatios: ["1:1", "3:4", "4:3", "9:16", "16:9"],
        badge: "Pro Quality",
        tier: "Paid API key required by Google"
      },
      {
        id: "gemini-2.5-flash-image",
        name: "Gemini 2.5 Flash Image",
        tag: "Preview Image",
        description: "Gemini 2.5 architecture image transformation and rendering model.",
        isImageGeneration: true,
        supportsResolution: false,
        supportsAspectRatios: ["1:1", "3:4", "4:3", "9:16", "16:9"],
        badge: "v2.5 Engine",
        tier: "Paid API key required by Google"
      },
      {
        id: "gemini-3.8-flash",
        name: "Gemini 3.8 Flash (Vision & Prompt Engine)",
        tag: "Free Unlimited",
        description: "Active free tier vision analysis, image decomposition, and smart prompt synthesis.",
        isImageGeneration: false,
        supportsResolution: false,
        badge: "Free Active",
        tier: "Free Tier Included"
      }
    ]
  });
});

// Analyze Image endpoint (uses gemini-3.8-flash)
app.post("/api/analyze-image", async (req, res) => {
  try {
    const { imageBase64, mimeType = "image/jpeg" } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: "Missing imageBase64" });
    }

    const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, "");
    const ai = getGenAI();

    const prompt = `Analyze this image for an Image-to-Image AI transformation workflow.
Return a JSON object with this exact schema:
{
  "summary": "Short 1-2 sentence description of the subject, setting, and mood",
  "subjects": ["subject 1", "subject 2"],
  "artStyle": "Current artistic style or camera look",
  "lighting": "Description of lighting",
  "colorPalette": ["#hex1", "#hex2", "#hex3", "#hex4", "#hex5"],
  "transformationIdeas": [
    {
      "title": "Creative Title (e.g. Cyberpunk Overhaul)",
      "style": "Style Name",
      "prompt": "Detailed Image-to-Image transformation prompt preserving key subjects while altering aesthetic"
    },
    {
      "title": "Anime / Studio Ghibli",
      "style": "Anime",
      "prompt": "Detailed Image-to-Image prompt"
    },
    {
      "title": "3D Pixar Animation",
      "style": "3D Render",
      "prompt": "Detailed Image-to-Image prompt"
    },
    {
      "title": "Impressionist Oil Painting",
      "style": "Fine Art",
      "prompt": "Detailed Image-to-Image prompt"
    },
    {
      "title": "Dark Fantasy & Magic",
      "style": "Fantasy",
      "prompt": "Detailed Image-to-Image prompt"
    },
    {
      "title": "Vintage 35mm Film Noir",
      "style": "Retro Photography",
      "prompt": "Detailed Image-to-Image prompt"
    }
  ],
  "suggestedNegativePrompt": "Comma separated words to avoid (e.g. blurry, low quality, artifacts, distorted faces)"
}
Return ONLY valid JSON.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: {
        parts: [
          {
            inlineData: {
              data: cleanBase64,
              mimeType: mimeType || "image/jpeg",
            },
          },
          { text: prompt },
        ],
      },
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text || "{}";
    try {
      const parsed = JSON.parse(text);
      res.json({ success: true, data: parsed });
    } catch {
      res.json({ success: true, raw: text });
    }
  } catch (error: any) {
    console.warn("[Vision Analysis]", error?.message || "Analysis issue");
    res.status(200).json({
      success: false,
      error: error?.message || "Image analysis unavailable on current tier",
      details: error?.status || "UNKNOWN",
    });
  }
});

// Prompt Enhancement endpoint
app.post("/api/enhance-prompt", async (req, res) => {
  try {
    const { prompt, style, imageDescription } = req.body;
    const ai = getGenAI();

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: `You are an expert AI prompt engineer for image-to-image models (like Google Gemini and Imagen).
The user wants to transform an existing image.
User input prompt: "${prompt || "Make it artistic and stunning"}"
Desired style: "${style || "None specified"}"
Context about reference image: "${imageDescription || "General image"}"

Generate a polished, rich, descriptive prompt specifically formatted for Gemini Image-to-Image editing that maintains core composition while applying the dramatic new style.
Return a JSON object:
{
  "enhancedPrompt": "The enhanced detailed prompt with lighting, texture, camera, and artistic details",
  "negativePrompt": "blurry, oversaturated, deformed, bad anatomy, noisy, low resolution, watermark",
  "styleKeywords": ["keyword1", "keyword2", "keyword3"]
}`,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text || "{}";
    try {
      const parsed = JSON.parse(text);
      res.json({ success: true, data: parsed });
    } catch {
      res.json({ success: true, data: { enhancedPrompt: text } });
    }
  } catch (error: any) {
    console.warn("[Prompt Enhancement]", error?.message || "Enhance issue");
    res.status(200).json({
      success: false,
      error: error?.message || "Prompt enhancement unavailable",
    });
  }
});

// Image-to-Image Generation endpoint
app.post("/api/image-to-image", async (req, res) => {
  try {
    const {
      imageBase64,
      mimeType = "image/jpeg",
      prompt,
      model = "gemini-3.1-flash-lite-image",
      aspectRatio = "1:1",
      imageSize = "1K",
      negativePrompt,
      stylePreset,
    } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: "Missing imageBase64" });
    }

    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      return res.status(400).json({ error: "Prompt is required for image-to-image transformation." });
    }

    const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, "");
    const ai = getGenAI();

    // Construct comprehensive prompt
    let finalPrompt = prompt.trim();
    if (stylePreset && stylePreset !== "None" && !finalPrompt.toLowerCase().includes(stylePreset.toLowerCase())) {
      finalPrompt = `${stylePreset} style: ${finalPrompt}`;
    }
    if (negativePrompt && negativePrompt.trim()) {
      finalPrompt += `. Avoid: ${negativePrompt.trim()}`;
    }

    // Prepare imageConfig if supported
    const imageConfig: Record<string, any> = {};
    if (aspectRatio) {
      imageConfig.aspectRatio = aspectRatio;
    }
    if ((model === "gemini-3.1-flash-image" || model === "gemini-3-pro-image") && imageSize) {
      imageConfig.imageSize = imageSize;
    }

    console.log(`Executing image-to-image with model: ${model}`);

    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          {
            inlineData: {
              data: cleanBase64,
              mimeType: mimeType || "image/jpeg",
            },
          },
          {
            text: finalPrompt,
          },
        ],
      },
      config: Object.keys(imageConfig).length > 0 ? { imageConfig } : undefined,
    });

    // Extract the generated image from response candidates
    let generatedImageUrl: string | null = null;
    let modelTextOutput: string = "";

    const candidates = response.candidates || [];
    if (candidates.length > 0 && candidates[0].content?.parts) {
      for (const part of candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          const partMime = part.inlineData.mimeType || "image/png";
          generatedImageUrl = `data:${partMime};base64,${part.inlineData.data}`;
        } else if (part.text) {
          modelTextOutput += part.text + " ";
        }
      }
    }

    if (generatedImageUrl) {
      return res.json({
        success: true,
        imageUrl: generatedImageUrl,
        notes: modelTextOutput.trim(),
        modelUsed: model,
      });
    }

    // If model returned text only without an image inlineData
    return res.json({
      success: false,
      isQuotaError: false,
      error: "Model did not return an image part in the response.",
      modelOutput: modelTextOutput.trim(),
      fallbackRecommendation: "neural_styler",
    });
  } catch (error: any) {
    const errorMessage = error?.message || "Generation request failed";
    const isQuotaError =
      errorMessage.includes("Quota exceeded") ||
      errorMessage.includes("limit: 0") ||
      error?.status === "RESOURCE_EXHAUSTED" ||
      error?.code === 429;

    console.warn(`[Image-to-Image] ${req.body?.model || "model"}: ${isQuotaError ? "Quota limit 0 on free tier" : errorMessage.slice(0, 100)}`);

    return res.json({
      success: false,
      error: errorMessage,
      isQuotaError,
      requiresPaidKey: isQuotaError && (errorMessage.includes("limit: 0") || errorMessage.includes("free_tier")),
      fallbackRecommendation: "neural_styler",
      model: req.body?.model,
      helpUrl: "https://ai.google.dev/gemini-api/docs/rate-limits",
    });
  }
});

// Vite / static file middleware
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Gemini Image-to-Image Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
