import React from 'react';
import { X, Database } from 'lucide-react';
import type { District } from '../services/api';

interface ProvenanceModalProps {
  district: District | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ProvenanceModal: React.FC<ProvenanceModalProps> = ({ district, isOpen, onClose }) => {
  if (!isOpen || !district) return null;

  const indicators = [
    {
      name: 'District Population',
      val: district.population?.toLocaleString('en-IN'),
      source: district.population_source,
      asOf: district.population_as_of,
      status: district.population_confidence
    },
    {
      name: 'Below Poverty Line (BPL %)',
      val: `${Math.round((district.bpl_pct || 0) * 100)}%`,
      source: district.bpl_pct_source,
      asOf: district.bpl_pct_as_of,
      status: district.bpl_pct_confidence
    },
    {
      name: 'Infrastructure Deficit Index',
      val: district.infra_deficit_score?.toFixed(2),
      source: district.infra_deficit_source,
      asOf: district.infra_deficit_as_of,
      status: district.infra_deficit_confidence
    },
    {
      name: 'Existing Budget Allocation',
      val: `₹${district.existing_budget_allocation?.toLocaleString('en-IN')}`,
      source: district.budget_source,
      asOf: district.budget_as_of,
      status: district.budget_confidence
    },
    {
      name: 'Estimated Reporting Capture Rate',
      val: `${Math.round((district.estimated_reporting_capture_rate || 0) * 100)}%`,
      source: district.capture_rate_source,
      asOf: '2024-01-01',
      status: 'estimated'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0F172A] border border-cyan-500/40 rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-cyan-400" />
            <h3 className="font-bold text-white text-base">Data Provenance & Audit Log</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="text-xs text-slate-300 font-mono">
          District: <span className="text-cyan-400 font-bold">{district.name} ({district.code})</span>
        </div>

        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
          {indicators.map((ind, i) => (
            <div key={i} className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-1">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="font-semibold text-slate-200">{ind.name}</span>
                <span className="text-cyan-300 font-bold">{ind.val}</span>
              </div>
              <div className="text-[11px] text-slate-400">Source: {ind.source}</div>
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-1 border-t border-slate-900">
                <span>As of: {ind.asOf}</span>
                <span className={`px-2 py-0.5 rounded ${
                  ind.status === 'verified'
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                    : ind.status === 'self_extracted'
                    ? 'bg-amber-950 text-amber-300 border border-amber-500/30 font-bold'
                    : 'bg-slate-900 text-slate-400 border border-slate-700'
                }`}>
                  STATUS: {ind.status?.toUpperCase()}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="text-[11px] text-slate-500 font-mono text-center pt-2">
          No live unverified government API connectivity claimed. Seeded provenance records.
        </div>
      </div>
    </div>
  );
};
