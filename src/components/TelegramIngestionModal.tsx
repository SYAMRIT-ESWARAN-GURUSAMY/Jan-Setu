import React, { useState } from 'react';
import { X, Mic, Send, Loader2, CheckCircle2 } from 'lucide-react';
import { processComplaint } from '../services/api';

interface TelegramIngestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data: any) => void;
}

export const TelegramIngestionModal: React.FC<TelegramIngestionModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [language, setLanguage] = useState<'Tamil' | 'Hindi'>('Tamil');
  const [customText, setCustomText] = useState<string>('');
  const [citizenHandle, setCitizenHandle] = useState<string>('@citizen_tn_ward4');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [result, setResult] = useState<any | null>(null);

  if (!isOpen) return null;

  const handlePreset = async (presetKey: string, lang: 'Tamil' | 'Hindi') => {
    setLanguage(lang);
    setIsProcessing(true);
    setResult(null);

    try {
      const res = await processComplaint({
        language: lang,
        inputType: 'voice',
        presetKey,
        citizenHandle
      });

      setResult(res);
      setIsProcessing(false);
      onSuccess(res);
    } catch (err: any) {
      alert(`Error ingesting complaint: ${err.message}`);
      setIsProcessing(false);
    }
  };

  const handleSubmitCustom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customText.trim()) return;

    setIsProcessing(true);
    setResult(null);

    try {
      const res = await processComplaint({
        language,
        inputType: 'text',
        textInput: customText,
        citizenHandle
      });

      setResult(res);
      setIsProcessing(false);
      onSuccess(res);
    } catch (err: any) {
      alert(`Error: ${err.message}`);
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0F172A] border border-cyan-500/40 rounded-xl max-w-xl w-full p-6 shadow-2xl space-y-5 relative">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Mic className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-white">Simulate Citizen Telegram Ingestion</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-mono text-cyan-400 font-semibold block">⚡ DEMO PRESETS (1-CLICK INGESTION)</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handlePreset('tamil_water', 'Tamil')}
              className="p-2.5 rounded-lg bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-500/30 text-left transition text-xs"
            >
              <div className="font-bold text-cyan-300">🎙 Tamil Water Complaint</div>
              <div className="text-[11px] text-slate-400 truncate">எங்கள் பகுதியில் குடிநீர்...</div>
            </button>

            <button
              onClick={() => handlePreset('tamil_road', 'Tamil')}
              className="p-2.5 rounded-lg bg-blue-950/60 hover:bg-blue-900/60 border border-blue-500/30 text-left transition text-xs"
            >
              <div className="font-bold text-blue-300">🎙 Tamil Road Complaint</div>
              <div className="text-[11px] text-slate-400 truncate">மயிலாடுதுறை மெயின் ரோட்டில்...</div>
            </button>

            <button
              onClick={() => handlePreset('hindi_water', 'Hindi')}
              className="p-2.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-500/30 text-left transition text-xs"
            >
              <div className="font-bold text-emerald-300">🎙 Hindi Water Complaint</div>
              <div className="text-[11px] text-slate-400 truncate">हमारे इलाके में पानी...</div>
            </button>

            <button
              onClick={() => handlePreset('hindi_road', 'Hindi')}
              className="p-2.5 rounded-lg bg-purple-950/60 hover:bg-purple-900/60 border border-purple-500/30 text-left transition text-xs"
            >
              <div className="font-bold text-purple-300">🎙 Hindi Road Complaint</div>
              <div className="text-[11px] text-slate-400 truncate">मुख्य मार्ग पर गड्ढों...</div>
            </button>
          </div>
        </div>

        <div className="relative border-t border-slate-800 my-4 text-center">
          <span className="bg-[#0F172A] px-2 text-[10px] font-mono text-slate-500 relative -top-2.5">OR CUSTOM SIMULATION</span>
        </div>

        <form onSubmit={handleSubmitCustom} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-mono text-slate-400 block mb-1">LANGUAGE</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200"
              >
                <option value="Tamil">Tamil (தமிழ்)</option>
                <option value="Hindi">Hindi (हिंदी)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-mono text-slate-400 block mb-1">TELEGRAM HANDLE</label>
              <input
                type="text"
                value={citizenHandle}
                onChange={(e) => setCitizenHandle(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-mono text-slate-400 block mb-1">CITIZEN MESSAGE CONTENT</label>
            <textarea
              rows={3}
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="Enter text or voice transcript in Hindi or Tamil..."
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200"
            />
          </div>

          <button
            type="submit"
            disabled={isProcessing || !customText.trim()}
            className="w-full py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 font-bold text-xs text-black disabled:opacity-50 transition flex items-center justify-center gap-2"
          >
            {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            <span>Process Complaint via JAN-SETU AI</span>
          </button>
        </form>

        {result && (
          <div className="bg-slate-950 p-4 rounded-lg border border-cyan-500/40 font-mono text-xs space-y-2">
            <div className="text-cyan-400 font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>AI Ingestion & Clustering Pipeline Complete</span>
            </div>
            <div className="text-slate-300">Transcript: "{result.aiResult.originalTranscript}"</div>
            <div className="text-slate-400">Translated: "{result.aiResult.translatedText}"</div>
            <div className="flex gap-2 pt-1">
              <span className="bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded">Category: {result.aiResult.category}</span>
              <span className="bg-slate-900 text-slate-300 px-2 py-0.5 rounded">Cluster: {result.clusterId}</span>
              <span className="bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded">Score: {result.updatedCluster.priority_score}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
