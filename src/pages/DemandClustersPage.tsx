import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layers, Search, ArrowRight } from 'lucide-react';
import { fetchClusters } from '../services/api';
import type { DemandCluster } from '../services/api';

export const DemandClustersPage: React.FC = () => {
  const navigate = useNavigate();
  const [clusters, setClusters] = useState<DemandCluster[]>([]);
  const [search, setSearch] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  useEffect(() => {
    fetchClusters().then(setClusters);
  }, []);

  const filtered = clusters.filter(c => {
    const matchesSearch = (c.id + ' ' + c.problem_title + ' ' + c.district_code + ' ' + c.approx_location).toLowerCase().includes(search.toLowerCase());
    const matchesCat = categoryFilter === 'all' || c.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Layers className="w-5 h-5 text-cyan-400" />
          Demand Clusters Engine
        </h2>
        <p className="text-xs text-slate-400 font-mono">
          "We count real-world problems, not just individual tickets."
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#0F172A] p-3 rounded-xl border border-slate-800">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search clusters by ID, problem, location..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200"
        >
          <option value="all">All Categories</option>
          <option value="Water">Water</option>
          <option value="Roads">Roads</option>
          <option value="Electricity">Electricity</option>
          <option value="Sanitation">Sanitation</option>
          <option value="Healthcare">Healthcare</option>
          <option value="Education">Education</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(cl => (
          <div
            key={cl.id}
            onClick={() => navigate(`/clusters/${cl.id}`)}
            className="p-5 rounded-xl bg-[#0F172A] border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-900/60 cursor-pointer transition space-y-4 flex flex-col justify-between group"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-cyan-400 px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/30">
                  {cl.id}
                </span>
                <span className="text-xs font-mono text-slate-400">{cl.district_name || cl.district_code}</span>
              </div>

              <h3 className="font-bold text-white text-sm group-hover:text-cyan-300 transition line-clamp-2">
                {cl.problem_title}
              </h3>

              <p className="text-xs text-slate-400 font-sans line-clamp-2">{cl.problem_summary}</p>
            </div>

            <div className="space-y-3 pt-3 border-t border-slate-800/80">
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div>
                  <span className="text-slate-500 block text-[10px]">CITIZENS SIGNAL</span>
                  <span className="text-slate-100 font-bold">{cl.citizens_affected} reports</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">PRIORITY SCORE</span>
                  <span className="text-cyan-400 font-bold text-sm">{cl.priority_score?.toFixed(1)}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className={`px-2 py-0.5 rounded ${
                  cl.has_self_extracted_data ? 'bg-amber-950 text-amber-300 border border-amber-500/30 font-bold' : 'bg-slate-900 text-slate-400'
                }`}>
                  {cl.has_self_extracted_data ? 'UNVERIFIED DATA' : cl.review_status.toUpperCase()}
                </span>

                <span className="text-slate-400 flex items-center gap-1 group-hover:text-cyan-400 transition">
                  Details <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
