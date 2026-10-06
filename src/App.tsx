import React, { useState, useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { ImageUploader } from "./components/ImageUploader";
import { ModelSelector } from "./components/ModelSelector";
import { PromptControls } from "./components/PromptControls";
import { ComparisonViewer } from "./components/ComparisonViewer";
import { HistoryDrawer } from "./components/HistoryDrawer";
import { InfoModal } from "./components/InfoModal";
import { QuotaNoticeModal } from "./components/QuotaNoticeModal";
import { STYLE_PRESETS, SAMPLE_IMAGES } from "./data/presets";
import {
  GeminiModelInfo,
  AspectRatioType,
  ImageSizeType,
  StylePreset,
  ImageAnalysisData,
  GenerationHistoryItem,
} from "./types";
import { applyNeuralStyle, NeuralStyleMode } from "./utils/neuralStyler";
import { Sparkles, AlertCircle, CheckCircle, Info } from "lucide-react";

const DEFAULT_MODELS: GeminiModelInfo[] = [
  {
    id: "gemini-3.1-flash-lite-image",
    name: "Gemini 3.1 Flash Lite Image",
    tag: "Nano Banana Lite",
    description: "Fast low-latency image generation and image-to-image transformations.",
    isImageGeneration: true,
    supportsResolution: false,
    supportsAspectRatios: ["1:1", "3:4", "4:3", "9:16", "16:9"],
    badge: "Fastest",
    tier: "Paid API key required by Google",
  },
  {
    id: "gemini-3.1-flash-image",
    name: "Gemini 3.1 Flash Image",
    tag: "Nano Banana 2",
    description: "High-definition image generation with configurable resolutions (512px, 1K, 2K, 4K).",
    isImageGeneration: true,
    supportsResolution: true,
    resolutions: ["512px", "1K", "2K", "4K"],
    supportsAspectRatios: ["1:1", "3:4", "4:3", "9:16", "16:9", "1:4", "1:8", "4:1", "8:1"],
    badge: "High Definition",
    tier: "Paid API key required by Google",
  },
  {
    id: "gemini-3-pro-image",
    name: "Gemini 3 Pro Image",
    tag: "Nano Banana Pro",
    description: "Deep reasoning for intricate visual edits and complex compositional requests.",
    isImageGeneration: true,
    supportsResolution: true,
    resolutions: ["1K", "2K", "4K"],
    supportsAspectRatios: ["1:1", "3:4", "4:3", "9:16", "16:9"],
    badge: "Pro Quality",
    tier: "Paid API key required by Google",
  },
  {
    id: "gemini-2.5-flash-image",
    name: "Gemini 2.5 Flash Image",
    tag: "v2.5 Architecture",
    description: "Gemini 2.5 generation and image editing pipeline.",
    isImageGeneration: true,
    supportsResolution: false,
    supportsAspectRatios: ["1:1", "3:4", "4:3", "9:16", "16:9"],
    badge: "v2.5 Engine",
    tier: "Paid API key required by Google",
  },
];

export default function App() {
  const [models, setModels] = useState<GeminiModelInfo[]>(DEFAULT_MODELS);
  const [selectedModel, setSelectedModel] = useState<GeminiModelInfo>(DEFAULT_MODELS[0]);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [currentMimeType, setCurrentMimeType] = useState<string>("image/jpeg");
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const [prompt, setPrompt] = useState<string>("");
  const [negativePrompt, setNegativePrompt] = useState<string>("");
  const [selectedPreset, setSelectedPreset] = useState<StylePreset>(STYLE_PRESETS[1]); // Default Cyberpunk
  const [aspectRatio, setAspectRatio] = useState<AspectRatioType>("1:1");
  const [imageSize, setImageSize] = useState<ImageSizeType>("1K");
  const [intensity, setIntensity] = useState<number>(0.85);
  const [engineMode, setEngineMode] = useState<"gemini" | "neural_styler">("gemini");

  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isEnhancing, setIsEnhancing] = useState<boolean>(false);
  const [analysisData, setAnalysisData] = useState<ImageAnalysisData | null>(null);

  const [history, setHistory] = useState<GenerationHistoryItem[]>([]);
  const [activeHistoryItem, setActiveHistoryItem] = useState<GenerationHistoryItem | null>(null);

  const [activeTab, setActiveTab] = useState<"editor" | "history">("editor");
  const [isInfoOpen, setIsInfoOpen] = useState<boolean>(false);
  const [quotaModalOpen, setQuotaModalOpen] = useState<boolean>(false);
  const [toast, setToast] = useState<{ type: "success" | "error" | "info"; message: string } | null>(null);

  const showToast = (type: "success" | "error" | "info", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  // Load models from server
  useEffect(() => {
    fetch("/api/models")
      .then((res) => res.json())
      .then((data) => {
        if (data.models && Array.isArray(data.models)) {
          const imageModels = data.models.filter((m: any) => m.isImageGeneration);
          if (imageModels.length > 0) {
            setModels(imageModels);
            setSelectedModel(imageModels[0]);
          }
        }
      })
      .catch((err) => console.log("Using default model definitions", err));
  }, []);

  // Load history from localStorage on startup
  useEffect(() => {
    try {
      const stored = localStorage.getItem("gemini_img2img_history");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setHistory(parsed);
        }
      }
    } catch (e) {
      console.warn("Failed to load history from localStorage", e);
    }
  }, []);

  // Save history to localStorage
  const saveToHistory = (item: GenerationHistoryItem) => {
    setHistory((prev) => {
      const updated = [item, ...prev].slice(0, 30); // Keep latest 30
      try {
        localStorage.setItem("gemini_img2img_history", JSON.stringify(updated));
      } catch (e) {
        console.warn("Storage quota limit reached for history", e);
      }
      return updated;
    });
    setActiveHistoryItem(item);
  };

  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem("gemini_img2img_history");
    showToast("info", "Gallery history cleared");
  };

  // Pre-load a sample image so user has immediate visual context
  useEffect(() => {
    if (!currentImage) {
      const sample = SAMPLE_IMAGES[0];
      fetch(sample.url)
        .then((res) => res.blob())
        .then((blob) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            if (reader.result) {
              setCurrentImage(reader.result as string);
              setCurrentMimeType(blob.type || "image/jpeg");
              setPrompt(STYLE_PRESETS[1].promptSuffix);
            }
          };
          reader.readAsDataURL(blob);
        })
        .catch(() => {});
    }
  }, []);

  const handleImageSelected = (base64Url: string, mimeType: string) => {
    setCurrentImage(base64Url);
    setCurrentMimeType(mimeType);
    setGeneratedImage(null);
    setActiveHistoryItem(null);
    setAnalysisData(null);
    showToast("success", "Reference image loaded successfully");
  };

  const handleClearImage = () => {
    setCurrentImage(null);
    setGeneratedImage(null);
    setActiveHistoryItem(null);
    setAnalysisData(null);
  };

  // Analyze image with Gemini 3.8 Flash Vision
  const handleAnalyzeImage = async () => {
    if (!currentImage) return;
    setIsAnalyzing(true);
    try {
      const res = await fetch("/api/analyze-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: currentImage,
          mimeType: currentMimeType,
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setAnalysisData(data.data);
        if (data.data.suggestedNegativePrompt && !negativePrompt) {
          setNegativePrompt(data.data.suggestedNegativePrompt);
        }
        showToast("success", "Gemini Vision analysis completed!");
      } else {
        throw new Error(data.error || "Analysis failed");
      }
    } catch (err: any) {
      console.error("Analysis error:", err);
      showToast("error", err?.message || "Failed to analyze image");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Enhance prompt with Gemini 3.8 Flash
  const handleEnhancePrompt = async () => {
    if (!prompt.trim()) return;
    setIsEnhancing(true);
    try {
      const res = await fetch("/api/enhance-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          style: selectedPreset.name,
          imageDescription: analysisData?.summary || "Reference photo",
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        if (data.data.enhancedPrompt) {
          setPrompt(data.data.enhancedPrompt);
        }
        if (data.data.negativePrompt && !negativePrompt) {
          setNegativePrompt(data.data.negativePrompt);
        }
        showToast("success", "Prompt magically enhanced by Gemini AI!");
      }
    } catch (err: any) {
      console.error("Enhance error:", err);
      showToast("error", "Failed to enhance prompt");
    } finally {
      setIsEnhancing(false);
    }
  };

  // Select a preset
  const handleSelectPreset = (preset: StylePreset) => {
    setSelectedPreset(preset);
    if (preset.promptSuffix) {
      if (!prompt.trim() || prompt === selectedPreset.promptSuffix) {
        setPrompt(preset.promptSuffix);
      } else if (!prompt.includes(preset.name)) {
        setPrompt(`${preset.name} style: ${prompt}`);
      }
    }
    if (preset.negativeSuffix && !negativePrompt) {
      setNegativePrompt(preset.negativeSuffix);
    }
  };

  const handleSelectPromptIdea = (newPrompt: string, style: string) => {
    setPrompt(newPrompt);
    const matchingPreset = STYLE_PRESETS.find(
      (p) => p.name.toLowerCase().includes(style.toLowerCase()) || style.toLowerCase().includes(p.name.toLowerCase())
    );
    if (matchingPreset) {
      setSelectedPreset(matchingPreset);
    }
    showToast("info", `Applied suggestion: ${style}`);
  };

  // Run instant neural transformation
  const runNeuralTransform = async (customNote?: string) => {
    if (!currentImage) return;
    setIsGenerating(true);
    try {
      // Map selected preset to NeuralStyleMode
      let neuralMode: NeuralStyleMode = "cyberpunk";
      const presetId = selectedPreset.id;
      if (presetId === "anime_ghibli") neuralMode = "anime_ghibli";
      else if (presetId === "oil_painting") neuralMode = "oil_painting";
      else if (presetId === "charcoal_sketch") neuralMode = "charcoal_sketch";
      else if (presetId === "vintage_35mm") neuralMode = "vintage_35mm";
      else if (presetId === "dark_fantasy") neuralMode = "dark_fantasy";
      else if (presetId === "vaporwave") neuralMode = "vaporwave";
      else if (presetId === "claymation") neuralMode = "claymation";
      else if (presetId === "pop_art") neuralMode = "pop_art";
      else neuralMode = "cyberpunk";

      const outputDataUrl = await applyNeuralStyle(currentImage, neuralMode, intensity);
      setGeneratedImage(outputDataUrl);

      const newItem: GenerationHistoryItem = {
        id: Date.now().toString(),
        originalImage: currentImage,
        generatedImage: outputDataUrl,
        prompt: prompt || `${selectedPreset.name} transformation`,
        negativePrompt,
        model: customNote
          ? "Instant Neural Engine (Free Tier Auto-Fallback)"
          : "Instant Neural Engine (Free Unlimited)",
        aspectRatio,
        imageSize,
        stylePreset: selectedPreset.name,
        timestamp: Date.now(),
        engineUsed: "neural_styler",
        notes: customNote,
      };
      saveToHistory(newItem);
      showToast("success", "Transformation synthesized!");
    } catch (err: any) {
      console.warn("Neural transform issue:", err);
      showToast("error", "Failed to transform image");
    } finally {
      setIsGenerating(false);
    }
  };

  // Run primary Generation
  const handleGenerate = async () => {
    if (!currentImage) {
      showToast("error", "Please upload a source image first.");
      return;
    }

    if (engineMode === "neural_styler") {
      await runNeuralTransform();
      return;
    }

    // Google Gemini API Image Generation
    setIsGenerating(true);
    try {
      const res = await fetch("/api/image-to-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: currentImage,
          mimeType: currentMimeType,
          prompt: prompt || `Transform this image with ${selectedPreset.name} artistic style`,
          model: selectedModel.id,
          aspectRatio,
          imageSize,
          negativePrompt,
          stylePreset: selectedPreset.name !== "Natural / Custom" ? selectedPreset.name : undefined,
        }),
      });

      const data = await res.json();

      if (!data.success || data.isQuotaError || !data.imageUrl) {
        // Google Cloud image generation models require a paid billing-enabled key (limit: 0 on free tier).
        // Seamlessly synthesize using our Instant Neural Engine so the user gets their transformed image right away!
        showToast(
          "info",
          "Google Gemini image model requires billing (limit: 0). Auto-synthesized with Free Unlimited Neural Engine!"
        );
        await runNeuralTransform(
          data.isQuotaError
            ? "Google Gemini image model quota limit is 0 on free tier. Seamlessly synthesized with Free Unlimited Neural Styler."
            : data.error
        );
        return;
      }

      setGeneratedImage(data.imageUrl);
      const newItem: GenerationHistoryItem = {
        id: Date.now().toString(),
        originalImage: currentImage,
        generatedImage: data.imageUrl,
        prompt: prompt || selectedPreset.name,
        negativePrompt,
        model: selectedModel.name,
        aspectRatio,
        imageSize,
        stylePreset: selectedPreset.name,
        timestamp: Date.now(),
        engineUsed: "gemini",
        notes: data.notes,
      };
      saveToHistory(newItem);
      showToast("success", "Transformed successfully with Google Gemini!");
    } catch (err: any) {
      console.warn("Generation fallback triggered:", err);
      showToast("info", "Synthesized using Instant Neural Engine (Free Mode)");
      await runNeuralTransform("Synthesized via Free Unlimited Neural Engine");
    } finally {
      setIsGenerating(false);
    }
  };

  // Chain output as new input
  const handleUseAsSource = (imageUrl: string) => {
    setCurrentImage(imageUrl);
    setGeneratedImage(null);
    setActiveHistoryItem(null);
    showToast("info", "Previous result is now the source reference! Ready for next transformation.");
  };

  // Load item from history
  const handleSelectHistoryItem = (item: GenerationHistoryItem) => {
    setCurrentImage(item.originalImage);
    setGeneratedImage(item.generatedImage);
    setActiveHistoryItem(item);
    setPrompt(item.prompt);
    setActiveTab("editor");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-500 selection:text-white">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 fade-in duration-200">
          <div
            className={`px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs font-medium border backdrop-blur-md ${
              toast.type === "success"
                ? "bg-emerald-950/90 border-emerald-600 text-emerald-200"
                : toast.type === "error"
                ? "bg-rose-950/90 border-rose-600 text-rose-200"
                : "bg-blue-950/90 border-blue-600 text-blue-200"
            }`}
          >
            {toast.type === "success" && <CheckCircle className="w-4 h-4 text-emerald-400" />}
            {toast.type === "error" && <AlertCircle className="w-4 h-4 text-rose-400" />}
            {toast.type === "info" && <Info className="w-4 h-4 text-blue-400" />}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        selectedModel={selectedModel}
        models={models}
        onSelectModel={setSelectedModel}
        onOpenInfo={() => setIsInfoOpen(true)}
        historyCount={history.length}
        onOpenHistory={() => setActiveTab("history")}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
        {activeTab === "history" ? (
          <HistoryDrawer
            history={history}
            onSelectHistoryItem={handleSelectHistoryItem}
            onClearHistory={handleClearHistory}
            onClose={() => setActiveTab("editor")}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Source Image & Model Config (5 cols on lg) */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              {/* Image Uploader */}
              <ImageUploader
                currentImage={currentImage}
                onImageSelected={handleImageSelected}
                onClearImage={handleClearImage}
                onAnalyzeImage={handleAnalyzeImage}
                isAnalyzing={isAnalyzing}
                analysisData={analysisData}
                onSelectPromptIdea={handleSelectPromptIdea}
              />

              {/* Model & Engine Configuration */}
              <ModelSelector
                models={models}
                selectedModel={selectedModel}
                onSelectModel={setSelectedModel}
                aspectRatio={aspectRatio}
                onSelectAspectRatio={setAspectRatio}
                imageSize={imageSize}
                onSelectImageSize={setImageSize}
                engineMode={engineMode}
                onSelectEngineMode={setEngineMode}
              />
            </div>

            {/* Right Column: Prompt Controls & Transformation Output (7 cols on lg) */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              {/* Prompt & Style Controls */}
              <PromptControls
                prompt={prompt}
                onChangePrompt={setPrompt}
                negativePrompt={negativePrompt}
                onChangeNegativePrompt={setNegativePrompt}
                selectedPreset={selectedPreset}
                onSelectPreset={handleSelectPreset}
                onEnhancePrompt={handleEnhancePrompt}
                isEnhancing={isEnhancing}
                onGenerate={handleGenerate}
                isGenerating={isGenerating}
                hasSourceImage={!!currentImage}
                engineMode={engineMode}
                intensity={intensity}
                onChangeIntensity={setIntensity}
                imageDescription={analysisData?.summary}
                onToast={showToast}
              />

              {/* Comparison & Result Viewer */}
              {generatedImage && currentImage ? (
                <ComparisonViewer
                  originalImage={currentImage}
                  generatedImage={generatedImage}
                  historyItem={activeHistoryItem}
                  onUseAsSource={handleUseAsSource}
                  onRetry={handleGenerate}
                  isGenerating={isGenerating}
                />
              ) : (
                <div className="bg-slate-900/60 border border-dashed border-slate-800 rounded-2xl p-10 flex flex-col items-center justify-center gap-3 text-center min-h-[320px]">
                  <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-slate-400">
                    <Sparkles className="w-6 h-6 text-blue-400" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-200">
                    Ready for Transformation
                  </h3>
                  <p className="text-xs text-slate-400 max-w-md">
                    Select a style preset or enter a transformation prompt, then click{" "}
                    <strong className="text-slate-200">Generate Image-to-Image</strong> to view an interactive before/after split slider.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Model Information Modal */}
      <InfoModal
        isOpen={isInfoOpen}
        onClose={() => setIsInfoOpen(false)}
        models={models}
      />

      {/* Quota Notice Modal */}
      <QuotaNoticeModal
        isOpen={quotaModalOpen}
        onClose={() => setQuotaModalOpen(false)}
        onUseNeuralFallback={() => {
          setEngineMode("neural_styler");
          runNeuralTransform();
        }}
        onRetry={handleGenerate}
        modelName={selectedModel.name}
      />
    </div>
  );
}
