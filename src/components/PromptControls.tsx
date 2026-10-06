import React, { useState } from "react";
import {
  Sparkles,
  Wand2,
  Palette,
  ShieldAlert,
  ArrowRight,
  Loader2,
  ChevronDown,
  ChevronUp,
  Shuffle,
  Copy,
  Check,
  RotateCcw,
  X,
  Layers,
} from "lucide-react";
import { STYLE_PRESETS } from "../data/presets";
import { StylePreset, PromptRemixVariation } from "../types";

interface PromptControlsProps {
  prompt: string;
  onChangePrompt: (val: string) => void;
  negativePrompt: string;
  onChangeNegativePrompt: (val: string) => void;
  selectedPreset: StylePreset;
  onSelectPreset: (preset: StylePreset) => void;
  onEnhancePrompt: () => void;
  isEnhancing: boolean;
  onGenerate: () => void;
  isGenerating: boolean;
  hasSourceImage: boolean;
  engineMode: "gemini" | "neural_styler";
  intensity: number;
  onChangeIntensity: (val: number) => void;
  imageDescription?: string;
  onToast?: (type: "success" | "error" | "info", message: string) => void;
}

function generateFallbackRemixes(basePrompt: string, styleName?: string): PromptRemixVariation[] {
  const clean = basePrompt.replace(/\s+/g, " ").trim();
  return [
    {
      id: "variation-1",
      styleTitle: "Futuristic Cyber-Chroma",
      badge: "Sci-Fi / Cyber",
      tagline: "Volumetric neon luminescence, rainy megacity reflections, and chrome biomechanical details",
      remixPrompt: `${clean}, reimagined in ultra-detailed cyberpunk sci-fi aesthetic, gleaming holographic armor, neon turquoise and magenta reflections on wet pavement, volumetric misty lighting, octanerender 8k masterpiece.`,
    },
    {
      id: "variation-2",
      styleTitle: "Baroque Ethereal Oil",
      badge: "Fantasy / Fine Art",
      tagline: "Dramatic chiaroscuro shadows, rich gold leaf filigree, and mystical renaissance oil canvas",
      remixPrompt: `${clean}, transformed into classical baroque masterwork, dramatic caravaggio chiaroscuro lighting, rich textured oil painting brushstrokes, golden mystical aura, ornate filigree details, museum masterpiece.`,
    },
    {
      id: "variation-3",
      styleTitle: "Vintage 35mm Film Noir",
      badge: "Retro / Cinematic",
      tagline: "Atmospheric Kodachrome grain, moody cinematographic depth, and 1970s analog nostalgia",
      remixPrompt: `${clean}, captured on authentic vintage 35mm Panavision camera, subtle analog film grain, deep shadows, cinematic anamorphic lens flare, moody color grading, natural atmospheric fog.`,
    },
  ];
}

