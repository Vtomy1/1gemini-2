import React from "react";
import { AlertCircle, Zap, RefreshCw, X, ShieldAlert, CheckCircle2 } from "lucide-react";

interface QuotaNoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUseNeuralFallback: () => void;
  onRetry: () => void;
  modelName: string;
}

export const QuotaNoticeModal: React.FC<QuotaNoticeModalProps> = ({
  isOpen,
  onClose,
  onUseNeuralFallback,
  onRetry,
  modelName,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-amber-500/40 rounded-2xl max-w-lg w-full p-6 flex flex-col gap-4 shadow-2xl">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2 text-amber-400">
            <AlertCircle className="w-5 h-5" />
            <h3 className="text-sm font-bold text-white">Google Gemini Image Quota Limit</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Google's image generation model (<span className="font-mono text-cyan-300">{modelName}</span>) reached its rate limit or requires a billing-enabled API key on your Google Cloud project.
        </p>

        <div className="bg-emerald-950/30 border border-emerald-800/60 rounded-xl p-3.5 flex flex-col gap-2">
          <div className="flex items-center gap-1.5 text-emerald-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold">Recommended: Instant Neural Engine (Free Unlimited)</span>
          </div>
          <p className="text-xs text-slate-300">
            You can transform your image right now with our high-fidelity built-in Neural Styler — 100% free, unlimited, and zero delay.
          </p>
          <button
            id="quota-neural-fallback-btn"
            onClick={() => {
              onClose();
              onUseNeuralFallback();
            }}
            className="mt-1 w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition shadow-md shadow-emerald-600/30 cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Apply Instant Neural Transformation</span>
          </button>
        </div>

        <div className="flex items-center justify-between gap-3 pt-2">
          <button
            id="quota-retry-btn"
            onClick={() => {
              onClose();
              onRetry();
            }}
            className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition cursor-pointer flex items-center justify-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Gemini Call</span>
          </button>
          <button
            onClick={onClose}
            className="py-2 px-4 rounded-xl text-slate-400 hover:text-slate-200 text-xs transition cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};
