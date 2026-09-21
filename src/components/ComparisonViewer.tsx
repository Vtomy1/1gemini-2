import React, { useState, useRef, useEffect } from "react";
import { Download, Copy, Check, ArrowLeftRight, Columns2, Square, Sparkles, RefreshCw, Layers } from "lucide-react";
import { GenerationHistoryItem } from "../types";

interface ComparisonViewerProps {
  originalImage: string;
  generatedImage: string;
  historyItem?: GenerationHistoryItem | null;
  onUseAsSource: (imageUrl: string) => void;
  onRetry: () => void;
  isGenerating: boolean;
}

export const ComparisonViewer: React.FC<ComparisonViewerProps> = ({
  originalImage,
  generatedImage,
  historyItem,
  onUseAsSource,
  onRetry,
  isGenerating,
}) => {
  const [sliderPosition, setSliderPosition] = useState<number>(50);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<"slider" | "side_by_side" | "generated_only">("slider");
  const [copied, setCopied] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handlePointerMove = (e: React.PointerEvent | PointerEvent) => {
    if (!isDragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percent);
  };

  useEffect(() => {
    const onUp = () => setIsDragging(false);
    const onMove = (e: PointerEvent) => {
      if (isDragging) handlePointerMove(e);
    };
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointermove", onMove);
    return () => {
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointermove", onMove);
    };
  }, [isDragging]);

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = generatedImage;
    link.download = `gemini-img2img-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopy = async () => {
    try {
      const response = await fetch(generatedImage);
      const blob = await response.blob();
      await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Clipboard copy error:", err);
      // Fallback: copy base64 text
      navigator.clipboard.writeText(generatedImage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-col gap-4 shadow-xl">
      {/* Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-200">Transformation Result</h2>
            {historyItem && (
              <p className="text-[11px] text-slate-400">
                Model: <span className="font-mono text-cyan-400">{historyItem.model}</span> • {historyItem.aspectRatio}
              </p>
            )}
          </div>
        </div>

        {/* View mode switcher */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            id="view-mode-slider"
            onClick={() => setViewMode("slider")}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1 transition cursor-pointer ${
              viewMode === "slider"
                ? "bg-blue-600 text-white"
                : "text-slate-400 hover:text-slate-200"
            }`}
            title="Interactive Split Slider"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Split Compare</span>
          </button>

          <button
            id="view-mode-side-by-side"
            onClick={() => setViewMode("side_by_side")}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1 transition cursor-pointer ${
              viewMode === "side_by_side"
                ? "bg-blue-600 text-white"
                : "text-slate-400 hover:text-slate-200"
            }`}
            title="Side by Side View"
          >
            <Columns2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Side-by-Side</span>
          </button>

          <button
            id="view-mode-result-only"
            onClick={() => setViewMode("generated_only")}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1 transition cursor-pointer ${
              viewMode === "generated_only"
                ? "bg-blue-600 text-white"
                : "text-slate-400 hover:text-slate-200"
            }`}
            title="Result Only"
          >
            <Square className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Result</span>
          </button>
        </div>
      </div>

      {/* Main Comparison Canvas Stage */}
      <div className="relative rounded-xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center min-h-[360px] max-h-[520px]">
        {viewMode === "slider" && (
          <div
            ref={containerRef}
            onPointerDown={(e) => {
              setIsDragging(true);
              handlePointerMove(e);
            }}
            className="relative w-full h-[460px] overflow-hidden select-none cursor-ew-resize flex items-center justify-center"
          >
            {/* Background: Generated Image */}
            <img
              src={generatedImage}
              alt="Generated"
              referrerPolicy="no-referrer"
              className="absolute inset-0 w-full h-full object-contain pointer-events-none"
            />

            {/* Foreground: Original Image clipped by slider position */}
            <div
              className="absolute inset-0 overflow-hidden pointer-events-none"
              style={{ width: `${sliderPosition}%` }}
            >
              <img
                src={originalImage}
                alt="Original"
                referrerPolicy="no-referrer"
                className="absolute inset-0 w-full h-full object-contain max-w-none"
                style={{
                  width: containerRef.current ? `${containerRef.current.clientWidth}px` : "100%",
                }}
              />
            </div>

            {/* Slider Divider Bar */}
            <div
              className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_12px_rgba(255,255,255,0.8)] z-10 flex items-center justify-center pointer-events-none"
              style={{ left: `${sliderPosition}%` }}
            >
              <div className="w-8 h-8 rounded-full bg-white text-slate-900 flex items-center justify-center shadow-lg border border-slate-300">
                <ArrowLeftRight className="w-4 h-4" />
              </div>
            </div>

            {/* Floating Labels */}
            <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-md text-[11px] font-bold text-slate-200 border border-slate-700/60 pointer-events-none">
              Original Reference
            </div>
            <div className="absolute top-3 right-3 bg-blue-900/80 backdrop-blur-md px-2.5 py-1 rounded-md text-[11px] font-bold text-blue-200 border border-blue-600/60 pointer-events-none">
              Transformed (AI)
            </div>
          </div>
        )}

        {viewMode === "side_by_side" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 w-full p-2 h-[460px]">
            <div className="relative rounded-lg overflow-hidden bg-slate-900/60 border border-slate-800 flex items-center justify-center">
              <span className="absolute top-2 left-2 bg-slate-900/90 px-2 py-0.5 rounded text-[10px] text-slate-300 border border-slate-700">
                Original
              </span>
              <img
                src={originalImage}
                alt="Original"
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="relative rounded-lg overflow-hidden bg-slate-900/60 border border-blue-900/40 flex items-center justify-center">
              <span className="absolute top-2 left-2 bg-blue-900/90 px-2 py-0.5 rounded text-[10px] text-blue-200 border border-blue-700">
                Transformed
              </span>
              <img
                src={generatedImage}
                alt="Generated"
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        )}

        {viewMode === "generated_only" && (
          <div className="relative w-full h-[460px] flex items-center justify-center p-2">
            <img
              src={generatedImage}
              alt="Generated Result"
              referrerPolicy="no-referrer"
              className="max-h-full max-w-full object-contain rounded-lg shadow-xl"
            />
          </div>
        )}
      </div>

      {/* Prompt summary footnote if available */}
      {historyItem && (
        <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800/80 text-xs text-slate-300 flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
              Prompt Used
            </span>
            {historyItem.notes && (
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-950/80 border border-emerald-800/60 text-emerald-300">
                {historyItem.notes.includes("Free Tier") || historyItem.notes.includes("free tier")
                  ? "Free Unlimited Mode"
                  : "AI Synthesized"}
              </span>
            )}
          </div>
          <p className="italic text-slate-200">"{historyItem.prompt}"</p>
        </div>
      )}

      {/* Action Buttons Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
        <div className="flex items-center gap-2">
          {/* Download button */}
          <button
            id="download-result-btn"
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/30 transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download PNG</span>
          </button>

          {/* Copy Image button */}
          <button
            id="copy-result-btn"
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-300">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Image</span>
              </>
            )}
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Reuse as Input / Chain transformation */}
          <button
            id="use-as-source-btn"
            onClick={() => onUseAsSource(generatedImage)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 text-xs font-medium border border-indigo-500/30 transition cursor-pointer"
            title="Use this generated output as the new source reference image to apply sequential transformations"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Chain As Next Input</span>
          </button>

          {/* Retry with variation */}
          <button
            id="retry-generation-btn"
            onClick={onRetry}
            disabled={isGenerating}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? "animate-spin" : ""}`} />
            <span>Regenerate</span>
          </button>
        </div>
      </div>
    </div>
  );
};
