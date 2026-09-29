import React from 'react';
import type { District } from '../services/api';
import { MapPin, AlertTriangle, Radio, ExternalLink } from 'lucide-react';

interface DistrictMapProps {
  districts: District[];
  onSelectDistrict: (district: District) => void;
  selectedDistrictCode?: string;
}

export const DistrictMap: React.FC<DistrictMapProps> = ({ districts, onSelectDistrict, selectedDistrictCode }) => {
  return (
    <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <MapPin className="w-4 h-4 text-cyan-400" />
            District Intelligence Grid & Signal Map
          </h3>
          <p className="text-xs text-slate-400 font-mono">District-level granularity • Tamil Nadu MVP Focus</p>
        </div>
        <span className="text-[10px] font-mono px-2 py-1 rounded bg-slate-900 border border-slate-700 text-slate-400">
          District-level demo visualization
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {districts.map((d) => {
          const isSelected = d.code === selectedDistrictCode;
          const isHighDeficit = d.infra_deficit_score >= 0.70;

          return (
            <div
              key={d.code}
              onClick={() => onSelectDistrict(d)}
              className={`
                p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden group
                ${isSelected 
                  ? 'bg-cyan-950/40 border-cyan-500 shadow-lg shadow-cyan-500/10' 
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                }
              `}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-cyan-400 font-bold px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-500/30">
                      {d.code}
                    </span>
                    <h4 className="font-bold text-white text-sm group-hover:text-cyan-300 transition">{d.name}</h4>
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5">{d.state}</p>
                </div>

                {isHighDeficit && (
                  <span className="flex items-center gap-1 text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-500/30">
                    <AlertTriangle className="w-3 h-3" /> High Deficit
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 my-3 text-xs font-mono bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                <div>
                  <span className="text-slate-500 block text-[10px]">POPULATION</span>
                  <span className="text-slate-200 font-medium">{d.population?.toLocaleString('en-IN')}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">BPL %</span>
                  <span className="text-cyan-300 font-medium">{Math.round((d.bpl_pct || 0) * 100)}%</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">INFRA DEFICIT</span>
                  <span className="text-amber-400 font-medium">{d.infra_deficit_score?.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">CAPTURE RATE</span>
                  <span className="text-emerald-400 font-medium">{Math.round((d.estimated_reporting_capture_rate || 0) * 100)}%</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-slate-400 font-mono flex items-center gap-1">
                  <Radio className="w-3 h-3 text-cyan-400" />
                  {d.active_clusters || 0} active demand clusters
                </span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 transition" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
