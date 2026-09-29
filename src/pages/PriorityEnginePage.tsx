import React, { useState, useEffect } from 'react';
import { Flame, Calculator } from 'lucide-react';
import { calculateSimulatedPriority, fetchDistricts } from '../services/api';
import type { District } from '../services/api';
import { ScoreBreakdownCard } from '../components/ScoreBreakdownCard';

export const PriorityEnginePage: React.FC = () => {
  const [districts, setDistricts] = useState<District[]>([]);
  const [selectedDistrictCode, setSelectedDistrictCode] = useState<string>('NGP');
  const [citizensCount, setCitizensCount] = useState<number>(47);
  const [urgencyVal, setUrgencyVal] = useState<number>(0.85);
  const [simResult, setSimResult] = useState<any | null>(null);

  useEffect(() => {
    fetchDistricts().then(setDistricts);
  }, []);

  useEffect(() => {
    calculateSimulatedPriority(citizensCount, urgencyVal, selectedDistrictCode).then(setSimResult);
  }, [citizensCount, urgencyVal, selectedDistrictCode]);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Flame className="w-5 h-5 text-amber-400" />
          Explainable & Equity-Aware Priority Engine
        </h2>
        <p className="text-xs text-slate-400 font-mono">
          Strictly deterministic formula combining reach-adjusted impact, deficit, investment gap, equity BPL, and urgency.
        </p>
      </div>

      <div className="bg-slate-950 p-5 rounded-xl border border-cyan-500/40 space-y-3 font-mono text-xs">
        <span className="text-cyan-400 font-bold block text-sm">AUTHORITATIVE PRIORITY FORMULA</span>
        <div className="p-3 bg-slate-900/90 rounded border border-slate-800 text-cyan-300 leading-relaxed overflow-x-auto">
          effective_citizens_affected = cluster.citizens_affected / max(capture_rate, 0.3) / district.population<br/>
          priority_score = 0.30 * norm(effective_citizens) + 0.25 * infra_deficit + 0.20 * (1 - norm(budget)) + 0.15 * bpl_pct + 0.10 * norm(urgency)
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs font-mono">
        <div className="p-4 rounded-xl bg-[#0F172A] border border-cyan-500/30 space-y-1">
          <span className="text-cyan-400 font-bold text-sm block">30%</span>
          <span className="font-semibold text-slate-200 block">Citizen Impact</span>
          <p className="text-[11px] text-slate-400 font-sans">Reach-adjusted effective impact with 0.3 floor</p>
        </div>

        <div className="p-4 rounded-xl bg-[#0F172A] border border-blue-500/30 space-y-1">
          <span className="text-blue-400 font-bold text-sm block">25%</span>
          <span className="font-semibold text-slate-200 block">Infra Deficit</span>
          <p className="text-[11px] text-slate-400 font-sans">Index of structural infrastructure deficit</p>
        </div>

        <div className="p-4 rounded-xl bg-[#0F172A] border border-indigo-500/30 space-y-1">
          <span className="text-indigo-400 font-bold text-sm block">20%</span>
          <span className="font-semibold text-slate-200 block">Investment Gap</span>
          <p className="text-[11px] text-slate-400 font-sans">Inverse of existing municipal budget</p>
        </div>

        <div className="p-4 rounded-xl bg-[#0F172A] border border-purple-500/30 space-y-1">
          <span className="text-purple-400 font-bold text-sm block">15%</span>
          <span className="font-semibold text-slate-200 block">Equity / BPL %</span>
          <p className="text-[11px] text-slate-400 font-sans">Proportion below poverty line</p>
        </div>

        <div className="p-4 rounded-xl bg-[#0F172A] border border-emerald-500/30 space-y-1">
          <span className="text-emerald-400 font-bold text-sm block">10%</span>
          <span className="font-semibold text-slate-200 block">Urgency</span>
          <p className="text-[11px] text-slate-400 font-sans">Urgency score from citizen signal</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
        <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-5 space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Calculator className="w-5 h-5 text-cyan-400" />
            <h3 className="font-bold text-white text-sm">Interactive Priority Simulator</h3>
          </div>

          <div className="space-y-4 text-xs font-mono">
            <div>
              <label className="text-slate-400 block mb-1">SELECT DISTRICT</label>
              <select
                value={selectedDistrictCode}
                onChange={e => setSelectedDistrictCode(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200"
              >
                {districts.map(d => (
                  <option key={d.code} value={d.code}>
                    {d.name} ({d.code}) — Deficit: {d.infra_deficit_score}, BPL: {Math.round(d.bpl_pct * 100)}%, Capture: {Math.round(d.estimated_reporting_capture_rate * 100)}%
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between">
                <label className="text-slate-400">CITIZENS AFFECTED (TELEGRAM SIGNAL)</label>
                <span className="text-cyan-400 font-bold">{citizensCount} citizens</span>
              </div>
              <input
                type="range"
                min={1}
                max={200}
                value={citizensCount}
                onChange={e => setCitizensCount(parseInt(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between">
                <label className="text-slate-400">URGENCY INDEX</label>
                <span className="text-emerald-400 font-bold">{Math.round(urgencyVal * 100)}%</span>
              </div>
              <input
                type="range"
                min={0.1}
                max={1.0}
                step={0.05}
                value={urgencyVal}
                onChange={e => setUrgencyVal(parseFloat(e.target.value))}
                className="w-full accent-emerald-400 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {simResult && simResult.scoreResult && (
          <ScoreBreakdownCard
            score={simResult.scoreResult.priority_score}
            breakdown={simResult.scoreResult}
            explanation={simResult.scoreResult.explanation}
            hasSelfExtracted={simResult.scoreResult.has_self_extracted_data}
            reachDisclosure={simResult.scoreResult.reach_disclosure}
          />
        )}
      </div>
    </div>
  );
};
