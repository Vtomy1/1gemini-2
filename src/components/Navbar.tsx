import React from "react";
import { Sparkles, Cpu, Layers, Info, History } from "lucide-react";
import { GeminiModelInfo } from "../types";

interface NavbarProps {
  selectedModel: GeminiModelInfo;
  models: GeminiModelInfo[];
  onSelectModel: (model: GeminiModelInfo) => void;
  onOpenInfo: () => void;
  historyCount: number;
  onOpenHistory: () => void;
  activeTab: "editor" | "history";
  setActiveTab: (tab: "editor" | "history") => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  selectedModel,
  models,
  onSelectModel,
  onOpenInfo,
  historyCount,
  activeTab,
  setActiveTab,
}) => {
  return (
    <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-30 px-4 lg:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20 ring-1 ring-white/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white tracking-tight">
                Gemini Image-to-Image
              </h1>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                All Models
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Multi-model Google Gemini vision & transformation workbench
            </p>
          </div>
        </div>

        {/* Model Selector Bar */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="relative">
            <label htmlFor="model-select" className="sr-only">Select Gemini Model</label>
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 hover:border-slate-700 transition">
              <Cpu className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
              <select
                id="model-select"
                value={selectedModel.id}
                onChange={(e) => {
                  const m = models.find((item) => item.id === e.target.value);
                  if (m) onSelectModel(m);
                }}
                className="bg-transparent text-slate-200 outline-none cursor-pointer pr-1 font-medium text-xs"
              >
                {models.map((m) => (
                  <option key={m.id} value={m.id} className="bg-slate-900 text-slate-100">
                    {m.name} ({m.badge})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tab buttons */}
          <button
            id="nav-editor-tab"
            onClick={() => setActiveTab("editor")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              activeTab === "editor"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Studio</span>
          </button>

          <button
            id="nav-history-tab"
            onClick={() => setActiveTab("history")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition relative ${
              activeTab === "history"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span className="hidden md:inline">History</span>
            {historyCount > 0 && (
              <span className="bg-cyan-500 text-slate-950 font-bold text-[10px] px-1.5 py-0.2 rounded-full ml-0.5">
                {historyCount}
              </span>
            )}
          </button>

          {/* Model info guide modal trigger */}
          <button
            id="nav-info-btn"
            onClick={onOpenInfo}
            title="Model Capabilities & Quota Guide"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-slate-800 transition"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
