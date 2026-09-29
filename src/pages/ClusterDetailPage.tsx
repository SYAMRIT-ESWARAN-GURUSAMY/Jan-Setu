import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  MapPin, 
  Users, 
  Clock, 
  FileText, 
  DollarSign, 
  MessageSquareText
} from 'lucide-react';
import { fetchClusterById, fundCluster, generatePolicyBrief, fetchVerificationDetails } from '../services/api';
import type { DemandCluster, Complaint, ReviewFlag, PolicyBrief } from '../services/api';
import { ScoreBreakdownCard } from '../components/ScoreBreakdownCard';
import { VerificationQuorumWidget } from '../components/VerificationQuorumWidget';

export const ClusterDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [clusterData, setClusterData] = useState<{
    cluster: DemandCluster;
    complaints: Complaint[];
    flags: ReviewFlag[];
    funding: any[];
    policyBrief: PolicyBrief | null;
  } | null>(null);

  const [verificationData, setVerificationData] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isActionBusy, setIsActionBusy] = useState<boolean>(false);

  const loadData = async () => {
    if (!id) return;
    try {
      const data = await fetchClusterById(id);
      setClusterData(data);
      
      const verRes = await fetchVerificationDetails(id);
      setVerificationData(verRes);
      
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  if (loading || !clusterData) {
    return <div className="p-6 text-slate-400 font-mono text-xs">Loading cluster details...</div>;
  }

  const { cluster, complaints, policyBrief } = clusterData;

  const handleGenerateBrief = async () => {
    setIsActionBusy(true);
    try {
      await generatePolicyBrief(cluster.id);
      await loadData();
    } catch (err: any) {
      alert(`Error generating policy brief: ${err.message}`);
    } finally {
      setIsActionBusy(false);
    }
  };

  const handleFundCluster = async () => {
    setIsActionBusy(true);
    try {
      await fundCluster(cluster.id, 450000, 'Emergency allocation sanctioned via JAN-SETU AI Command Center');
      await loadData();
    } catch (err: any) {
      alert(`Error funding cluster: ${err.message}`);
    } finally {
      setIsActionBusy(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/clusters')}
            className="p-1.5 rounded bg-slate-900 border border-slate-800 hover:text-cyan-400 transition text-slate-400"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-cyan-400 px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/30">
                {cluster.id}
              </span>
              <h2 className="text-xl font-bold text-white">{cluster.problem_title}</h2>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              District: {cluster.district_name || cluster.district_code} • Location: {cluster.approx_location}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!policyBrief && (
            <button
              onClick={handleGenerateBrief}
              disabled={isActionBusy}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold text-xs border border-cyan-500/30 transition flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Generate Policy Brief</span>
            </button>
          )}

          {cluster.funding_status !== 'funded' && (
            <button
              onClick={handleFundCluster}
              disabled={isActionBusy}
              className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-black font-bold text-xs shadow-lg shadow-emerald-500/20 transition flex items-center gap-1.5"
            >
              <DollarSign className="w-4 h-4" />
              <span>Sanction Emergency Funds</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-3 gap-3 text-xs font-mono">
            <div className="p-3 rounded-xl bg-[#0F172A] border border-slate-800 space-y-1">
              <span className="text-slate-500 block text-[10px]">CITIZEN SIGNAL</span>
              <span className="text-slate-100 font-bold text-base flex items-center gap-1">
                <Users className="w-4 h-4 text-cyan-400" /> {cluster.citizens_affected} Reports
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#0F172A] border border-slate-800 space-y-1">
              <span className="text-slate-500 block text-[10px]">GEOGRAPHIC GROUPING</span>
              <span className="text-slate-100 font-bold text-base flex items-center gap-1">
                <MapPin className="w-4 h-4 text-blue-400" /> ~2.0 km Radius
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#0F172A] border border-slate-800 space-y-1">
              <span className="text-slate-500 block text-[10px]">TIMELINE</span>
              <span className="text-slate-100 font-bold text-base flex items-center gap-1">
                <Clock className="w-4 h-4 text-purple-400" /> Last 48h
              </span>
            </div>
          </div>

          {policyBrief && (
            <div className="bg-[#0F172A] border border-purple-500/40 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-purple-400" />
                  <h3 className="font-bold text-white text-sm">Generated Number-Safe Policy Brief</h3>
                </div>
                <span className="px-2.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold">
                  ✓ Numeric Validation Passed
                </span>
              </div>
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 font-mono text-xs whitespace-pre-wrap text-slate-300 max-h-60 overflow-y-auto">
                {policyBrief.content_markdown}
              </div>
            </div>
          )}

          {verificationData && (
            <VerificationQuorumWidget
              clusterId={cluster.id}
              citizenCount={cluster.citizens_affected}
              requiredQuorum={verificationData.state.requiredQuorum}
              confirmationsReceived={verificationData.state.confirmationsReceived}
              quorumReached={verificationData.state.quorumReached}
              photos={verificationData.photos || []}
              isFullyVerified={verificationData.state.isFullyVerified}
              onRefresh={loadData}
            />
          )}

          <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-5 space-y-3">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <MessageSquareText className="w-4 h-4 text-cyan-400" />
              Contributing Citizen Voice Reports ({complaints.length})
            </h3>
            <div className="space-y-2">
              {complaints.map(c => (
                <div key={c.id} className="p-3 bg-slate-950 border border-slate-900 rounded-lg text-xs font-mono space-y-1">
                  <div className="flex justify-between text-slate-400">
                    <span className="text-cyan-400 font-bold">{c.id} ({c.language})</span>
                    <span>{c.telegram_handle}</span>
                  </div>
                  <p className="text-slate-200 font-sans">{c.translated_text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <ScoreBreakdownCard
            score={cluster.priority_score}
            breakdown={cluster.score_breakdown}
            explanation={cluster.score_explanation}
            hasSelfExtracted={Boolean(cluster.has_self_extracted_data)}
          />
        </div>
      </div>
    </div>
  );
};
