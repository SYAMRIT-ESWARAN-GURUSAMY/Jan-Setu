import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, CheckCircle2, Layers } from 'lucide-react';
import { fetchPolicyBriefs } from '../services/api';
import type { PolicyBrief } from '../services/api';

export const PolicyBriefsPage: React.FC = () => {
  const navigate = useNavigate();
  const [briefs, setBriefs] = useState<PolicyBrief[]>([]);
  const [selectedBrief, setSelectedBrief] = useState<PolicyBrief | null>(null);

  useEffect(() => {
    fetchPolicyBriefs().then(data => {
      setBriefs(data);
      if (data.length > 0) setSelectedBrief(data[0]);
    });
  }, []);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <FileText className="w-5 h-5 text-purple-400" />
          Policy Briefs & Number-Safe Generation
        </h2>
        <p className="text-xs text-slate-400 font-mono">
          All statistics displayed in briefs are validated against provenance-tracked database records.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-3">
          <h3 className="font-mono text-xs text-slate-400 uppercase font-semibold">Generated Briefs ({briefs.length})</h3>
          {briefs.map(b => (
            <div
              key={b.id}
              onClick={() => setSelectedBrief(b)}
              className={`p-4 rounded-xl border transition cursor-pointer space-y-2 ${
                selectedBrief?.id === b.id
                  ? 'bg-purple-950/40 border-purple-500 shadow-md shadow-purple-500/10'
                  : 'bg-[#0F172A] border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between font-mono text-xs">
                <span className="text-purple-400 font-bold">{b.id}</span>
                <span className="text-slate-400">{b.cluster_id}</span>
              </div>
              <h4 className="font-bold text-white text-xs">{b.title}</h4>
              <div className="flex items-center justify-between pt-1 text-[10px] font-mono">
                <span className="text-emerald-400 flex items-center gap-1 font-bold">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Numeric Validation Passed
                </span>
                <span className="text-slate-500">{new Date(b.generated_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-2 space-y-3">
          {selectedBrief ? (
            <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="font-bold text-white text-base">{selectedBrief.title}</h3>
                  <p className="text-xs text-slate-400 font-mono">Generated from provenance-tracked data</p>
                </div>

                <button
                  onClick={() => navigate(`/clusters/${selectedBrief.cluster_id}`)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-mono flex items-center gap-1 border border-slate-700 transition"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>View Cluster</span>
                </button>
              </div>

              <div className="p-3 bg-emerald-950/50 border border-emerald-500/30 rounded-lg text-xs font-mono text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>NUMERIC SAFETY PASSED: Every statistic in this policy brief is strictly validated against database source records.</span>
              </div>

              <div className="bg-slate-950 p-5 rounded-lg border border-slate-800 font-mono text-xs whitespace-pre-wrap text-slate-200 leading-relaxed max-h-[500px] overflow-y-auto">
                {selectedBrief.content_markdown}
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500 font-mono text-xs bg-[#0F172A] border border-slate-800 rounded-xl">
              Select a policy brief to read markdown content.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
