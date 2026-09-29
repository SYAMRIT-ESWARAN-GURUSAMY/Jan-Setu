import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  MessageSquareText, 
  Layers, 
  Flame, 
  Map, 
  ShieldAlert, 
  FileText, 
  CheckCircle2, 
  Activity,
  Compass,
  Radio
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const navItems = [
    { label: 'Overview', path: '/', icon: Compass },
    { label: 'Command Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Complaints', path: '/complaints', icon: MessageSquareText },
    { label: 'Demand Clusters', path: '/clusters', icon: Layers },
    { label: 'Priority Engine', path: '/priority', icon: Flame },
    { label: 'District Intelligence', path: '/districts', icon: Map },
    { label: 'Review Queue', path: '/review', icon: ShieldAlert },
    { label: 'Policy Briefs', path: '/briefs', icon: FileText },
    { label: 'Verification Center', path: '/verification', icon: CheckCircle2 },
    { label: 'System / Audit', path: '/audit', icon: Activity },
  ];

  return (
    <aside className="w-64 bg-[#0B0F17] border-r border-slate-800 flex flex-col justify-between shrink-0 min-h-screen">
      <div>
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800/80 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Radio className="w-6 h-6 text-black stroke-[2.5]" />
          </div>
          <div>
            <div className="font-bold text-lg tracking-wider text-white flex items-center gap-1.5">
              JAN-SETU <span className="text-cyan-400 text-xs px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/30">AI</span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono tracking-tight">Citizen Voice → Verified Action</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150
                ${isActive 
                  ? 'bg-cyan-950/60 text-cyan-400 border border-cyan-500/30 shadow-sm shadow-cyan-500/10' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }
              `}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Scope Footer */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/40 text-xs font-mono space-y-2">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-slate-500">granularity</span>
          <span className="text-cyan-400 font-semibold">District-level MVP</span>
        </div>
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-slate-500">channel</span>
          <span className="text-emerald-400">Telegram</span>
        </div>
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-slate-500">languages</span>
          <span className="text-slate-300">Hindi • Tamil</span>
        </div>
        <div className="pt-2 border-t border-slate-800/60 text-[10px] text-slate-500 text-center">
          Explainable & Equity-Aware Civic AI
        </div>
      </div>
    </aside>
  );
};
