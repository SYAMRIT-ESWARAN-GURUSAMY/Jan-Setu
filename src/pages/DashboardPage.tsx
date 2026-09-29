import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MessageSquareText, 
  Layers, 
  Flame, 
  CheckCircle2, 
  ShieldAlert, 
  Play, 
  ArrowRight,
  Radio,
  ExternalLink
} from 'lucide-react';
import { fetchClusters, fetchDistricts, fetchReviewFlags, fetchComplaints } from '../services/api';
import type { DemandCluster, District } from '../services/api';
import { DistrictMap } from '../components/DistrictMap';

interface DashboardPageProps {
  onRunDemo: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onRunDemo }) => {
  const navigate = useNavigate();
  const [clusters, setClusters] = useState<DemandCluster[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [flagsCount, setFlagsCount] = useState<number>(5);
  const [complaintsCount, setComplaintsCount] = useState<number>(128);

  const loadData = async () => {
    try {
      const [cls, dists, flgs, cmps] = await Promise.all([
        fetchClusters(),
        fetchDistricts(),
        fetchReviewFlags(),
        fetchComplaints()
      ]);
      setClusters(cls);
      setDistricts(dists);
      setFlagsCount(flgs.filter(f => f.status === 'pending').length || 5);
      setComplaintsCount(cmps.length || 128);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const highPriorityClusters = clusters.filter(c => c.priority_score >= 70);
  const awaitingVerification = clusters.filter(c => c.funding_status === 'funded' && c.verification_status !== 'verified');
  const verifiedClusters = clusters.filter(c => c.verification_status === 'verified');

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="p-5 rounded-2xl bg-gradient-to-r from-cyan-950/80 via-slate-900 to-blue-950/80 border border-cyan-500/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-cyan-400 animate-pulse" />
            <h2 className="text-lg font-bold text-white tracking-wide">
              JAN-SETU AI Command Dashboard
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-400">
              Demo dataset
            </span>
          </div>
          <p className="text-xs text-slate-300 font-sans">
            District-level explainable prioritization, demand clustering, and citizen quorum verification.
          </p>
        </div>

        <button
          onClick={onRunDemo}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold text-xs shadow-lg shadow-cyan-500/20 transition transform active:scale-95 flex items-center gap-2 shrink-0"
        >
          <Play className="w-4 h-4 fill-black" />
          <span>▶ RUN JAN-SETU DEMO</span>
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded-xl bg-[#0F172A] border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>Complaints</span>
            <MessageSquareText className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">{complaintsCount}</div>
          <p className="text-[10px] text-slate-500 font-mono">Telegram Reports</p>
        </div>

        <div className="p-4 rounded-xl bg-[#0F172A] border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>Clusters</span>
            <Layers className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">{clusters.length || 24}</div>
          <p className="text-[10px] text-slate-500 font-mono">Demand Groups</p>
        </div>

        <div className="p-4 rounded-xl bg-[#0F172A] border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>High Priority</span>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-400">{highPriorityClusters.length || 7}</div>
          <p className="text-[10px] text-slate-500 font-mono">Score ≥ 70</p>
        </div>

        <div className="p-4 rounded-xl bg-[#0F172A] border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>Awaiting Verification</span>
            <CheckCircle2 className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-indigo-300">{awaitingVerification.length || 3}</div>
          <p className="text-[10px] text-slate-500 font-mono">Quorum Pending</p>
        </div>

        <div className="p-4 rounded-xl bg-[#0F172A] border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>Review Flags</span>
            <ShieldAlert className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-red-400">{flagsCount}</div>
          <p className="text-[10px] text-slate-500 font-mono">Fraud / Uncertainty</p>
        </div>

        <div className="p-4 rounded-xl bg-[#0F172A] border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>Verified</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400">{verifiedClusters.length || 9}</div>
          <p className="text-[10px] text-slate-500 font-mono">Verified Outcomes</p>
        </div>
      </div>

      <DistrictMap
        districts={districts}
        onSelectDistrict={(d) => navigate(`/districts/${d.code}`)}
      />

      <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-400" />
              Top Priority Demand Clusters
            </h3>
            <p className="text-xs text-slate-400 font-mono">Ranked by Explainable Priority Score Formula</p>
          </div>
          <button
            onClick={() => navigate('/clusters')}
            className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
          >
            <span>View All Clusters</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-3">CLUSTER ID</th>
                <th className="p-3">PROBLEM</th>
                <th className="p-3">DISTRICT</th>
                <th className="p-3 text-center">CITIZENS AFFECTED</th>
                <th className="p-3 text-center">PRIORITY SCORE</th>
                <th className="p-3">REVIEW</th>
                <th className="p-3">FUNDING</th>
                <th className="p-3">VERIFICATION</th>
                <th className="p-3 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {clusters.slice(0, 5).map((cl) => (
                <tr key={cl.id} className="hover:bg-slate-900/60 transition">
                  <td className="p-3 font-bold text-cyan-400">{cl.id}</td>
                  <td className="p-3 max-w-xs truncate font-sans text-slate-200">{cl.problem_title}</td>
                  <td className="p-3 text-slate-300">{cl.district_name || cl.district_code}</td>
                  <td className="p-3 text-center font-bold text-slate-100">{cl.citizens_affected}</td>
                  <td className="p-3 text-center">
                    <span className="px-2 py-1 rounded bg-slate-900 border border-slate-700 font-bold text-cyan-300">
                      {cl.priority_score?.toFixed(1)}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] ${
                      cl.has_self_extracted_data ? 'bg-amber-950 text-amber-300 border border-amber-500/30 font-bold' : 'bg-slate-900 text-slate-400'
                    }`}>
                      {cl.has_self_extracted_data ? 'VERIFY BEFORE FUNDING' : cl.review_status.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] ${
                      cl.funding_status === 'funded' ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30' : 'bg-slate-900 text-slate-400'
                    }`}>
                      {cl.funding_status.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] ${
                      cl.verification_status === 'verified' ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30 font-bold' : 'bg-slate-900 text-slate-400'
                    }`}>
                      {cl.verification_status.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => navigate(`/clusters/${cl.id}`)}
                      className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-400 transition"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
