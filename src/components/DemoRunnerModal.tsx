import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, Loader2, Sparkles, ShieldCheck } from 'lucide-react';
import { runDemoStep, resetDemoState } from '../services/api';

interface DemoRunnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefreshData: () => void;
}

export const DemoRunnerModal: React.FC<DemoRunnerModalProps> = ({ isOpen, onClose, onRefreshData }) => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [stepData, setStepData] = useState<Record<number, any>>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && currentStep === 0 && !isRunning) {
      startDemo();
    }
  }, [isOpen]);

  const startDemo = async () => {
    setIsRunning(true);
    setCurrentStep(1);
    setStepData({});
    setErrorMessage(null);

    try {
      const res1 = await runDemoStep(1);
      setStepData(prev => ({ ...prev, 1: res1 }));
      await new Promise(r => setTimeout(r, 2000));

      setCurrentStep(2);
      const res2 = await runDemoStep(2);
      setStepData(prev => ({ ...prev, 2: res2 }));
      await new Promise(r => setTimeout(r, 2500));

      setCurrentStep(3);
      const res3 = await runDemoStep(3);
      setStepData(prev => ({ ...prev, 3: res3 }));
      
      setIsRunning(false);
      onRefreshData();
    } catch (err: any) {
      setErrorMessage(err.message || 'Demo execution error');
      setIsRunning(false);
    }
  };

  const handleResetAndClose = async () => {
    await resetDemoState();
    onRefreshData();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0F172A] border border-cyan-500/40 rounded-xl max-w-2xl w-full p-6 shadow-2xl shadow-cyan-500/10 space-y-6 relative overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400 animate-spin" />
            <h2 className="text-lg font-bold text-white tracking-wide">
              JAN-SETU AI — Live Hackathon Demo Simulation
            </h2>
          </div>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className={`p-3 rounded-lg border transition ${currentStep >= 1 ? 'bg-cyan-950/40 border-cyan-500/50 text-cyan-300' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>
            <div className="flex items-center justify-between text-xs font-mono mb-1">
              <span>01. PRIORITIZE</span>
              {currentStep === 1 && <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />}
              {currentStep > 1 && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />}
            </div>
            <p className="text-xs font-semibold text-slate-200">Citizen Voice & Clustering</p>
          </div>

          <div className={`p-3 rounded-lg border transition ${currentStep >= 2 ? 'bg-cyan-950/40 border-cyan-500/50 text-cyan-300' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>
            <div className="flex items-center justify-between text-xs font-mono mb-1">
              <span>02. FUND</span>
              {currentStep === 2 && <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />}
              {currentStep > 2 && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />}
            </div>
            <p className="text-xs font-semibold text-slate-200">Policy Brief & Allocation</p>
          </div>

          <div className={`p-3 rounded-lg border transition ${currentStep >= 3 ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>
            <div className="flex items-center justify-between text-xs font-mono mb-1">
              <span>03. VERIFY</span>
              {currentStep === 3 && isRunning && <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />}
              {currentStep === 3 && !isRunning && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
            </div>
            <p className="text-xs font-semibold text-slate-200">Citizen Quorum & Photo Review</p>
          </div>
        </div>

        <div className="bg-slate-950 rounded-lg p-4 font-mono text-xs border border-slate-800 space-y-3 max-h-72 overflow-y-auto">
          {stepData[1] && (
            <div className="space-y-1 text-slate-300 border-l-2 border-cyan-500 pl-3">
              <div className="text-cyan-400 font-bold">✓ Citizen Tamil Voice Complaint Received</div>
              <p className="text-slate-400 text-[11px] font-sans">"{stepData[1].aiResult.originalTranscript}"</p>
              <div className="text-slate-400 text-[11px]">Translated: "{stepData[1].aiResult.translatedText}"</div>
              <div className="flex gap-2 pt-1 text-[11px]">
                <span className="bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded border border-cyan-500/30">Category: Water</span>
                <span className="bg-slate-900 text-slate-300 px-2 py-0.5 rounded">District: Nagapattinam</span>
                <span className="bg-amber-950 text-amber-300 px-2 py-0.5 rounded">Cluster: {stepData[1].clusterId}</span>
              </div>
            </div>
          )}

          {stepData[2] && (
            <div className="space-y-1 text-slate-300 border-l-2 border-blue-500 pl-3">
              <div className="text-blue-400 font-bold">✓ Explainable Priority Score: {stepData[2].priorityScore} / 100</div>
              <div className="text-emerald-400">✓ Number-Safe Policy Brief Generated (Numeric validation passed)</div>
              <div className="text-slate-300">✓ Emergency Funding Approved: ₹{stepData[2].fundedAmount?.toLocaleString('en-IN')}</div>
              <div className="text-cyan-300 text-[11px]">→ Telegram Verification Request Triggered (Required Quorum: {stepData[2].requiredQuorum} citizens)</div>
            </div>
          )}

          {stepData[3] && (
            <div className="space-y-1 text-slate-300 border-l-2 border-emerald-500 pl-3">
              <div className="text-emerald-400 font-bold">✓ Citizen Verification Quorum Reached (5/5 confirmations)</div>
              <div className="text-emerald-300">✓ Photo Evidence Reviewed & Approved by Human Engineer</div>
              <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-lg mt-2 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-emerald-400 tracking-wider block"># VERIFIED OUTCOME</span>
                  <p className="text-[11px] text-slate-300">Citizen reports were transformed into a prioritized, funded, human-reviewed, and verified public-action outcome.</p>
                </div>
                <ShieldCheck className="w-8 h-8 text-emerald-400 shrink-0" />
              </div>
            </div>
          )}

          {isRunning && (
            <div className="flex items-center gap-2 text-cyan-400 font-mono animate-pulse pt-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Processing JAN-SETU AI automated pipeline step {currentStep}...</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-2 bg-red-950 text-red-300 border border-red-800 rounded">
              Error: {errorMessage}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <button
            onClick={handleResetAndClose}
            className="text-xs font-mono text-slate-400 hover:text-white transition"
          >
            Reset Seed Data & Close
          </button>
          
          <div className="flex gap-2">
            {!isRunning && (
              <button
                onClick={startDemo}
                className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition"
              >
                Re-run Demo
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs transition"
            >
              Explore Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
