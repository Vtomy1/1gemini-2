export interface GeminiModelInfo {
  id: string;
  name: string;
  tag: string;
  description: string;
  isImageGeneration: boolean;
  supportsResolution?: boolean;
  resolutions?: string[];
  supportsAspectRatios?: string[];
  badge: string;
  tier: string;
}

export type AspectRatioType = "1:1" | "3:4" | "4:3" | "9:16" | "16:9" | "1:4" | "1:8" | "4:1" | "8:1";
export type ImageSizeType = "512px" | "1K" | "2K" | "4K";

export interface StylePreset {
  id: string;
  name: string;
  description: string;
  promptSuffix: string;
  negativeSuffix: string;
  previewGradient: string;
  iconName: string;
  category: "Artistic" | "Realistic" | "Fantasy" | "Digital" | "Retro";
}

export interface ImageAnalysisData {
  summary: string;
  subjects: string[];
  artStyle: string;
  lighting: string;
  colorPalette: string[];
  transformationIdeas: Array<{
    title: string;
    style: string;
    prompt: string;
  }>;
  suggestedNegativePrompt: string;
}

export interface GenerationHistoryItem {
  id: string;
  originalImage: string;
  generatedImage: string;
  prompt: string;
  negativePrompt?: string;
  model: string;
  aspectRatio: string;
  imageSize?: string;
  stylePreset?: string;
  timestamp: number;
  engineUsed: "gemini" | "neural_styler";
  notes?: string;
}

export interface PromptRemixVariation {
  id: string;
  styleTitle: string;
  tagline: string;
  remixPrompt: string;
  badge?: string;
}

export interface NeuralFilterConfig {
  brightness: number;
  contrast: number;
  saturation: number;
  hueRotate: number;
  sepia: number;
  blur: number;
  vintage: boolean;
  cyberpunk: boolean;
  animeLut: boolean;
  sketchEdges: boolean;
  oilImpression: boolean;
  grain: number;
  vignette: number;
}
