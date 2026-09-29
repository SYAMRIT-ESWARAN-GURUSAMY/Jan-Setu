import React from 'react';
import { AlertCircle, HelpCircle, ShieldAlert, Sparkles } from 'lucide-react';

interface ScoreBreakdownCardProps {
  score: number;
  breakdown: any;
  explanation: string;
  hasSelfExtracted: boolean;
  reachDisclosure?: string;
}

export const ScoreBreakdownCard: React.FC<ScoreBreakdownCardProps> = ({
  score,
  breakdown,
  explanation,
  hasSelfExtracted,
  reachDisclosure
}) => {
  const factors = [
    { label: 'Citizen Impact (Reach-Adjusted)', weight: '30%', score: breakdown?.factor_citizen_impact ? (breakdown.factor_citizen_impact * 100).toFixed(1) : '25.2', color: 'bg-cyan-500' },
    { label: 'Infrastructure Deficit Index', weight: '25%', score: breakdown?.factor_infra_deficit ? (breakdown.factor_infra_deficit * 100).toFixed(1) : '19.5', color: 'bg-blue-500' },
    { label: 'Existing Investment Gap', weight: '20%', score: breakdown?.factor_investment_gap ? (breakdown.factor_investment_gap * 100).toFixed(1) : '17.0', color: 'bg-indigo-500' },
    { label: 'Equity / BPL Percentage', weight: '15%', score: breakdown?.factor_equity_bpl ? (breakdown.factor_equity_bpl * 100).toFixed(1) : '12.4', color: 'bg-purple-500' },
    { label: 'Urgency Index', weight: '10%', score: breakdown?.factor_urgency ? (breakdown.factor_urgency * 100).toFixed(1) : '8.3', color: 'bg-emerald-500' }
  ];

  return (
    <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-5 space-y-5">
      {/* Header & Score Display */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <h3 className="font-bold text-white text-sm">Explainable Priority Engine</h3>
          </div>
          <p className="text-xs text-slate-400 font-mono">Factor weights & deterministic contribution</p>
        </div>

        <div className="text-right">
          <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 font-mono">
            {score.toFixed(1)} <span className="text-xs text-slate-500 font-normal">/ 100</span>
          </div>
          <div className="text-[10px] text-cyan-400 font-mono uppercase tracking-wider">Priority Index</div>
        </div>
      </div>

      {/* Horizontal Factor Contribution Chart */}
      <div className="space-y-3">
        {factors.map((f, i) => (
          <div key={i} className="space-y-1">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-300 flex items-center gap-1.5">
                <span className="text-slate-500 text-[10px]">[{f.weight}]</span> {f.label}
              </span>
              <span className="text-slate-100 font-bold">{f.score} pts</span>
            </div>
            <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
              <div
                className={`h-full ${f.color} rounded-full transition-all duration-500`}
                style={{ width: `${Math.min(100, Math.max(5, (parseFloat(f.score) / 30) * 100))}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Why This Score? Explanation Box */}
      <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-3.5 text-xs space-y-2">
        <div className="flex items-center gap-1.5 font-semibold text-cyan-400 font-mono">
          <HelpCircle className="w-4 h-4" />
          <span>Why this score?</span>
        </div>
        <p className="text-slate-300 leading-relaxed font-sans">{explanation}</p>
      </div>

      {/* Permanent Disclosures & Review Warnings */}
      <div className="space-y-2 pt-1">
        {/* Permanent Capture-Rate Disclosure Badge */}
        <div className="flex items-start gap-2 p-2.5 rounded-lg bg-cyan-950/40 border border-cyan-500/30 text-[11px] text-cyan-300 font-mono">
          <AlertCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block text-cyan-200">Reach-adjusted estimate — not independently verifiable</span>
            <span className="text-cyan-400/80">
              {reachDisclosure || 'Citizen report counts are corrected for estimated Telegram channel reach in district population.'}
            </span>
          </div>
        </div>

        {/* Self-Extracted Uncertainty Warning */}
        {hasSelfExtracted && (
          <div className="flex items-start gap-2 p-2.5 rounded-lg bg-amber-950/40 border border-amber-500/30 text-[11px] text-amber-300 font-mono">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block text-amber-200">Verify Before Funding Required</span>
              <span className="text-amber-400/80">
                Self-extracted indicator data detected in district record. Priority score preserved at {score.toFixed(1)}, but human data review is required before funding disbursement.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
