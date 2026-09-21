import React, { useState } from "react";
import { Sparkles, Wand2, Palette, ShieldAlert, ArrowRight, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { STYLE_PRESETS } from "../data/presets";
import { StylePreset } from "../types";

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
}) => {
  const [showNegative, setShowNegative] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>("All");

  const categories = ["All", "Digital", "Artistic", "Realistic", "Fantasy", "Retro"];
  const filteredPresets = categoryFilter === "All"
    ? STYLE_PRESETS
    : STYLE_PRESETS.filter((p) => p.category === categoryFilter || p.id === "none");

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-col gap-4 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
            <Palette className="w-4 h-4" />
          </div>
          <h2 className="text-sm font-semibold text-slate-200">3. Transformation Style & Prompt</h2>
        </div>
        <button
          id="enhance-prompt-btn"
          onClick={onEnhancePrompt}
          disabled={isEnhancing || !prompt.trim()}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 text-xs font-medium border border-indigo-500/30 transition disabled:opacity-40 cursor-pointer"
        >
          {isEnhancing ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Wand2 className="w-3.5 h-3.5 text-indigo-400" />
          )}
          <span>Magic Enhance (Gemini AI)</span>
        </button>
      </div>

      {/* Style Presets Bar */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-300">Style Aesthetic</span>
          <div className="flex gap-1">
            {categories.map((cat) => (
              <button
                key={cat}
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
          <span className="text-[11px] text-slate-500 font-mono">
            {prompt.length} chars
          </span>
        </div>
        <textarea
          id="prompt-input"
          value={prompt}
          onChange={(e) => onChangePrompt(e.target.value)}
          placeholder="Describe how to transform the reference image (e.g. Turn into a futuristic cyberpunk warrior with neon holographic armor in rain)..."
          rows={3}
          className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl p-3 text-xs text-slate-100 placeholder:text-slate-600 outline-none resize-y font-normal transition"
        />
      </div>

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
                {engineMode === "gemini" ? "Synthesizing with Google Gemini..." : "Applying Neural Transformation..."}
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
