import React from "react";
import { X, Sparkles, Cpu, CheckCircle2, ShieldCheck, Zap, Info } from "lucide-react";
import { GeminiModelInfo } from "../types";

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  models: GeminiModelInfo[];
}

export const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose, models }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 flex flex-col gap-5 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">
                Google Gemini Models & Quota Guide
              </h3>
              <p className="text-xs text-slate-400">
                Understanding image generation models, vision analysis, and free tiers
              </p>
            </div>
          </div>
          <button
            id="close-info-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Gemini Models Breakdown */}
        <div className="flex flex-col gap-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Cpu className="w-4 h-4 text-cyan-400" />
            Supported Google Gemini Models
          </h4>

          <div className="grid grid-cols-1 gap-2.5">
            {models.map((m) => (
              <div
                key={m.id}
                className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 flex flex-col gap-1.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-200">{m.name}</span>
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                      {m.id}
                    </span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-blue-950 text-blue-300 border border-blue-800">
                    {m.badge}
                  </span>
                </div>
                <p className="text-xs text-slate-400">{m.description}</p>
                <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-1">
                  <span>Aspect Ratios: 1:1, 4:3, 16:9, etc.</span>
                  {m.supportsResolution && <span>• Resolutions: 512px, 1K, 2K, 4K</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Free Unlimited Neural Engine Explanation */}
        <div className="bg-emerald-950/20 border border-emerald-800/40 rounded-xl p-4 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-emerald-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider">
              Free Unlimited Instant Neural Engine
            </h4>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Google's direct image generation models (Nano Banana series) require a billing-enabled Google AI project key. To give you a completely unconstrained, 100% free and unlimited image-to-image experience, this app includes a dual-engine architecture:
          </p>
          <ul className="text-xs text-slate-300 list-disc list-inside space-y-1 ml-1">
            <li>
              <strong className="text-white">Gemini 3.8 Flash Vision (Free):</strong> Inspects your uploaded image, analyzes colors, lighting, art style, and drafts 6 professional transformation prompts.
            </li>
            <li>
              <strong className="text-white">Neural Generative Styler (Free Unlimited):</strong> Instant, real-time client-side transformations with zero quota limits or delay.
            </li>
            <li>
              <strong className="text-white">Gemini Image Generation:</strong> Direct cloud AI image synthesis using Gemini 3.1 Flash Image, Lite, and Pro.
            </li>
          </ul>
        </div>

        {/* Prompt tips */}
        <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-3.5 flex flex-col gap-1.5 text-xs text-slate-400">
          <span className="font-semibold text-slate-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            Pro-Tips for Image-to-Image Transformations:
          </span>
          <p>
            1. Use the <strong className="text-slate-200">Magic Enhance</strong> button to add professional lighting, camera, and render descriptors.
          </p>
          <p>
            2. Chain results: Click <strong className="text-slate-200">Chain As Next Input</strong> on any generated output to apply successive layers of artistic styling.
          </p>
          <p>
            3. Use the <strong className="text-slate-200">Split Compare</strong> slider to inspect subtle texture and detail changes side-by-side.
          </p>
        </div>

        <button
          id="close-info-modal-footer-btn"
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition cursor-pointer"
        >
          Got it, return to Studio
        </button>
      </div>
    </div>
  );
};
