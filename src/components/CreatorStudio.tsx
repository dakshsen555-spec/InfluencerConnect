'use client';

import React, { useState } from 'react';
import { CreatorProfile, Pitch } from '@/types';
import { Sparkles, DollarSign, CheckCircle2, Clock, XCircle, ExternalLink, ShieldCheck, Upload, Play, AlertCircle } from 'lucide-react';
import { localStore } from '@/lib/supabase';

interface CreatorStudioProps {
  creators: CreatorProfile[];
  pitches: Pitch[];
  onPitchUpdate: () => void;
}

export const CreatorStudio: React.FC<CreatorStudioProps> = ({
  creators,
  pitches,
  onPitchUpdate,
}) => {
  // Select first creator as active demo persona
  const [selectedCreatorId, setSelectedCreatorId] = useState<string>(creators[0]?.id || 'creator-1');
  const [submissionUrl, setSubmissionUrl] = useState('');
  const [submittingPitchId, setSubmittingPitchId] = useState<string | null>(null);

  const activeCreator = creators.find(c => c.id === selectedCreatorId) || creators[0];
  
  // Filter pitches sent to this creator (or all demo pitches for flexibility)
  const creatorPitches = pitches.filter(
    p => p.creatorId === activeCreator?.id || pitches.length <= 3
  );

  const handleStatusChange = (pitchId: string, status: Pitch['status']) => {
    localStore.updatePitchStatus(pitchId, status);
    onPitchUpdate();
  };

  const handleSubmitProof = (pitchId: string) => {
    if (!submissionUrl.trim()) return;
    localStore.updatePitchStatus(pitchId, 'content_submitted', submissionUrl);
    setSubmittingPitchId(null);
    setSubmissionUrl('');
    onPitchUpdate();
  };

  if (!activeCreator) return null;

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Creator Persona Selector Header */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 bg-slate-900/80 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          <div className="flex items-center gap-4">
            <img
              src={activeCreator.avatarUrl}
              alt={activeCreator.name}
              className="w-16 h-16 rounded-full object-cover border-2 border-cyan-500/60 shadow-lg"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white">{activeCreator.name}</h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-mono">
                  Creator Profile
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">@{activeCreator.username} • {activeCreator.location}</p>
              <p className="text-xs text-slate-300 mt-1 max-w-xl">{activeCreator.bio}</p>
            </div>
          </div>

          {/* Switch Active Creator Persona */}
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 self-start md:self-auto">
            <label className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1 font-semibold">
              Preview as different creator:
            </label>
            <select
              value={selectedCreatorId}
              onChange={e => setSelectedCreatorId(e.target.value)}
              className="w-full bg-slate-900 text-xs text-slate-200 border border-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            >
              {creators.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} (@{c.username}) — ${c.ratePerPost}/post
                </option>
              ))}
            </select>
          </div>

        </div>

        {/* Creator Stats Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-800">
          <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Audience Reach</span>
            <span className="text-base font-bold text-white font-mono">{activeCreator.totalReach.toLocaleString()}</span>
          </div>
          <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Avg Engagement</span>
            <span className="text-base font-bold text-emerald-400 font-mono">{activeCreator.avgEngagementRate}%</span>
          </div>
          <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Base Rate</span>
            <span className="text-base font-bold text-purple-300 font-mono">${activeCreator.ratePerPost} / post</span>
          </div>
          <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Deals Completed</span>
            <span className="text-base font-bold text-cyan-400 font-mono">{activeCreator.completedDeals || 14}</span>
          </div>
        </div>
      </div>

      {/* Creator Pitches Inbox */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 bg-slate-900/60 shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span>Brand Pitches Inbox</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono">
                {creatorPitches.length} Offers
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Review direct micro-campaign proposals and accept guaranteed escrow deals.
            </p>
          </div>
        </div>

        {creatorPitches.length === 0 ? (
          <div className="p-8 text-center rounded-xl bg-slate-950/50 border border-slate-800/80">
            <Clock className="w-8 h-8 text-slate-500 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-300">No active pitches yet for {activeCreator.name}</p>
            <p className="text-xs text-slate-500 mt-1">
              Switch to the "Small Business" tab above to run a search and send a pitch to this creator!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {creatorPitches.map(pitch => {
              const isAccepted = pitch.status === 'accepted' || pitch.status === 'escrow_funded';
              const isSubmitted = pitch.status === 'content_submitted';
              const isCompleted = pitch.status === 'completed';

              return (
                <div
                  key={pitch.id}
                  className="p-5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition-all space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-xs font-semibold text-purple-400">{pitch.businessName}</span>
                      <h4 className="text-sm font-bold text-white">{pitch.pitchSubject}</h4>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20 font-mono">
                        ${pitch.offeredAmount} USD (Escrow)
                      </span>
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize ${
                        isCompleted
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : isSubmitted
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : isAccepted
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                          : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                      }`}>
                        {pitch.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  {/* Pitch Message Body */}
                  <div className="p-3.5 rounded-lg bg-slate-900/90 border border-slate-800 text-xs text-slate-300 whitespace-pre-line font-sans leading-relaxed">
                    {pitch.pitchBody}
                  </div>

                  {/* Deliverables summary */}
                  <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                    <span>
                      <strong className="text-slate-300">Deliverables required:</strong> {pitch.deliverables}
                    </span>
                  </div>

                  {/* Actions according to status */}
                  <div className="pt-2 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-3">
                    
                    {pitch.status === 'sent' && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleStatusChange(pitch.id, 'accepted')}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white shadow-sm transition-all"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Accept Deal ($ {pitch.offeredAmount})</span>
                        </button>
                        <button
                          onClick={() => handleStatusChange(pitch.id, 'declined')}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Decline</span>
                        </button>
                      </div>
                    )}

                    {isAccepted && (
                      <div className="w-full space-y-2">
                        <div className="p-2.5 rounded-lg bg-cyan-950/30 border border-cyan-500/30 text-xs text-cyan-300 flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <ShieldCheck className="w-4 h-4 text-cyan-400" />
                            <span>Deal Accepted! Funds ($ {pitch.offeredAmount}) are locked in Escrow. Shoot your video and paste your link below.</span>
                          </span>
                        </div>

                        {submittingPitchId === pitch.id ? (
                          <div className="flex items-center gap-2 pt-1">
                            <input
                              type="text"
                              value={submissionUrl}
                              onChange={e => setSubmissionUrl(e.target.value)}
                              placeholder="e.g. https://www.instagram.com/reel/C2X9k4L..."
                              className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                            />
                            <button
                              onClick={() => handleSubmitProof(pitch.id)}
                              className="px-4 py-2 rounded-lg text-xs font-bold bg-gradient-to-r from-cyan-600 to-teal-500 text-white shadow-md hover:from-cyan-500"
                            >
                              Submit Proof
                            </button>
                            <button
                              onClick={() => setSubmittingPitchId(null)}
                              className="px-2.5 py-2 text-xs text-slate-400 hover:text-white"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setSubmittingPitchId(pitch.id)}
                            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-sm transition-all"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>Submit Published Reel / Video Link</span>
                          </button>
                        )}
                      </div>
                    )}

                    {isSubmitted && (
                      <div className="w-full flex items-center justify-between text-xs p-2.5 rounded-lg bg-amber-950/30 border border-amber-500/20 text-amber-300">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-amber-400" />
                          <span>Deliverable Submitted: <span className="font-mono underline">{pitch.contentSubmissionUrl}</span></span>
                        </div>
                        <span className="text-[11px] text-amber-400/80">Awaiting brand escrow release</span>
                      </div>
                    )}

                    {isCompleted && (
                      <div className="w-full flex items-center justify-between text-xs p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-500/20 text-emerald-300">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>Campaign Completed! Payout of ${pitch.offeredAmount} USD released from escrow.</span>
                        </div>
                        <span className="font-mono font-bold text-emerald-400">+${pitch.offeredAmount}</span>
                      </div>
                    )}

                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
