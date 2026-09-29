import React, { useState } from 'react';
import { ShieldCheck, Camera, UserCheck, Clock, ThumbsUp, ThumbsDown } from 'lucide-react';
import { submitVerificationReply, submitPhotoEvidence, reviewPhotoEvidence } from '../services/api';

interface VerificationQuorumWidgetProps {
  clusterId: string;
  citizenCount: number;
  requiredQuorum: number;
  confirmationsReceived: number;
  quorumReached: boolean;
  photos: any[];
  isFullyVerified: boolean;
  onRefresh: () => void;
}

export const VerificationQuorumWidget: React.FC<VerificationQuorumWidgetProps> = ({
  clusterId,
  citizenCount,
  requiredQuorum,
  confirmationsReceived,
  quorumReached,
  photos,
  isFullyVerified,
  onRefresh
}) => {
  const [commentText, setCommentText] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const pct = Math.min(100, Math.round((confirmationsReceived / Math.max(1, requiredQuorum)) * 100));

  const handleSimulateReply = async (response: 'YES' | 'NO') => {
    setIsSubmitting(true);
    try {
      await submitVerificationReply(clusterId, response, commentText || 'Citizen confirmed issue resolution.', `@citizen_${Math.floor(1000 + Math.random() * 9000)}`);
      setCommentText('');
      onRefresh();
    } catch (err: any) {
      alert(`Error submitting reply: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSimulatePhotoUpload = async () => {
    setIsSubmitting(true);
    try {
      await submitPhotoEvidence(
        clusterId,
        'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b2?auto=format&fit=crop&w=600&q=80',
        'Citizen photo of completed infrastructure repair',
        `@citizen_photo_${Math.floor(1000 + Math.random() * 9000)}`
      );
      onRefresh();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleHumanReviewPhoto = async (photoId: string, action: 'approve' | 'reject') => {
    try {
      await reviewPhotoEvidence(photoId, action, `Human reviewer marked photo as ${action}`);
      onRefresh();
    } catch (err: any) {
      alert(`Error reviewing photo: ${err.message}`);
    }
  };

  return (
    <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-5 space-y-5">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-emerald-400" />
            Citizen Verification Quorum & Photo Review
          </h3>
          <p className="text-xs text-slate-400 font-mono">Formula: LEAST(citizens, GREATEST(3, CEIL(0.05 * citizens)))</p>
        </div>

        {isFullyVerified ? (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/40 text-xs font-mono font-bold animate-pulse">
            <ShieldCheck className="w-4 h-4" /> VERIFIED OUTCOME
          </span>
        ) : quorumReached ? (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-950 text-amber-300 border border-amber-500/40 text-xs font-mono">
            <Clock className="w-3.5 h-3.5" /> Quorum Reached — Awaiting Photo Review
          </span>
        ) : (
          <span className="px-2.5 py-1 rounded bg-slate-900 text-slate-300 border border-slate-700 text-xs font-mono">
            Awaiting Confirmations
          </span>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-xs font-mono">
          <span className="text-slate-300">Citizen Confirmations: {confirmationsReceived} / {requiredQuorum} required</span>
          <span className="text-emerald-400 font-bold">{pct}% Quorum</span>
        </div>
        <div className="w-full bg-slate-900 rounded-full h-3 overflow-hidden border border-slate-800">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="text-[11px] text-slate-400 font-mono">Total reporting citizens in cluster: {citizenCount}</p>
      </div>

      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-mono font-bold text-slate-300 flex items-center gap-1.5">
            <Camera className="w-4 h-4 text-cyan-400" />
            Submitted Photo Evidence ({photos.length})
          </h4>
          <span className="text-[10px] text-slate-400 font-mono">Human-reviewed (No AI CV claimed)</span>
        </div>

        {photos.length === 0 ? (
          <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-lg text-xs text-slate-500 text-center font-mono">
            No photo evidence submitted yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {photos.map((p) => (
              <div key={p.id} className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
                <img src={p.photo_url} alt="Evidence" className="w-full h-28 object-cover rounded border border-slate-800" />
                <p className="text-xs text-slate-300 font-sans leading-tight">{p.caption}</p>
                <div className="flex items-center justify-between pt-1">
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                    p.human_review_status === 'approved' 
                      ? 'bg-emerald-950 text-emerald-400 border-emerald-500/30'
                      : p.human_review_status === 'rejected'
                      ? 'bg-red-950 text-red-400 border-red-500/30'
                      : 'bg-amber-950 text-amber-300 border-amber-500/30'
                  }`}>
                    {p.human_review_status.toUpperCase()}
                  </span>

                  {p.human_review_status === 'pending' && (
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleHumanReviewPhoto(p.id, 'approve')}
                        className="p-1 bg-emerald-900/60 hover:bg-emerald-800 text-emerald-300 rounded text-[10px] font-mono flex items-center gap-1"
                      >
                        <ThumbsUp className="w-3 h-3" /> Approve
                      </button>
                      <button
                        onClick={() => handleHumanReviewPhoto(p.id, 'reject')}
                        className="p-1 bg-red-900/60 hover:bg-red-800 text-red-300 rounded text-[10px] font-mono flex items-center gap-1"
                      >
                        <ThumbsDown className="w-3 h-3" /> Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-lg space-y-3 text-xs">
        <span className="font-mono text-cyan-400 font-semibold block">⚡ SIMULATE CITIZEN TELEGRAM ACTIONS</span>
        <div className="flex gap-2">
          <button
            onClick={() => handleSimulateReply('YES')}
            disabled={isSubmitting}
            className="flex-1 py-1.5 rounded bg-emerald-950 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 font-mono font-bold transition"
          >
            YES — Confirmed Resolution
          </button>
          <button
            onClick={() => handleSimulateReply('NO')}
            disabled={isSubmitting}
            className="flex-1 py-1.5 rounded bg-red-950 hover:bg-red-900 border border-red-500/40 text-red-300 font-mono transition"
          >
            NO — Still Unresolved
          </button>
        </div>

        <button
          onClick={handleSimulatePhotoUpload}
          disabled={isSubmitting}
          className="w-full py-1.5 rounded bg-slate-900 hover:bg-slate-800 border border-cyan-500/30 text-cyan-300 font-mono transition flex items-center justify-center gap-1.5"
        >
          <Camera className="w-3.5 h-3.5" />
          <span>Upload Simulated Photo Evidence</span>
        </button>
      </div>
    </div>
  );
};
