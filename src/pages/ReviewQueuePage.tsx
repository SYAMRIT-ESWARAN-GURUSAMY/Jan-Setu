import React, { useEffect, useState } from 'react';
import { ShieldAlert, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { fetchReviewFlags, approveReviewFlag, dismissReviewFlag } from '../services/api';
import type { ReviewFlag } from '../services/api';

export const ReviewQueuePage: React.FC = () => {
  const [flags, setFlags] = useState<ReviewFlag[]>([]);
  const [activeTab, setActiveTab] = useState<string>('all');

  const loadFlags = async () => {
    const data = await fetchReviewFlags();
    setFlags(data);
  };

  useEffect(() => {
    loadFlags();
  }, []);

  const handleApprove = async (id: string) => {
    await approveReviewFlag(id);
    await loadFlags();
  };

  const handleDismiss = async (id: string) => {
    await dismissReviewFlag(id);
    await loadFlags();
  };

  const filtered = flags.filter(f => {
    if (activeTab === 'all') return true;
    if (activeTab === 'fraud') return f.flag_type === 'duplicate_text' || f.flag_type === 'velocity_flooding';
    if (activeTab === 'data_verification') return f.flag_type === 'data_verification';
    if (activeTab === 'photo_evidence') return f.flag_type === 'photo_evidence';
    return true;
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-red-400" />
          Trust & Safety Human Review Queue
        </h2>
        <p className="text-xs text-slate-400 font-mono">
          Uncertainty and fraud rules are routed to human review rather than silently penalizing or deleting tickets.
        </p>
      </div>

      <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/30 text-xs font-mono text-amber-300 flex items-start gap-2">
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold block text-amber-200">TRUST & SAFETY AUDIT DISCLAIMER</span>
          Current SQL rules detect obvious velocity flooding and repeated submissions. They do not claim protection against sophisticated adversaries using aged accounts and paraphrased text.
        </div>
      </div>

      <div className="flex gap-2 border-b border-slate-800 pb-3 font-mono text-xs">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-3 py-1.5 rounded-lg transition ${activeTab === 'all' ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/30 font-bold' : 'text-slate-400 hover:text-slate-200'}`}
        >
          All Flags ({flags.length})
        </button>
        <button
          onClick={() => setActiveTab('data_verification')}
          className={`px-3 py-1.5 rounded-lg transition ${activeTab === 'data_verification' ? 'bg-amber-950 text-amber-300 border border-amber-500/30 font-bold' : 'text-slate-400 hover:text-slate-200'}`}
        >
          Data Verification
        </button>
        <button
          onClick={() => setActiveTab('fraud')}
          className={`px-3 py-1.5 rounded-lg transition ${activeTab === 'fraud' ? 'bg-red-950 text-red-300 border border-red-500/30 font-bold' : 'text-slate-400 hover:text-slate-200'}`}
        >
          Fraud / Flooding Flags
        </button>
        <button
          onClick={() => setActiveTab('photo_evidence')}
          className={`px-3 py-1.5 rounded-lg transition ${activeTab === 'photo_evidence' ? 'bg-purple-950 text-purple-300 border border-purple-500/30 font-bold' : 'text-slate-400 hover:text-slate-200'}`}
        >
          Photo Evidence Review
        </button>
      </div>

      <div className="space-y-3">
        {filtered.map(f => (
          <div key={f.id} className="p-4 rounded-xl bg-[#0F172A] border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-mono text-xs">
                <span className="font-bold text-red-400">{f.id}</span>
                <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300">
                  Type: {f.flag_type.toUpperCase()}
                </span>
                {f.cluster_id && <span className="text-cyan-400">Cluster: {f.cluster_id}</span>}
              </div>

              <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                f.status === 'approved' ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30' :
                f.status === 'dismissed' ? 'bg-slate-900 text-slate-500' : 'bg-amber-950 text-amber-300 border border-amber-500/30'
              }`}>
                STATUS: {f.status.toUpperCase()}
              </span>
            </div>

            <p className="text-xs text-slate-200 font-mono bg-slate-950 p-3 rounded-lg border border-slate-900">
              {f.reason}
            </p>

            {f.status === 'pending' && (
              <div className="flex justify-end gap-2 pt-1 font-mono text-xs">
                <button
                  onClick={() => handleDismiss(f.id)}
                  className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition flex items-center gap-1"
                >
                  <XCircle className="w-3.5 h-3.5" /> Dismiss Flag
                </button>
                <button
                  onClick={() => handleApprove(f.id)}
                  className="px-3 py-1 rounded bg-emerald-950 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 font-bold transition flex items-center gap-1"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Approve & Clear Flag
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
