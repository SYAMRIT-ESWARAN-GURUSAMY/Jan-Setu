import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Map, Database } from 'lucide-react';
import { fetchDistricts, fetchDistrictByCode } from '../services/api';
import type { District, DemandCluster } from '../services/api';
import { ProvenanceModal } from '../components/ProvenanceModal';

export const DistrictIntelligencePage: React.FC = () => {
  const { code } = useParams<{ code?: string }>();
  const [districts, setDistricts] = useState<District[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState<District | null>(null);
  const [districtClusters, setDistrictClusters] = useState<DemandCluster[]>([]);
  const [isProvenanceOpen, setIsProvenanceOpen] = useState<boolean>(false);

  useEffect(() => {
    fetchDistricts().then(data => {
      setDistricts(data);
      if (code) {
        const found = data.find(d => d.code === code);
        if (found) {
          setSelectedDistrict(found);
          fetchDistrictByCode(found.code).then(res => setDistrictClusters(res.clusters));
        }
      } else if (data.length > 0) {
        setSelectedDistrict(data[0]);
        fetchDistrictByCode(data[0].code).then(res => setDistrictClusters(res.clusters));
      }
    });
  }, [code]);

  const handleSelect = async (d: District) => {
    setSelectedDistrict(d);
    const res = await fetchDistrictByCode(d.code);
    setDistrictClusters(res.clusters);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Map className="w-5 h-5 text-cyan-400" />
          District Intelligence & Indicator Provenance
        </h2>
        <p className="text-xs text-slate-400 font-mono">
          Granular district indicators with audit-tracked provenance sources.
        </p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {districts.map(d => (
          <button
            key={d.code}
            onClick={() => handleSelect(d)}
            className={`px-4 py-2 rounded-xl font-mono text-xs transition border shrink-0 ${
              selectedDistrict?.code === d.code
                ? 'bg-cyan-950 border-cyan-500 text-cyan-300 font-bold shadow-sm shadow-cyan-500/20'
                : 'bg-[#0F172A] border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {d.name} ({d.code})
          </button>
        ))}
      </div>

      {selectedDistrict && (
        <div className="space-y-6">
          <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-white text-base">
                  {selectedDistrict.name} ({selectedDistrict.code}) Overview
                </h3>
                <p className="text-xs text-slate-400 font-mono">{selectedDistrict.state}</p>
              </div>

              <button
                onClick={() => setIsProvenanceOpen(true)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-mono flex items-center gap-1.5 border border-slate-700 transition"
              >
                <Database className="w-3.5 h-3.5" />
                <span>Inspect Data Provenance</span>
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
              <div className="p-3 bg-slate-950 border border-slate-900 rounded-lg">
                <span className="text-slate-500 block text-[10px]">POPULATION</span>
                <span className="text-slate-100 font-bold text-sm">{selectedDistrict.population?.toLocaleString('en-IN')}</span>
                <span className="text-[10px] text-slate-500 block">Source: {selectedDistrict.population_source}</span>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-900 rounded-lg">
                <span className="text-slate-500 block text-[10px]">BPL %</span>
                <span className="text-cyan-300 font-bold text-sm">{Math.round(selectedDistrict.bpl_pct * 100)}%</span>
                <span className="text-[10px] text-slate-500 block">Source: {selectedDistrict.bpl_pct_source}</span>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-900 rounded-lg">
                <span className="text-slate-500 block text-[10px]">INFRA DEFICIT</span>
                <span className="text-amber-400 font-bold text-sm">{selectedDistrict.infra_deficit_score?.toFixed(2)}</span>
                <span className="text-[10px] text-slate-500 block">Source: {selectedDistrict.infra_deficit_source}</span>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-900 rounded-lg">
                <span className="text-slate-500 block text-[10px]">CAPTURE RATE</span>
                <span className="text-emerald-400 font-bold text-sm">{Math.round(selectedDistrict.estimated_reporting_capture_rate * 100)}%</span>
                <span className="text-[10px] text-slate-500 block">Model: Telecom Cell</span>
              </div>
            </div>
          </div>

          <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-5 space-y-3">
            <h4 className="font-bold text-white text-sm">Active Demand Clusters in {selectedDistrict.name}</h4>
            <div className="space-y-2">
              {districtClusters.map(cl => (
                <div key={cl.id} className="p-3 bg-slate-950 border border-slate-900 rounded-lg text-xs font-mono flex items-center justify-between">
                  <div>
                    <span className="text-cyan-400 font-bold">{cl.id}</span> — <span className="text-slate-200 font-sans">{cl.problem_title}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 font-bold text-cyan-300">
                    Score: {cl.priority_score?.toFixed(1)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <ProvenanceModal
        district={selectedDistrict}
        isOpen={isProvenanceOpen}
        onClose={() => setIsProvenanceOpen(false)}
      />
    </div>
  );
};
