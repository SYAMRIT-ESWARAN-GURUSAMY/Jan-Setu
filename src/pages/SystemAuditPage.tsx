import React, { useEffect, useState } from 'react';
import { Activity, Terminal } from 'lucide-react';
import { fetchAuditEvents } from '../services/api';

export const SystemAuditPage: React.FC = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'audit' | 'roadmap'>('audit');

  useEffect(() => {
    fetchAuditEvents().then(setEvents);
  }, []);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-400" />
            System Status & Audit Log
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            Audit-tracked event log stream and platform roadmap scope boundaries.
          </p>
        </div>

        <div className="flex gap-2 font-mono text-xs">
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3 py-1.5 rounded-lg border transition ${
              activeTab === 'audit' ? 'bg-cyan-950 text-cyan-300 border-cyan-500/30 font-bold' : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}
          >
            Audit Trail ({events.length})
          </button>
          <button
            onClick={() => setActiveTab('roadmap')}
            className={`px-3 py-1.5 rounded-lg border transition ${
              activeTab === 'roadmap' ? 'bg-purple-950 text-purple-300 border-purple-500/30 font-bold' : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}
          >
            Product Roadmap
          </button>
        </div>
      </div>

      {activeTab === 'audit' ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
            <div className="p-3 bg-[#0F172A] border border-slate-800 rounded-xl space-y-1">
              <span className="text-slate-500 block text-[10px]">BACKEND SERVER</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Express / TypeScript Node.js
              </span>
            </div>

            <div className="p-3 bg-[#0F172A] border border-slate-800 rounded-xl space-y-1">
              <span className="text-slate-500 block text-[10px]">DATABASE ENGINE</span>
              <span className="text-cyan-400 font-bold">SQLite Relational DB (WAL mode)</span>
            </div>

            <div className="p-3 bg-[#0F172A] border border-slate-800 rounded-xl space-y-1">
              <span className="text-slate-500 block text-[10px]">AUTHENTICATION</span>
              <span className="text-slate-200 font-bold">ADMIN_TOKEN Protected API Routes</span>
            </div>
          </div>

          <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-5 space-y-3">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              Audit Trail Event Stream
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-3">TIMESTAMP</th>
                    <th className="p-3">EVENT TYPE</th>
                    <th className="p-3">ACTOR</th>
                    <th className="p-3">CLUSTER ID</th>
                    <th className="p-3">DESCRIPTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {events.map(ev => (
                    <tr key={ev.id} className="hover:bg-slate-900/60 transition">
                      <td className="p-3 text-slate-400">{new Date(ev.timestamp).toLocaleString()}</td>
                      <td className="p-3 font-bold text-cyan-400">{ev.event_type}</td>
                      <td className="p-3 text-slate-300">{ev.actor}</td>
                      <td className="p-3 text-amber-400">{ev.cluster_id || '—'}</td>
                      <td className="p-3 text-slate-200">{ev.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-purple-950/40 border border-purple-500/30 text-xs font-mono text-purple-300">
            <strong>Honest MVP Scope Boundary:</strong> The items below delineate Phase 1 current implementation vs future roadmap expansion.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-xl bg-[#0F172A] border border-cyan-500/40 space-y-3">
              <span className="px-2.5 py-1 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30 text-xs font-mono font-bold block w-max">
                PHASE 1 — CURRENT MVP
              </span>
              <ul className="space-y-2 text-xs font-mono text-slate-300">
                <li className="flex items-center gap-2 text-emerald-400 font-bold">✓ Telegram Voice/Text</li>
                <li className="flex items-center gap-2 text-emerald-400 font-bold">✓ Hindi + Tamil Languages</li>
                <li className="flex items-center gap-2 text-emerald-400 font-bold">✓ District-level Granularity</li>
                <li className="flex items-center gap-2 text-emerald-400 font-bold">✓ Demand Clustering Engine</li>
                <li className="flex items-center gap-2 text-emerald-400 font-bold">✓ Explainable Priority Formula</li>
                <li className="flex items-center gap-2 text-emerald-400 font-bold">✓ Human Uncertainty Review</li>
                <li className="flex items-center gap-2 text-emerald-400 font-bold">✓ Citizen Verification Quorum</li>
                <li className="flex items-center gap-2 text-emerald-400 font-bold">✓ Human Photo Review</li>
              </ul>
            </div>

            <div className="p-5 rounded-xl bg-[#0F172A] border border-slate-800 space-y-3 opacity-80">
              <span className="px-2.5 py-1 rounded bg-slate-900 text-slate-400 border border-slate-700 text-xs font-mono block w-max">
                PHASE 2 — EXPANSION (ROADMAP)
              </span>
              <ul className="space-y-2 text-xs font-mono text-slate-400">
                <li>→ WhatsApp Business Channel Integration</li>
                <li>→ IVR / Twilio Voice Call Ingestion</li>
                <li>→ Multi-Lingual Support (12+ Indian Languages)</li>
                <li>→ Ward / Panchayat Level Granularity</li>
                <li>→ Vector-based Semantic Demand Clustering</li>
              </ul>
            </div>

            <div className="p-5 rounded-xl bg-[#0F172A] border border-slate-800 space-y-3 opacity-70">
              <span className="px-2.5 py-1 rounded bg-slate-900 text-slate-500 border border-slate-700 text-xs font-mono block w-max">
                PHASE 3 — ADVANCED (ROADMAP)
              </span>
              <ul className="space-y-2 text-xs font-mono text-slate-500">
                <li>→ Computer Vision Photo Evidence Validation</li>
                <li>→ Advanced Adversarial Account Flood Protection</li>
                <li>→ Predictive Civic Infrastructure Deficit Forecasting</li>
                <li>→ Multi-Tenant RBAC & Hash-Chained Audit Logs</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
