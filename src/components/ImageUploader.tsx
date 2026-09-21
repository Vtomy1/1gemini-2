import React, { useState, useRef, useEffect } from "react";
import { Upload, Image as ImageIcon, Sparkles, X, RefreshCw, Loader2, Compass } from "lucide-react";
import { SAMPLE_IMAGES } from "../data/presets";
import { ImageAnalysisData } from "../types";

interface ImageUploaderProps {
  currentImage: string | null;
  onImageSelected: (base64Url: string, mimeType: string) => void;
  onClearImage: () => void;
  onAnalyzeImage: () => void;
  isAnalyzing: boolean;
  analysisData: ImageAnalysisData | null;
  onSelectPromptIdea: (prompt: string, style: string) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  currentImage,
  onImageSelected,
  onClearImage,
  onAnalyzeImage,
  isAnalyzing,
  analysisData,
  onSelectPromptIdea,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageMeta, setImageMeta] = useState<{ width: number; height: number; sizeKb: number } | null>(null);

  // Measure image dimensions when loaded
  useEffect(() => {
    if (!currentImage) {
      setImageMeta(null);
      return;
    }
    const img = new Image();
    img.src = currentImage;
    img.onload = () => {
      // Estimate size in KB from base64 length
      const approxBytes = (currentImage.length * 3) / 4;
      setImageMeta({
        width: img.naturalWidth,
        height: img.naturalHeight,
        sizeKb: Math.round(approxBytes / 1024),
      });
    };
  }, [currentImage]);

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please upload a valid image file (PNG, JPEG, WEBP).");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        onImageSelected(result, file.type);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  // Support paste from clipboard
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (e.clipboardData?.files) {
        for (let i = 0; i < e.clipboardData.files.length; i++) {
          const file = e.clipboardData.files[i];
          if (file.type.startsWith("image/")) {
            processFile(file);
            break;
          }
        }
      }
    };
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, []);

  const loadSampleImage = async (url: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          onImageSelected(reader.result as string, blob.type || "image/jpeg");
        }
      };
      reader.readAsDataURL(blob);
    } catch (err) {
      console.error("Failed to load sample image", err);
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-col gap-4 shadow-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
            <ImageIcon className="w-4 h-4" />
          </div>
          <h2 className="text-sm font-semibold text-slate-200">1. Source Reference Image</h2>
        </div>
        {currentImage && (
          <button
            id="clear-source-image-btn"
            onClick={onClearImage}
            className="flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 px-2 py-1 rounded-md transition"
          >
            <X className="w-3.5 h-3.5" />
            <span>Remove</span>
          </button>
        )}
      </div>

      {!currentImage ? (
        <div className="flex flex-col gap-3">
          {/* Dropzone */}
          <div
            id="image-dropzone"
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition text-center ${
              isDragging
                ? "border-blue-500 bg-blue-500/10"
                : "border-slate-700/80 hover:border-blue-500/60 bg-slate-950/40 hover:bg-slate-800/30"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/jpg"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  processFile(e.target.files[0]);
                }
              }}
            />
            <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 shadow-inner group-hover:scale-105 transition">
              <Upload className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-200">
                Click to browse or drop reference image
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Supports PNG, JPG, WEBP • Paste with Ctrl+V directly
              </p>
            </div>
          </div>

          {/* Sample images quick picker */}
          <div className="flex flex-col gap-2 pt-1">
            <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Compass className="w-3 h-3 text-cyan-400" />
              Or test with a sample photo:
            </span>
            <div className="grid grid-cols-5 gap-2">
              {SAMPLE_IMAGES.map((sample, idx) => (
                <button
                  key={idx}
                  id={`sample-image-${idx}`}
                  onClick={() => loadSampleImage(sample.url)}
                  title={sample.title}
                  className="group relative aspect-square rounded-lg overflow-hidden border border-slate-700/70 hover:border-blue-400 transition transform hover:scale-[1.03]"
                >
                  <img
                    src={sample.url}
                    alt={sample.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition flex items-end p-1">
                    <span className="text-[9px] text-white font-medium truncate leading-tight">
                      {sample.title}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {/* Active Image Preview Card */}
          <div className="relative rounded-xl overflow-hidden bg-slate-950 border border-slate-800 max-h-72 flex items-center justify-center">
            <img
              src={currentImage}
              alt="Source preview"
              referrerPolicy="no-referrer"
              className="max-h-72 w-auto object-contain rounded-lg shadow-md"
            />
            {imageMeta && (
              <div className="absolute bottom-2 left-2 bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded-md text-[11px] text-slate-300 font-mono border border-slate-800 flex items-center gap-2">
                <span>
                  {imageMeta.width} × {imageMeta.height} px
                </span>
                <span className="text-slate-600">•</span>
                <span>{imageMeta.sizeKb} KB</span>
              </div>
            )}
            <button
              id="change-image-btn"
              onClick={() => fileInputRef.current?.click()}
              className="absolute top-2 right-2 bg-slate-900/90 hover:bg-slate-800 text-slate-200 text-xs px-2.5 py-1 rounded-md border border-slate-700 backdrop-blur-md transition flex items-center gap-1.5"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Replace</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/jpg"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) processFile(e.target.files[0]);
              }}
            />
          </div>

          {/* Gemini Vision Analyze Trigger */}
          <div className="flex items-center justify-between bg-slate-950/60 border border-slate-800/80 rounded-xl p-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-200">
                  Gemini 3.8 Vision Analysis
                </p>
                <p className="text-[11px] text-slate-400">
                  Deconstruct style, lighting, palette & generate transformation ideas
                </p>
              </div>
            </div>
            <button
              id="analyze-image-btn"
              onClick={onAnalyzeImage}
              disabled={isAnalyzing}
              className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-xs font-medium transition flex items-center gap-1.5 shadow-md shadow-indigo-600/20 disabled:opacity-60 cursor-pointer"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{analysisData ? "Re-analyze" : "Analyze"}</span>
                </>
              )}
            </button>
          </div>

          {/* Gemini Analysis Results Cards */}
          {analysisData && (
            <div className="bg-slate-950/80 border border-indigo-900/40 rounded-xl p-3.5 flex flex-col gap-3 animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-indigo-300 flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-cyan-400" />
                  Gemini Vision Breakdown
                </span>
                {analysisData.colorPalette && analysisData.colorPalette.length > 0 && (
                  <div className="flex items-center gap-1">
                    {analysisData.colorPalette.slice(0, 5).map((color, idx) => (
                      <span
                        key={idx}
                        className="w-3.5 h-3.5 rounded-full ring-1 ring-white/20"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                )}
              </div>

              <p className="text-xs text-slate-300 leading-relaxed italic">
                "{analysisData.summary}"
              </p>

              {analysisData.subjects && analysisData.subjects.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {analysisData.subjects.map((subj, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md border border-slate-700/60"
                    >
                      {subj}
                    </span>
                  ))}
                  {analysisData.artStyle && (
                    <span className="text-[10px] bg-indigo-950/80 text-indigo-300 px-2 py-0.5 rounded-md border border-indigo-800/60">
                      Style: {analysisData.artStyle}
                    </span>
                  )}
                </div>
              )}

              {/* Transformation Prompt Suggestions */}
              {analysisData.transformationIdeas && analysisData.transformationIdeas.length > 0 && (
                <div className="flex flex-col gap-2 pt-1 border-t border-slate-800/60">
                  <span className="text-[11px] font-medium text-slate-400">
                    Suggested Transformations (Click to apply):
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {analysisData.transformationIdeas.map((idea, idx) => (
                      <button
                        key={idx}
                        id={`prompt-idea-${idx}`}
                        onClick={() => onSelectPromptIdea(idea.prompt, idea.style)}
                        className="text-left p-2 rounded-lg bg-slate-900 hover:bg-indigo-950/50 border border-slate-800 hover:border-indigo-500/50 transition group cursor-pointer"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300">
                            {idea.title}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500 group-hover:text-indigo-400">
                            {idea.style}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                          {idea.prompt}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
