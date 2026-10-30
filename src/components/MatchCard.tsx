'use client';

import React, { useState } from 'react';
import { CreatorMatch, Campaign } from '@/types';
import { Sparkles, Star, MapPin, CheckCircle2, ChevronDown, ChevronUp, DollarSign, ArrowUpRight, Play, MessageSquarePlus } from 'lucide-react';

interface MatchCardProps {
  match: CreatorMatch;
  campaign: Campaign;
  onOpenPitch: (match: CreatorMatch) => void;
}

export const MatchCard: React.FC<MatchCardProps> = ({ match, campaign, onOpenPitch }) => {
  const [showBreakdown, setShowBreakdown] = useState(false);
  const { creator, score } = match;

  // Determine color scheme based on match score
  const getScoreColor = (total: number) => {
    if (total >= 85) return 'from-emerald-500 to-teal-400 text-emerald-300 border-emerald-500/40 bg-emerald-950/40';
    if (total >= 70) return 'from-cyan-500 to-blue-400 text-cyan-300 border-cyan-500/40 bg-cyan-950/40';
    return 'from-purple-500 to-indigo-400 text-purple-300 border-purple-500/40 bg-purple-950/40';
  };

  const topPost = creator.recentTopPosts[0];

  return (
    <div className="glass-panel glass-panel-hover rounded-2xl p-5 sm:p-6 border border-slate-800 bg-slate-900/70 flex flex-col justify-between relative group">
      
      {/* Top Section: Avatar, Details & Match Score */}
      <div>
        
        <div className="flex items-start justify-between gap-3 mb-4">
          
          <div className="flex items-center gap-3">
            <img
              src={creator.avatarUrl}
              alt={creator.name}
              className="w-13 h-13 rounded-full object-cover border-2 border-slate-700 group-hover:border-purple-500/60 transition-colors shadow-md"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-white text-base leading-tight">{creator.name}</h3>
                {creator.rating && (
                  <span className="flex items-center text-[11px] font-semibold text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded">
                    <Star className="w-3 h-3 fill-amber-400 mr-0.5" />
                    {creator.rating}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 font-mono">@{creator.username}</p>
              <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                <MapPin className="w-3 h-3 text-slate-500" />
                <span>{creator.location}</span>
                {score.locationScore >= 75 && (
                  <span className="ml-1 text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Target Match
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Composite Match Badge */}
          <div className="text-right flex-shrink-0">
            <div className={`px-3 py-1.5 rounded-xl border font-bold text-xs flex items-center gap-1.5 ${getScoreColor(score.totalScore)}`}>
              <Sparkles className="w-3.5 h-3.5" />
              <span>{score.totalScore}% Match</span>
            </div>
            <button
              onClick={() => setShowBreakdown(!showBreakdown)}
              className="text-[10px] text-slate-400 hover:text-slate-200 mt-1 flex items-center justify-end w-full gap-0.5 font-medium transition-colors"
            >
              <span>Score analysis</span>
              {showBreakdown ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>

        </div>

        {/* Score Breakdown Modal / Drawer (if expanded) */}
        {showBreakdown && (
          <div className="mb-4 p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 text-xs space-y-2 animate-fadeIn">
            <div className="font-semibold text-slate-300 text-[11px] uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>RAG Match Scoring Breakdown</span>
              <span className="text-purple-400 font-mono">Vector Cosine + Heuristics</span>
            </div>
            
            <div className="space-y-1.5">
              <div>
                <div className="flex justify-between text-[11px] text-slate-400 mb-0.5">
                  <span>Semantic Relevance (Cosine Similarity)</span>
                  <span className="text-slate-200 font-mono">{score.semanticScore}%</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-purple-500 h-full rounded-full" style={{ width: `${score.semanticScore}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-400 mb-0.5">
                  <span>Niche & Keyword Alignment</span>
                  <span className="text-slate-200 font-mono">{score.nicheAlignment}%</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-cyan-500 h-full rounded-full" style={{ width: `${score.nicheAlignment}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-400 mb-0.5">
                  <span>Budget Compatibility ($ vs ask)</span>
                  <span className="text-slate-200 font-mono">{score.budgetCompatibility}%</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${score.budgetCompatibility}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-400 mb-0.5">
                  <span>Location Alignment ({creator.location})</span>
                  <span className="text-slate-200 font-mono">{score.locationScore ?? 100}%</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`${(score.locationScore ?? 100) >= 75 ? 'bg-emerald-400' : 'bg-slate-500'} h-full rounded-full`}
                    style={{ width: `${score.locationScore ?? 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-400 mb-0.5">
                  <span>Engagement Boost ({creator.avgEngagementRate}% ER)</span>
                  <span className="text-slate-200 font-mono">{score.engagementBoost}%</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full" style={{ width: `${score.engagementBoost}%` }} />
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 pt-1 italic border-t border-slate-800/80">
              "{score.matchReason}"
            </p>
          </div>
        )}

        {/* Bio */}
        <p className="text-xs text-slate-300 line-clamp-2 mb-3 leading-relaxed">
          {creator.bio}
        </p>

        {/* Niche Pills */}
        <div className="flex flex-wrap gap-1.5 mb-3.5">
          {creator.niches.map((niche, idx) => (
            <span
              key={idx}
              className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-800/90 text-slate-300 border border-slate-700/60"
            >
              {niche}
            </span>
          ))}
          {creator.barterAccepted && (
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              🎁 Barter/Gift Welcome
            </span>
          )}
        </div>

        {/* Social Platforms Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 mb-3.5">
          
          <div>
            <span className="text-[10px] uppercase tracking-wider text-slate-500 block">Total Reach</span>
            <span className="text-xs font-bold text-white font-mono">
              {creator.totalReach.toLocaleString()}
            </span>
          </div>

          <div>
            <span className="text-[10px] uppercase tracking-wider text-slate-500 block">Avg Engagement</span>
            <span className="text-xs font-bold text-emerald-400 font-mono">
              {creator.avgEngagementRate}%
            </span>
          </div>

          <div className="col-span-2 sm:col-span-1">
            <span className="text-[10px] uppercase tracking-wider text-slate-500 block">Rate / Deliverable</span>
            <span className="text-xs font-bold text-purple-300 font-mono">
              ${creator.ratePerPost} USD
            </span>
          </div>

        </div>

        {/* Recent Top Post (What the AI will hook!) */}
        {topPost && (
          <div className="p-2.5 rounded-xl bg-purple-950/20 border border-purple-500/20 mb-4 flex items-start gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0 mt-0.5 text-purple-400">
              <Play className="w-3 h-3 fill-purple-400" />
            </div>
            <div className="text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 block">
                Recent Viral Content:
              </span>
              <p className="text-slate-200 font-medium text-[11px] leading-snug">
                "{topPost.title}"
              </p>
              <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400">
                <span>{topPost.viewsOrLikes}</span>
                <span>•</span>
                <span className="italic">{topPost.topic}</span>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Action Footer */}
      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-3">
        <div className="text-[11px] text-slate-400">
          <span className="text-slate-500">Deals completed:</span>{' '}
          <span className="font-semibold text-slate-300">{creator.completedDeals || 12}</span>
        </div>

        <button
          onClick={() => onOpenPitch(match)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-md shadow-purple-600/30 transition-all transform active:scale-95"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>Generate AI Pitch</span>
        </button>
      </div>

    </div>
  );
};
