import React from "react";
import { History, Trash2, Download, Eye, Clock, Sparkles } from "lucide-react";
import { GenerationHistoryItem } from "../types";

interface HistoryDrawerProps {
  history: GenerationHistoryItem[];
  onSelectHistoryItem: (item: GenerationHistoryItem) => void;
  onClearHistory: () => void;
  onClose: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  history,
  onSelectHistoryItem,
  onClearHistory,
  onClose,
}) => {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-col gap-4 shadow-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
            <History className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-200">Transformation Gallery & History</h2>
            <p className="text-xs text-slate-400">{history.length} saved transformations</p>
          </div>
        </div>

        {history.length > 0 && (
          <button
            id="clear-all-history-btn"
            onClick={onClearHistory}
            className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 px-2.5 py-1.5 rounded-lg transition cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Gallery</span>
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="p-12 text-center flex flex-col items-center justify-center gap-3 border border-dashed border-slate-800 rounded-xl">
          <div className="w-12 h-12 rounded-full bg-slate-800/60 flex items-center justify-center text-slate-500">
            <Sparkles className="w-6 h-6 text-slate-600" />
          </div>
          <p className="text-sm text-slate-400">No transformations generated yet.</p>
          <p className="text-xs text-slate-500">
            Upload an image, pick a style or write a prompt, and click Generate!
          </p>
          <button
            id="back-to-studio-btn"
            onClick={onClose}
            className="mt-2 text-xs text-blue-400 hover:underline cursor-pointer"
          >
            Go back to Studio
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {history.map((item) => {
            const dateStr = new Date(item.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            });
            return (
              <div
                key={item.id}
                id={`history-card-${item.id}`}
                className="group relative bg-slate-950/70 border border-slate-800 hover:border-blue-500/60 rounded-xl overflow-hidden flex flex-col transition shadow-md"
              >
                {/* Thumbnails preview: original vs transformed */}
                <div className="relative h-44 grid grid-cols-2 gap-0.5 bg-black">
                  <div className="relative h-full overflow-hidden">
                    <img
                      src={item.originalImage}
                      alt="Source"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-1 left-1 bg-black/75 backdrop-blur-sm text-[9px] px-1.5 py-0.5 rounded text-slate-300">
                      Original
                    </span>
                  </div>
                  <div className="relative h-full overflow-hidden">
                    <img
                      src={item.generatedImage}
                      alt="Transformed"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-1 right-1 bg-blue-900/80 backdrop-blur-sm text-[9px] px-1.5 py-0.5 rounded text-blue-200">
                      Result
                    </span>
                  </div>

                  {/* Overlay click to view button */}
                  <button
                    onClick={() => {
                      onSelectHistoryItem(item);
                      onClose();
                    }}
                    className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2 text-white text-xs font-semibold cursor-pointer"
                  >
                    <div className="bg-blue-600 px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5" />
                      <span>Inspect in Studio</span>
                    </div>
                  </button>
                </div>

                {/* Details */}
                <div className="p-3 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-slate-800 text-cyan-300 border border-slate-700/60 truncate max-w-[140px]">
                      {item.model}
                    </span>
                    <span className="text-[10px] text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {dateStr}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-2 italic">
                    "{item.prompt}"
                  </p>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-800/60">
                    <span className="text-[10px] text-slate-500">
                      {item.stylePreset || "Natural"} • {item.aspectRatio}
                    </span>
                    <a
                      href={item.generatedImage}
                      download={`gemini-img2img-${item.id}.png`}
                      className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition"
                      title="Download image"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
