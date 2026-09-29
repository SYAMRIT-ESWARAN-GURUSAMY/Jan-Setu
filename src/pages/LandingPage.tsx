import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  Flame, 
  FileText, 
  CheckCircle2, 
  Mic, 
  Layers, 
  Radio,
  Sparkles
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-100 flex flex-col justify-between">
      <div className="max-w-6xl mx-auto px-6 pt-16 pb-12 w-full space-y-12">
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-mono">
            <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>DISTRICT-LEVEL CIVIC AI MVP • TELEGRAM • HINDI • TAMIL</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white leading-tight">
            JAN-SETU <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">AI</span>
          </h1>

          <p className="text-xl md:text-2xl font-medium text-cyan-300 font-sans">
            From Citizen Voice → Verified Action
          </p>

          <p className="text-slate-400 text-sm md:text-base leading-relaxed max-w-2xl mx-auto">
            An explainable civic intelligence platform that turns fragmented citizen voice reports into prioritized, equity-aware, and verifiable public action.
          </p>

          <div className="pt-4 flex items-center justify-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold text-sm shadow-xl shadow-cyan-500/20 transition transform hover:-translate-y-0.5 flex items-center gap-2"
            >
              <span>Open Command Center</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-[#0F172A] border border-slate-800 space-y-4">
          <h3 className="text-xs font-mono uppercase tracking-wider text-cyan-400 text-center">
            END-TO-END CIVIC AI WORKFLOW
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-2 text-center text-xs font-mono">
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
              <Mic className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
              <div className="font-bold text-slate-200">VOICE</div>
              <div className="text-[10px] text-slate-500">Telegram Audio</div>
            </div>
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
              <Sparkles className="w-5 h-5 text-blue-400 mx-auto mb-1" />
              <div className="font-bold text-slate-200">UNDERSTAND</div>
              <div className="text-[10px] text-slate-500">Whisper + Indic</div>
            </div>
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
              <Layers className="w-5 h-5 text-indigo-400 mx-auto mb-1" />
              <div className="font-bold text-slate-200">CLUSTER</div>
              <div className="text-[10px] text-slate-500">Demand Grouping</div>
            </div>
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
              <Flame className="w-5 h-5 text-amber-400 mx-auto mb-1" />
              <div className="font-bold text-slate-200">PRIORITIZE</div>
              <div className="text-[10px] text-slate-500">Equity Formula</div>
            </div>
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
              <FileText className="w-5 h-5 text-purple-400 mx-auto mb-1" />
              <div className="font-bold text-slate-200">FUND</div>
              <div className="text-[10px] text-slate-500">Number-Safe Brief</div>
            </div>
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
              <div className="font-bold text-slate-200">VERIFY</div>
              <div className="text-[10px] text-slate-500">Citizen Quorum</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-[#0F172A] border border-slate-800 space-y-3 hover:border-cyan-500/40 transition">
            <div className="w-10 h-10 rounded-xl bg-cyan-950 text-cyan-400 flex items-center justify-center font-bold font-mono">
              01
            </div>
            <h3 className="text-lg font-bold text-white">PRIORITIZE</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Find which problems deserve attention first using citizen impact, reach capture rate, infrastructure deficit, budget gap, and equity BPL %.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0F172A] border border-slate-800 space-y-3 hover:border-blue-500/40 transition">
            <div className="w-10 h-10 rounded-xl bg-blue-950 text-blue-400 flex items-center justify-center font-bold font-mono">
              02
            </div>
            <h3 className="text-lg font-bold text-white">FUND</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Generate transparent, auditable, number-safe policy briefs that bind emergency funding decisions to provenance-tracked data.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0F172A] border border-slate-800 space-y-3 hover:border-emerald-500/40 transition">
            <div className="w-10 h-10 rounded-xl bg-emerald-950 text-emerald-400 flex items-center justify-center font-bold font-mono">
              03
            </div>
            <h3 className="text-lg font-bold text-white">VERIFY</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Ask reporting citizens to confirm resolution through Telegram quorum math and human-reviewed photo evidence.
            </p>
          </div>
        </div>

        <div className="p-6 rounded-xl bg-slate-950 border border-slate-800/80 grid grid-cols-2 md:grid-cols-4 gap-4 text-center font-mono text-xs">
          <div>
            <span className="text-slate-500 block text-[10px]">CHANNELS</span>
            <span className="text-cyan-400 font-bold">Telegram Voice/Text</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">LANGUAGES</span>
            <span className="text-slate-200 font-bold">Hindi & Tamil</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">GRANULARITY</span>
            <span className="text-slate-200 font-bold">District-level</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">HUMAN REVIEW</span>
            <span className="text-emerald-400 font-bold">Uncertainty & Photos</span>
          </div>
        </div>
      </div>

      <footer className="border-t border-slate-800 py-6 text-center text-xs font-mono text-slate-500">
        JAN-SETU AI Prototype • Hackathon-Ready Civic Intelligence
      </footer>
    </div>
  );
};
