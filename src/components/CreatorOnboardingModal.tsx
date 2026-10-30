'use client';

import React, { useState } from 'react';
import { CreatorProfile, PlatformType } from '@/types';
import { X, Sparkles, Plus, Check, DollarSign, UserPlus } from 'lucide-react';
import { localStore } from '@/lib/supabase';

interface CreatorOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreatorAdded: (creator: CreatorProfile) => void;
}

export const CreatorOnboardingModal: React.FC<CreatorOnboardingModalProps> = ({
  isOpen,
  onClose,
  onCreatorAdded,
}) => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [location, setLocation] = useState('');
  const [bio, setBio] = useState('');
  const [niches, setNiches] = useState('');
  const [followers, setFollowers] = useState(5000);
  const [engagementRate, setEngagementRate] = useState(6.5);
  const [ratePerPost, setRatePerPost] = useState(50);
  const [barterAccepted, setBarterAccepted] = useState(true);
  const [contactEmail, setContactEmail] = useState('');
  const [topPostTitle, setTopPostTitle] = useState('');
  const [topPostTopic, setTopPostTopic] = useState('');
  const [contentDescription, setContentDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const newCreator: CreatorProfile = {
      id: `creator-${Date.now()}`,
      name,
      username: username.replace('@', ''),
      avatarUrl: `https://images.unsplash.com/photo-${1534528741775 + Math.floor(Math.random() * 1000)}?w=150&auto=format&fit=crop&q=80`,
      bio,
      location,
      niches: niches.split(',').map(n => n.trim()).filter(Boolean),
      platforms: {
        instagram: {
          handle: `@${username.replace('@', '')}`,
          url: 'https://instagram.com',
          followers: Number(followers),
          avgLikes: Math.round(Number(followers) * (Number(engagementRate) / 100)),
          engagementRate: Number(engagementRate),
        },
      },
      totalReach: Number(followers),
      avgEngagementRate: Number(engagementRate),
      ratePerPost: Number(ratePerPost),
      barterAccepted,
      contactEmail,
      sampleDeliverables: ['1 60s Reel / TikTok', '2 Story slides with link'],
      recentTopPosts: [
        {
          title: topPostTitle || 'My favorite local recommendations',
          viewsOrLikes: `${Math.round(Number(followers) * 1.5).toLocaleString()} views`,
          topic: topPostTopic || 'Community lifestyle',
        },
      ],
      contentDescription: contentDescription || bio,
      rating: 5.0,
      completedDeals: 0,
    };

    localStore.addCreator(newCreator);

    setTimeout(() => {
      setIsSubmitting(false);
      onCreatorAdded(newCreator);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Creator Onboarding</h3>
              <p className="text-xs text-slate-400">Register your profile to get matched with small business budgets</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Samira Davis"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Social Handle (@)</label>
              <input
                type="text"
                required
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="@samira_lifestyle"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Location / City</label>
              <input
                type="text"
                required
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="e.g. Austin, Texas"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Contact Email</label>
              <input
                type="email"
                required
                value={contactEmail}
                onChange={e => setContactEmail(e.target.value)}
                placeholder="collabs@samira.com"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Bio</label>
            <textarea
              rows={2}
              required
              value={bio}
              onChange={e => setBio(e.target.value)}
              placeholder="Tell brands what you focus on and what your community loves..."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Niches (Comma-separated)</label>
            <input
              type="text"
              required
              value={niches}
              onChange={e => setNiches(e.target.value)}
              placeholder="e.g. Eco Home, Plant Care, Pets, Vegan"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>

          {/* Metrics & Pricing Grid */}
          <div className="grid grid-cols-3 gap-3 p-3 bg-slate-950/80 rounded-xl border border-slate-800">
            <div>
              <label className="block text-[10px] uppercase font-semibold text-slate-400 mb-1">Followers</label>
              <input
                type="number"
                min={500}
                max={100000}
                value={followers}
                onChange={e => setFollowers(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-semibold text-slate-400 mb-1">Engagement Rate (%)</label>
              <input
                type="number"
                step="0.1"
                min={1}
                max={30}
                value={engagementRate}
                onChange={e => setEngagementRate(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-emerald-400 font-mono"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-semibold text-slate-400 mb-1">Rate per Post ($)</label>
              <input
                type="number"
                min={15}
                max={500}
                value={ratePerPost}
                onChange={e => setRatePerPost(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-purple-300 font-mono"
              />
            </div>
          </div>

          {/* Barter check */}
          <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
            <input
              type="checkbox"
              checked={barterAccepted}
              onChange={e => setBarterAccepted(e.target.checked)}
              className="rounded accent-purple-500 w-4 h-4"
            />
            <span>I accept free product barter / gifted exchange for micro-brands</span>
          </label>

          {/* Recent Top Post for AI hook */}
          <div className="p-3 bg-slate-950/60 rounded-xl border border-purple-500/20 space-y-2">
            <span className="text-[11px] font-bold text-purple-300 block uppercase tracking-wider">
              Recent Viral / High-Performing Content (Hooked by AI Pitcher)
            </span>
            <input
              type="text"
              value={topPostTitle}
              onChange={e => setTopPostTitle(e.target.value)}
              placeholder="Video / Post title, e.g. Ranking 4 plant milks under $4"
              className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
            />
            <input
              type="text"
              value={topPostTopic}
              onChange={e => setTopPostTopic(e.target.value)}
              placeholder="Topic, e.g. Eco nutrition & coffee pairings"
              className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-cyan-600 to-teal-500 hover:from-cyan-500 hover:to-teal-400 text-white shadow-lg shadow-cyan-600/30 transition-all flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>Indexing with pgvector RAG...</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>Join Marketplace & Start Receiving Deals</span>
              </>
            )}
          </button>

        </form>

      </div>
    </div>
  );
};
