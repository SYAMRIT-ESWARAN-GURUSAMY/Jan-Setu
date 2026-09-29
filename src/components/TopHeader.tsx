import React from 'react';
import { Play, Shield, Sparkles, PlusCircle } from 'lucide-react';

interface TopHeaderProps {
  onRunDemo: () => void;
  onOpenIngestion: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({ onRunDemo, onOpenIngestion }) => {
  return (
    <header className="h-16 bg-[#0B0F17]/90 border-b border-slate-800 px-6 flex items-center justify-between sticky top-0 z-30 backdrop-blur-md">
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
            JAN-SETU AI Command Center
          </h1>
          <p className="text-xs text-slate-400 font-mono">District-Level Civic Intelligence Platform</p>
        </div>

        {/* Demo Mode Badge */}
        <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-xs font-mono text-cyan-300">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span>Demo Mode — AI integrations ready</span>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-3">
        {/* Admin Token Status Badge */}
        <div className="hidden lg:flex items-center gap-1.5 text-xs font-mono px-2.5 py-1 rounded bg-slate-900 border border-slate-700/60 text-slate-300">
          <Shield className="w-3.5 h-3.5 text-emerald-400" />
          <span>ADMIN_TOKEN: Active</span>
        </div>

        {/* Simulate Citizen Complaint Button */}
        <button
          onClick={onOpenIngestion}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition"
        >
          <PlusCircle className="w-4 h-4 text-cyan-400" />
          <span>Simulate Telegram Voice</span>
        </button>

        {/* ▶ RUN JAN-SETU DEMO Button */}
        <button
          onClick={onRunDemo}
          className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold text-xs shadow-lg shadow-cyan-500/20 transition transform active:scale-95"
        >
          <Play className="w-4 h-4 fill-black text-black" />
          <span>▶ RUN JAN-SETU DEMO</span>
        </button>
      </div>
    </header>
  );
};
