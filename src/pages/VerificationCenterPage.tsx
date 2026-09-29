import React, { useEffect, useState } from 'react';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { fetchClusters, fetchVerificationDetails } from '../services/api';
import type { DemandCluster } from '../services/api';
import { VerificationQuorumWidget } from '../components/VerificationQuorumWidget';

export const VerificationCenterPage: React.FC = () => {
  const [fundedClusters, setFundedClusters] = useState<DemandCluster[]>([]);
  const [selectedClusterId, setSelectedClusterId] = useState<string | null>(null);
  const [verDetails, setVerDetails] = useState<any | null>(null);

  const loadData = async () => {
    const all = await fetchClusters();
    const funded = all.filter(c => c.funding_status === 'funded');
    setFundedClusters(funded);

    const targetId = selectedClusterId || (funded.length > 0 ? funded[0].id : 'WTR-NGP-004');
    if (targetId) {
      setSelectedClusterId(targetId);
      const details = await fetchVerificationDetails(targetId);
      setVerDetails(details);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedClusterId]);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          Outcome Verification Center
        </h2>
        <p className="text-xs text-slate-400 font-mono">
          "We don't stop when a project is funded — citizens must confirm resolution."
        </p>
      </div>

      <div className="p-5 rounded-xl bg-gradient-to-r from-slate-900 via-emerald-950/40 to-slate-900 border border-emerald-500/30 space-y-3">
        <h3 className="text-xs font-mono uppercase tracking-wider text-emerald-400 text-center font-bold">
          CLOSED-LOOP CITIZEN ACTION TIMELINE
        </h3>
        <div className="flex flex-wrap items-center justify-between text-xs font-mono text-slate-300 gap-2 px-4 py-2 bg-slate-950 rounded-lg border border-slate-800">
          <span>Citizen Reports</span>
          <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
          <span>Cluster Created</span>
          <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
          <span>Priority Calculated</span>
          <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
          <span>Project Funded</span>
          <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
          <span>Telegram Quorum Reached</span>
          <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
          <span>Photo Human-Reviewed</span>
          <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500/40">VERIFIED OUTCOME</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-3">
          <h3 className="font-mono text-xs text-slate-400 uppercase font-semibold">Funded Projects ({fundedClusters.length})</h3>
          {fundedClusters.map(cl => (
            <div
              key={cl.id}
              onClick={() => setSelectedClusterId(cl.id)}
              className={`p-4 rounded-xl border transition cursor-pointer space-y-2 ${
                selectedClusterId === cl.id
                  ? 'bg-emerald-950/40 border-emerald-500 shadow-md shadow-emerald-500/10'
                  : 'bg-[#0F172A] border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between font-mono text-xs">
                <span className="text-cyan-400 font-bold">{cl.id}</span>
                <span className="text-emerald-400 font-bold">₹{cl.funded_amount?.toLocaleString('en-IN')}</span>
              </div>
              <h4 className="font-bold text-white text-xs line-clamp-1">{cl.problem_title}</h4>
              <div className="flex items-center justify-between text-[10px] font-mono">
                <span className="text-slate-400">{cl.citizens_affected} reporting citizens</span>
                <span className={`px-2 py-0.5 rounded ${
                  cl.verification_status === 'verified' ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30 font-bold' : 'bg-slate-900 text-slate-400'
                }`}>
                  {cl.verification_status.toUpperCase()}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-2">
          {verDetails && verDetails.cluster ? (
            <VerificationQuorumWidget
              clusterId={verDetails.cluster.id}
              citizenCount={verDetails.cluster.citizens_affected}
              requiredQuorum={verDetails.state.requiredQuorum}
              confirmationsReceived={verDetails.state.confirmationsReceived}
              quorumReached={verDetails.state.quorumReached}
              photos={verDetails.photos || []}
              isFullyVerified={verDetails.state.isFullyVerified}
              onRefresh={loadData}
            />
          ) : (
            <div className="p-12 text-center text-slate-500 font-mono text-xs bg-[#0F172A] border border-slate-800 rounded-xl">
              Select a funded project to view citizen verification quorum and photo review status.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
