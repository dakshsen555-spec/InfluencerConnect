'use client';

import React from 'react';
import { Pitch, EscrowTransaction } from '@/types';
import { ShieldCheck, CheckCircle2, Clock, ExternalLink, ArrowRight } from 'lucide-react';
import { localStore } from '@/lib/supabase';

interface EscrowTrackerProps {
  pitches: Pitch[];
  onUpdate: () => void;
}

export const EscrowTracker: React.FC<EscrowTrackerProps> = ({ pitches, onUpdate }) => {
  const activePitches = pitches.filter(p => p.status !== 'draft');

  const totalInEscrow = activePitches
    .filter(p => p.status === 'sent' || p.status === 'accepted' || p.status === 'escrow_funded' || p.status === 'content_submitted')
    .reduce((sum, p) => sum + p.offeredAmount, 0);

  const totalReleased = activePitches
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + p.offeredAmount, 0);

  const handleRelease = (pitchId: string) => {
    localStore.releaseEscrow(pitchId);
    onUpdate();
  };

  return (
    <div className="glass-panel rounded-2xl p-6 border border-slate-800 bg-slate-900/60 shadow-xl space-y-5">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span>Micro-Cash Escrow & Deliverables Hub</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Your startup budget is 100% protected. Creators receive payment only after you verify the published deliverable.
          </p>
        </div>

        {/* Financial Badges */}
        <div className="flex items-center gap-3">
          <div className="bg-slate-950 px-3.5 py-1.5 rounded-xl border border-slate-800">
            <span className="text-[10px] uppercase tracking-wider text-slate-500 block">Locked in Escrow</span>
            <span className="text-sm font-bold text-amber-400 font-mono">${totalInEscrow} USD</span>
          </div>
          <div className="bg-slate-950 px-3.5 py-1.5 rounded-xl border border-slate-800">
            <span className="text-[10px] uppercase tracking-wider text-slate-500 block">Released Payouts</span>
            <span className="text-sm font-bold text-emerald-400 font-mono">${totalReleased} USD</span>
          </div>
        </div>
      </div>

      {/* Deliverable List */}
      {activePitches.length === 0 ? (
        <div className="p-6 text-center rounded-xl bg-slate-950/40 border border-slate-800/60 text-xs text-slate-500">
          No pitches sent yet. Select an influencer above and click "Generate AI Pitch" to initiate an escrow contract!
        </div>
      ) : (
        <div className="space-y-3">
          {activePitches.map(pitch => {
            const hasSubmission = pitch.status === 'content_submitted';
            const isCompleted = pitch.status === 'completed';

            return (
              <div
                key={pitch.id}
                className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{pitch.creatorName}</span>
                    <span className="text-slate-500 font-mono">({pitch.creatorEmail})</span>
                  </div>
                  <p className="text-slate-400 mt-0.5">
                    <strong>Campaign:</strong> {pitch.campaignTitle} • <strong>Deliverables:</strong> {pitch.deliverables}
                  </p>
                  {pitch.contentSubmissionUrl && (
                    <div className="mt-1 flex items-center gap-1.5 text-cyan-400">
                      <span>Submitted Link:</span>
                      <a
                        href={pitch.contentSubmissionUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="underline flex items-center gap-0.5 hover:text-cyan-300"
                      >
                        {pitch.contentSubmissionUrl}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 self-end md:self-auto">
                  <span className="font-bold font-mono text-emerald-400 text-sm">
                    ${pitch.offeredAmount} USD
                  </span>

                  {hasSubmission && (
                    <button
                      onClick={() => handleRelease(pitch.id)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-all flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approve & Release Funds</span>
                    </button>
                  )}

                  {isCompleted && (
                    <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold text-emerald-300 bg-emerald-950/60 border border-emerald-500/30 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span>Completed & Released</span>
                    </span>
                  )}

                  {!hasSubmission && !isCompleted && (
                    <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold text-amber-300 bg-amber-950/60 border border-amber-500/30 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-400" />
                      <span className="capitalize">{pitch.status.replace('_', ' ')}</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
