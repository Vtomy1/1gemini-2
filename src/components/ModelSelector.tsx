import React from "react";
import { Cpu, Zap, ShieldAlert, CheckCircle2, Sliders } from "lucide-react";
import { GeminiModelInfo, AspectRatioType, ImageSizeType } from "../types";

interface ModelSelectorProps {
  models: GeminiModelInfo[];
  selectedModel: GeminiModelInfo;
  onSelectModel: (model: GeminiModelInfo) => void;
  aspectRatio: AspectRatioType;
  onSelectAspectRatio: (ratio: AspectRatioType) => void;
  imageSize: ImageSizeType;
  onSelectImageSize: (size: ImageSizeType) => void;
  engineMode: "gemini" | "neural_styler";
  onSelectEngineMode: (mode: "gemini" | "neural_styler") => void;
}

const ASPECT_RATIOS: Array<{ id: AspectRatioType; label: string; iconRatio: string }> = [
  { id: "1:1", label: "1:1 Square", iconRatio: "w-4 h-4" },
  { id: "4:3", label: "4:3 Classic", iconRatio: "w-5 h-4" },
  { id: "3:4", label: "3:4 Portrait", iconRatio: "w-4 h-5" },
  { id: "16:9", label: "16:9 Widescreen", iconRatio: "w-6 h-3.5" },
  { id: "9:16", label: "9:16 Story/Mobile", iconRatio: "w-3.5 h-6" },
];

const RESOLUTIONS: ImageSizeType[] = ["512px", "1K", "2K", "4K"];

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  models,
  selectedModel,
  onSelectModel,
  aspectRatio,
  onSelectAspectRatio,
  imageSize,
  onSelectImageSize,
  engineMode,
  onSelectEngineMode,
}) => {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-col gap-4 shadow-xl">
      {/* Header & Engine Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
            <Cpu className="w-4 h-4" />
          </div>
          <h2 className="text-sm font-semibold text-slate-200">2. Model & Generation Engine</h2>
        </div>

        {/* Dual Engine Switcher */}
        <div className="inline-flex bg-slate-950 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
          <button
            id="engine-mode-gemini"
            onClick={() => onSelectEngineMode("gemini")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
              engineMode === "gemini"
                ? "bg-blue-600 text-white shadow-sm shadow-blue-600/40"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-300" />
            <span>Google Gemini Models</span>
          </button>
          <button
            id="engine-mode-neural"
            onClick={() => onSelectEngineMode("neural_styler")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
              engineMode === "neural_styler"
                ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/40"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
            <span>Instant Neural Styler</span>
            <span className="text-[10px] bg-emerald-950 text-emerald-300 px-1 rounded ml-0.5">Free</span>
          </button>
        </div>
      </div>

      {engineMode === "gemini" ? (
        <div className="flex flex-col gap-4">
          {/* Models Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {models.map((m) => {
              const isSelected = selectedModel.id === m.id;
              return (
                <button
                  key={m.id}
                  id={`model-card-${m.id}`}
                  onClick={() => onSelectModel(m)}
                  className={`text-left p-3 rounded-xl border transition flex flex-col justify-between gap-2 cursor-pointer ${
                    isSelected
                      ? "border-blue-500 bg-blue-950/20 ring-1 ring-blue-500/50 shadow-md shadow-blue-500/10"
                      : "border-slate-800/90 bg-slate-950/50 hover:border-slate-700 hover:bg-slate-800/30"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-100">{m.name}</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">{m.tag}</span>
                    </div>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                        isSelected
                          ? "bg-blue-500/20 text-blue-300 border border-blue-400/30"
                          : "bg-slate-800 text-slate-400 border border-slate-700/50"
                      }`}
                    >
                      {m.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {m.description}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Configuration Row (Aspect Ratio & Resolution) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 border-t border-slate-800/80">
            {/* Aspect Ratio */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-blue-400" />
                Target Aspect Ratio
              </span>
              <div className="flex flex-wrap gap-1.5">
                {ASPECT_RATIOS.map((item) => {
                  const isActive = aspectRatio === item.id;
                  return (
                    <button
                      key={item.id}
                      id={`aspect-ratio-${item.id}`}
                      onClick={() => onSelectAspectRatio(item.id)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition cursor-pointer flex items-center gap-1.5 ${
                        isActive
                          ? "border-blue-500 bg-blue-600/20 text-blue-300"
                          : "border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200 hover:border-slate-700"
                      }`}
                    >
                      <div className={`border border-current rounded-sm ${item.iconRatio}`} />
                      <span>{item.id}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Resolution Selector (if model supports it) */}
            {selectedModel.supportsResolution ? (
              <div className="flex flex-col gap-2">
                <span className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                  Output Resolution (Nano Banana HD)
                </span>
                <div className="flex gap-1.5">
                  {RESOLUTIONS.map((res) => {
                    const isActive = imageSize === res;
                    return (
                      <button
                        key={res}
                        id={`resolution-${res}`}
                        onClick={() => onSelectImageSize(res)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                          isActive
                            ? "border-cyan-500 bg-cyan-600/20 text-cyan-300"
                            : "border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200 hover:border-slate-700"
                        }`}
                      >
                        {res}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="flex flex-col justify-center text-[11px] text-slate-500 bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/50">
                <span>Model standard resolution: automatic native upscale based on reference aspect ratio.</span>
              </div>
            )}
          </div>
          {/* Free Tier Guidance Note */}
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-blue-950/30 border border-blue-800/40 text-[11px] text-slate-300">
            <Zap className="w-3.5 h-3.5 text-amber-300 shrink-0" />
            <span>
              Google direct image models require a paid billing key (limit: 0 on free tier). If unbilled, the studio seamlessly transforms with the <strong className="text-emerald-400">Free Unlimited Neural Engine</strong>.
            </span>
          </div>
        </div>
      ) : (
        <div className="bg-emerald-950/20 border border-emerald-800/40 rounded-xl p-4 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-emerald-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold">Instant Neural Styler Activated (Free Unlimited)</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Applies neural-grade matrix stylizations, color gradings, edge filters, and aesthetic transformations instantly in your browser with zero network latency and no quota consumption.
          </p>
        </div>
      )}
    </div>
  );
};