export const PromptControls: React.FC<PromptControlsProps> = ({
  prompt,
  onChangePrompt,
  negativePrompt,
  onChangeNegativePrompt,
  selectedPreset,
  onSelectPreset,
  onEnhancePrompt,
  isEnhancing,
  onGenerate,
  isGenerating,
  hasSourceImage,
  engineMode,
  intensity,
  onChangeIntensity,
  imageDescription,
  onToast,
}) => {
  const [showNegative, setShowNegative] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>("All");

  // Remix state
  const [isRemixing, setIsRemixing] = useState(false);
  const [remixVariations, setRemixVariations] = useState<PromptRemixVariation[]>([]);
  const [showRemixPanel, setShowRemixPanel] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [appliedId, setAppliedId] = useState<string | null>(null);

  const categories = ["All", "Digital", "Artistic", "Realistic", "Fantasy", "Retro"];
  const filteredPresets =
    categoryFilter === "All"
      ? STYLE_PRESETS
      : STYLE_PRESETS.filter((p) => p.category === categoryFilter || p.id === "none");

  // Handle Remix Prompt generation via Gemini API
  const handleRemixPrompt = async () => {
    if (!prompt.trim() || isRemixing) return;
    setIsRemixing(true);
    setShowRemixPanel(true);
    try {
      const res = await fetch("/api/remix-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt.trim(),
          style: selectedPreset.name,
          imageDescription: imageDescription || "",
        }),
      });

      const data = await res.json();
      if (data.success && Array.isArray(data.variations) && data.variations.length > 0) {
        setRemixVariations(data.variations);
        onToast?.("success", "Gemini generated 3 creative prompt variations!");
      } else {
        const fallback = generateFallbackRemixes(prompt.trim(), selectedPreset.name);
        setRemixVariations(fallback);
        onToast?.("info", "Generated 3 creative prompt remixes!");
      }
    } catch (err) {
      console.warn("Remix API call, fallback used", err);
      const fallback = generateFallbackRemixes(prompt.trim(), selectedPreset.name);
      setRemixVariations(fallback);
      onToast?.("info", "Generated 3 creative prompt remixes!");
    } finally {
      setIsRemixing(false);
    }
  };

  const handleApplyRemix = (variation: PromptRemixVariation) => {
    onChangePrompt(variation.remixPrompt);
    setAppliedId(variation.id);
    setTimeout(() => setAppliedId(null), 2000);
    onToast?.("success", `Applied "${variation.styleTitle}" variation!`);
  };

  const handleCopyRemix = (variation: PromptRemixVariation, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(variation.remixPrompt);
    setCopiedId(variation.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-col gap-4 shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
            <Palette className="w-4 h-4" />
          </div>
          <h2 className="text-sm font-semibold text-slate-200">
            3. Transformation Style & Prompt
          </h2>
        </div>

        {/* AI Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Remix Prompt Button */}
          <button
            id="remix-prompt-btn"
            type="button"
            onClick={handleRemixPrompt}
            disabled={isRemixing || !prompt.trim()}
            title={
              prompt.trim()
                ? "Generate 3 creative stylistic variations with Gemini API"
                : "Enter a prompt first to generate remixes"
            }
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500/15 to-blue-500/15 hover:from-cyan-500/25 hover:to-blue-500/25 text-cyan-300 text-xs font-semibold border border-cyan-500/35 hover:border-cyan-400/50 shadow-sm transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer active:scale-95"
          >
            {isRemixing ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-300" />
            ) : (
              <Shuffle className="w-3.5 h-3.5 text-cyan-400" />
            )}
            <span>Remix Prompt</span>
            <span className="hidden sm:inline text-[10px] bg-cyan-500/20 px-1 rounded text-cyan-200 font-mono">
              3 Variations
            </span>
          </button>

          {/* Magic Enhance Button */}
          <button
            id="enhance-prompt-btn"
            type="button"
            onClick={onEnhancePrompt}
            disabled={isEnhancing || !prompt.trim()}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 text-xs font-medium border border-indigo-500/30 transition disabled:opacity-40 cursor-pointer"
          >
            {isEnhancing ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Wand2 className="w-3.5 h-3.5 text-indigo-400" />
            )}
            <span>Magic Enhance</span>
          </button>
        </div>
      </div>

      {/* Style Presets Bar */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-300">Style Aesthetic</span>
          <div className="flex gap-1">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={`text-[10px] px-2 py-0.5 rounded-md transition cursor-pointer ${
                  categoryFilter === cat
                    ? "bg-slate-700 text-white font-semibold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {filteredPresets.map((preset) => {
            const isSelected = selectedPreset.id === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                id={`preset-${preset.id}`}
                onClick={() => onSelectPreset(preset)}
                className={`text-left p-2.5 rounded-xl border transition flex flex-col gap-1.5 cursor-pointer relative overflow-hidden ${
                  isSelected
                    ? "border-cyan-500 bg-cyan-950/30 ring-1 ring-cyan-500/50 shadow-md shadow-cyan-500/10"
                    : "border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-800/40"
                }`}
              >
                <div
                  className={`w-full h-1.5 rounded-full bg-gradient-to-r ${preset.previewGradient}`}
                />
                <span className="text-xs font-semibold text-slate-200 truncate">
                  {preset.name}
                </span>
                <span className="text-[10px] text-slate-400 line-clamp-1">
                  {preset.category}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Prompt Textarea */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor="prompt-input" className="text-xs font-medium text-slate-300">
            Transformation Instructions / Prompt
          </label>
          <div className="flex items-center gap-2">
            {prompt.trim() && !showRemixPanel && (
              <button
                type="button"
                onClick={handleRemixPrompt}
                disabled={isRemixing}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition cursor-pointer"
              >
                <Shuffle className="w-3 h-3" />
                <span>Remix into 3 Styles</span>
              </button>
            )}
            <span className="text-[11px] text-slate-500 font-mono">
              {prompt.length} chars
            </span>
          </div>
        </div>
        <textarea
          id="prompt-input"
          value={prompt}
          onChange={(e) => onChangePrompt(e.target.value)}
          placeholder="Describe how to transform the reference image (e.g. Turn into a futuristic cyberpunk warrior with neon holographic armor in rain)..."
          rows={3}
          className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-xl p-3 text-xs text-slate-100 placeholder:text-slate-600 outline-none resize-y font-normal transition"
        />
      </div>

      {/* Creative Stylistic Variations (Remixes) Container */}
      {showRemixPanel && (
        <div
          id="remix-variations-panel"
          className="rounded-xl border border-cyan-500/30 bg-gradient-to-b from-cyan-950/20 to-slate-950/60 p-3.5 flex flex-col gap-3 shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-md bg-cyan-500/20 text-cyan-300">
                <Shuffle className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-bold text-cyan-200">
                Gemini Prompt Remixes
              </span>
              <span className="text-[10px] bg-cyan-500/10 text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-500/30 font-medium">
                3 Stylistic Variations
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                id="reroll-remix-btn"
                onClick={handleRemixPrompt}
                disabled={isRemixing || !prompt.trim()}
                className="flex items-center gap-1 text-[11px] px-2 py-1 rounded-md text-cyan-300 hover:text-cyan-100 bg-cyan-500/10 hover:bg-cyan-500/20 transition cursor-pointer disabled:opacity-40"
                title="Generate 3 new variations with Gemini AI"
              >
                {isRemixing ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <RotateCcw className="w-3 h-3" />
                )}
                <span>Re-roll</span>
              </button>
              <button
                type="button"
                onClick={() => setShowRemixPanel(false)}
                className="p-1 text-slate-400 hover:text-slate-200 rounded-md hover:bg-slate-800 transition cursor-pointer"
                title="Dismiss variations"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {isRemixing ? (
            <div className="py-8 flex flex-col items-center justify-center gap-2 text-cyan-300">
              <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
              <p className="text-xs font-medium">
                Calling Google Gemini API to generate 3 creative prompt variations...
              </p>
              <p className="text-[11px] text-slate-400">
                Synthesizing cinematic lighting, artistic medium, and stylistic aesthetics
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
              {remixVariations.map((variation, idx) => {
                const isActive = prompt.trim() === variation.remixPrompt.trim();
                const isJustApplied = appliedId === variation.id;
                const isJustCopied = copiedId === variation.id;

                const badgeBg =
                  idx === 0
                    ? "bg-cyan-500/15 text-cyan-300 border-cyan-500/30"
                    : idx === 1
                    ? "bg-purple-500/15 text-purple-300 border-purple-500/30"
                    : "bg-amber-500/15 text-amber-300 border-amber-500/30";

                return (
                  <div
                    key={variation.id}
                    id={`remix-card-${variation.id}`}
                    className={`rounded-xl p-3 border transition flex flex-col justify-between gap-2.5 text-left relative ${
                      isActive
                        ? "border-cyan-400 bg-cyan-950/40 ring-1 ring-cyan-400/40"
                        : "border-slate-800 bg-slate-900/80 hover:border-slate-700 hover:bg-slate-850"
                    }`}
                  >
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between gap-1">
                        <span
                          className={`text-[9px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded border ${badgeBg}`}
                        >
                          {variation.badge || `Variation ${idx + 1}`}
                        </span>
                        {isActive && (
                          <span className="text-[9px] font-semibold bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/30">
                            Active Prompt
                          </span>
                        )}
                      </div>

                      <h4 className="text-xs font-bold text-slate-100 flex items-center gap-1">
                        {variation.styleTitle}
                      </h4>
                      <p className="text-[10px] text-slate-400 line-clamp-1 italic">
                        {variation.tagline}
                      </p>

                      <div className="mt-1 p-2 rounded-lg bg-slate-950/80 border border-slate-800/80 text-[11px] text-slate-300 font-normal line-clamp-3 leading-relaxed">
                        {variation.remixPrompt}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 pt-1 border-t border-slate-800/60">
                      <button
                        type="button"
                        id={`apply-remix-${variation.id}`}
                        onClick={() => handleApplyRemix(variation)}
                        className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition cursor-pointer ${
                          isActive
                            ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                            : "bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold active:scale-95"
                        }`}
                      >
                        {isJustApplied ? (
                          <>
                            <Check className="w-3 h-3 text-slate-950" />
                            <span>Applied!</span>
                          </>
                        ) : isActive ? (
                          <>
                            <Check className="w-3 h-3 text-cyan-300" />
                            <span>Current Prompt</span>
                          </>
                        ) : (
                          <>
                            <Layers className="w-3 h-3" />
                            <span>Use This Remix</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        id={`copy-remix-${variation.id}`}
                        onClick={(e) => handleCopyRemix(variation, e)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                        title="Copy prompt variation to clipboard"
                      >
                        {isJustCopied ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Intensity / Strength Slider (especially for Neural Styler or Creative Blend) */}
      <div className="flex flex-col gap-1.5 pt-1">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-slate-300">
            Transformation Strength / Creative Blend
          </span>
          <span className="font-mono text-cyan-400 font-semibold">
            {Math.round(intensity * 100)}%
          </span>
        </div>
        <input
          id="intensity-slider"
          type="range"
          min="0.2"
          max="1.0"
          step="0.05"
          value={intensity}
          onChange={(e) => onChangeIntensity(parseFloat(e.target.value))}
          className="w-full accent-cyan-400 bg-slate-800 rounded-lg cursor-pointer h-1.5"
        />
        <div className="flex justify-between text-[10px] text-slate-500">
          <span>Subtle Retouch</span>
          <span>Balanced Transformation</span>
          <span>Complete Overhaul</span>
        </div>
      </div>

      {/* Negative Prompt Toggle */}
      <div className="flex flex-col gap-2 pt-1 border-t border-slate-800/80">
        <button
          id="toggle-negative-prompt-btn"
          type="button"
          onClick={() => setShowNegative(!showNegative)}
          className="flex items-center justify-between text-xs text-slate-400 hover:text-slate-200 transition cursor-pointer"
        >
          <span className="flex items-center gap-1.5 font-medium">
            <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
            Negative Prompt (Elements to avoid)
          </span>
          {showNegative ? (
            <ChevronUp className="w-3.5 h-3.5" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" />
          )}
        </button>

        {showNegative && (
          <input
            id="negative-prompt-input"
            type="text"
            value={negativePrompt}
            onChange={(e) => onChangeNegativePrompt(e.target.value)}
            placeholder="e.g. blurry, low quality, artifacts, distorted face, bad anatomy, grainy"
            className="w-full bg-slate-950 border border-slate-800 focus:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder:text-slate-600 outline-none"
          />
        )}
      </div>

      {/* Primary Action Button */}
      <div className="pt-2">
        <button
          id="generate-btn"
          type="button"
          onClick={onGenerate}
          disabled={isGenerating || !hasSourceImage}
          className={`w-full py-3.5 px-6 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 transition shadow-lg cursor-pointer ${
            isGenerating || !hasSourceImage
              ? "bg-slate-800 text-slate-500 cursor-not-allowed shadow-none"
              : engineMode === "gemini"
              ? "bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 shadow-blue-500/25 active:scale-[0.99]"
              : "bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 shadow-emerald-500/25 active:scale-[0.99]"
          }`}
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>
                {engineMode === "gemini"
                  ? "Synthesizing with Google Gemini..."
                  : "Applying Neural Transformation..."}
              </span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 text-amber-300" />
              <span>
                {hasSourceImage
                  ? engineMode === "gemini"
                    ? "Generate Image-to-Image (Google Gemini)"
                    : "Transform Image (Instant Neural Engine)"
                  : "Upload Reference Image First"}
              </span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
