import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquareText, Search, PlusCircle, Volume2, Filter, Layers } from 'lucide-react';
import { fetchComplaints } from '../services/api';
import type { Complaint } from '../services/api';

interface ComplaintsPageProps {
  onOpenIngestion: () => void;
}

export const ComplaintsPage: React.FC<ComplaintsPageProps> = ({ onOpenIngestion }) => {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [search, setSearch] = useState<string>('');
  const [langFilter, setLangFilter] = useState<string>('all');

  useEffect(() => {
    fetchComplaints().then(data => {
      setComplaints(data);
    });
  }, []);

  const filtered = complaints.filter(c => {
    const matchesSearch = (c.original_transcript + ' ' + c.translated_text + ' ' + c.id + ' ' + (c.cluster_id || '')).toLowerCase().includes(search.toLowerCase());
    const matchesLang = langFilter === 'all' || c.language === langFilter;
    return matchesSearch && matchesLang;
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <MessageSquareText className="w-5 h-5 text-cyan-400" />
            Citizen Complaints Stream
          </h2>
          <p className="text-xs text-slate-400 font-mono">Channel: Telegram • Languages: Hindi & Tamil</p>
        </div>

        <button
          onClick={onOpenIngestion}
          className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs transition flex items-center gap-2"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Simulate Telegram Voice Submission</span>
        </button>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#0F172A] p-3 rounded-xl border border-slate-800">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search transcripts, translation, complaint ID..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-500" />
          <select
            value={langFilter}
            onChange={e => setLangFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200"
          >
            <option value="all">All Languages</option>
            <option value="Tamil">Tamil</option>
            <option value="Hindi">Hindi</option>
          </select>
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map(c => (
          <div key={c.id} className="p-4 rounded-xl bg-[#0F172A] border border-slate-800 space-y-3 hover:border-slate-700 transition">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-cyan-400 font-bold">{c.id}</span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                  {c.language}
                </span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                  {c.category}
                </span>
              </div>

              {c.cluster_id && (
                <button
                  onClick={() => navigate(`/clusters/${c.cluster_id}`)}
                  className="text-xs font-mono text-slate-400 hover:text-cyan-400 flex items-center gap-1"
                >
                  <Layers className="w-3.5 h-3.5 text-amber-400" />
                  <span>Cluster: {c.cluster_id}</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-900 space-y-1">
                <span className="text-[10px] font-mono text-slate-500 block flex items-center gap-1">
                  <Volume2 className="w-3 h-3 text-cyan-400" /> ORIGINAL TRANSCRIPT ({c.language.toUpperCase()})
                </span>
                <p className="text-slate-200 font-sans">{c.original_transcript}</p>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-900 space-y-1">
                <span className="text-[10px] font-mono text-slate-500 block">TRANSLATED ENGLISH</span>
                <p className="text-slate-300 font-sans">{c.translated_text}</p>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-1 border-t border-slate-800/60">
              <span>Citizen: {c.telegram_handle || c.citizen_id}</span>
              <span>Logged: {new Date(c.created_at).toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
