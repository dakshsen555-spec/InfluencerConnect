'use client';

import React, { useState } from 'react';
import { Campaign, PlatformType } from '@/types';
import { Sparkles, Wand2, Search, Sliders, DollarSign, MapPin, Check, Youtube, Instagram } from 'lucide-react';

interface CampaignCreatorProps {
  onSearch: (campaign: Campaign) => void;
  isLoading: boolean;
}

const PRESETS = [
  {
    label: '🌱 Vegan Pet Snacks (Austin)',
    title: 'Organic Vegan Dog Dental Treats',
    desc: 'Handmade, eco-friendly vegan dental chew treats made with pea protein and mint in Austin, TX. Biodegradable packaging, zero artificial ingredients.',
    niches: ['Pets', 'Sustainability', 'Vegan Living'],
    platforms: ['instagram', 'tiktok'] as PlatformType[],
    location: 'Austin, Texas',
    budget: 75,
    deliverables: '1 60s Reel/TikTok showing dog taste test + 1 Story slide with promo code BARK20',
  },
  {
    label: '☕ Specialty Coffee (Denver)',
    title: 'Single-Origin Ethiopian Cold Brew Roasters',
    desc: 'Artisanal micro-roastery specializing in single-origin light roasts for pour-over and cold brew. Transparent direct trade sourcing.',
    niches: ['Coffee & Beverage', 'Food & Dining', 'Kitchen Gadgets'],
    platforms: ['youtube', 'instagram'] as PlatformType[],
    location: 'Denver, Colorado',
    budget: 85,
    deliverables: '1 YouTube Short brewing recipe + 1 Instagram Reel tagging our roastery',
  },
  {
    label: '💻 Dev Productivity App',
    title: 'FocusFlow: Minimalist Pomodoro & Git Tracker',
    desc: 'Lightweight desktop app for software engineers and remote workers that syncs GitHub issues with 25-minute deep work intervals.',
    niches: ['Tech & Gadgets', 'Productivity', 'Remote Work', 'SaaS Tools'],
    platforms: ['youtube', 'instagram'] as PlatformType[],
    location: 'Worldwide',
    budget: 110,
    deliverables: '1 60s desk setup screen demo + 1 link in bio with coupon code FLOW30',
  },
  {
    label: '✨ Hypoallergenic Barrier Cream',
    title: 'Ceramide Barrier Recovery Balm',
    desc: 'Fragrance-free, dermatologist-formulated soothing balm for eczema-prone and sensitive skin. Zero parabens or essential oils.',
    niches: ['Skincare', 'Clean Beauty', 'Dermatology & Science'],
    platforms: ['instagram', 'tiktok'] as PlatformType[],
    location: 'Chicago, Illinois',
    budget: 100,
    deliverables: '1 TikTok ingredient breakdown + texture swatch video',
  },
];

export const CampaignCreator: React.FC<CampaignCreatorProps> = ({ onSearch, isLoading }) => {
  const [businessName, setBusinessName] = useState('GreenBite Botanicals');
  const [title, setTitle] = useState('Eco-friendly Vegan Dog Dental Chews Launch');
  const [description, setDescription] = useState(
    'Handmade, eco-friendly vegan dental chew treats made with pea protein and mint in Austin, TX. Biodegradable packaging, zero artificial preservatives.'
  );
  const [nichesInput, setNichesInput] = useState('Pets, Sustainability, Vegan Living, Austin');
  const [targetPlatforms, setTargetPlatforms] = useState<PlatformType[]>(['instagram', 'tiktok']);
  const [location, setLocation] = useState('Austin, Texas');
  const [budget, setBudget] = useState(80);
  const [deliverables, setDeliverables] = useState(
    '1 60s Reel/TikTok showing dog taste test + 1 Story slide with promo code BARK20'
  );

  const [isEnhancing, setIsEnhancing] = useState(false);
  const [aiTip, setAiTip] = useState<string | null>(null);

  const applyPreset = (preset: typeof PRESETS[0]) => {
    setTitle(preset.title);
    setDescription(preset.desc);
    setNichesInput(preset.niches.join(', '));
    setTargetPlatforms(preset.platforms);
    setLocation(preset.location);
    setBudget(preset.budget);
    setDeliverables(preset.deliverables);
    setAiTip(`Applied preset: ${preset.label}`);
  };

  const handleAiEnhance = async () => {
    if (!description.trim()) return;
    setIsEnhancing(true);
    setAiTip(null);
    try {
      const res = await fetch('/api/enhance-brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description }),
      });
      const data = await res.json();
      if (data.enhancements) {
        const enh = data.enhancements;
        setNichesInput(enh.suggestedNiches.join(', '));
        setDeliverables(enh.suggestedDeliverables);
        setBudget(enh.recommendedBudgetMin || 75);
        setAiTip(`✨ AI Insight: Recommended micro-budget ($${enh.recommendedBudgetMin}-$${enh.recommendedBudgetMax}). Target persona: ${enh.targetAudienceSummary}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsEnhancing(false);
    }
  };

  const togglePlatform = (p: PlatformType) => {
    if (targetPlatforms.includes(p)) {
      if (targetPlatforms.length > 1) {
        setTargetPlatforms(targetPlatforms.filter(item => item !== p));
      }
    } else {
      setTargetPlatforms([...targetPlatforms, p]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const campaign: Campaign = {
      id: `camp-${Date.now()}`,
      businessId: 'biz-current',
      businessName,
      title,
      productDescription: description,
      targetNiches: nichesInput.split(',').map(n => n.trim()).filter(Boolean),
      targetPlatforms,
      targetLocation: location,
      budgetPerDeliverable: budget,
      deliverablesRequired: deliverables,
      status: 'active',
      createdAt: new Date().toISOString(),
    };
    onSearch(campaign);
  };

  return (
    <div className="glass-panel rounded-2xl p-6 lg:p-8 border border-slate-800 shadow-2xl relative overflow-hidden">
      
      {/* Decorative Glow */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
              <span>Smart Campaign Matchmaker</span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-purple-500/30 text-purple-300 font-mono">
                RAG Engine
              </span>
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Describe your startup product in plain words. Our vector matchmaker finds nano-creators with the right audience, location, and micro-rate.
            </p>
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-medium text-slate-400 mr-1">Demo Briefs:</span>
            {PRESETS.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => applyPreset(p)}
                className="text-xs px-2.5 py-1 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white transition-all shadow-sm"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Small Business / Startup Name
              </label>
              <input
                type="text"
                value={businessName}
                onChange={e => setBusinessName(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-slate-900/80 border border-slate-700/80 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                placeholder="e.g. BarkPure Botanicals"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Campaign Headline
              </label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-slate-900/80 border border-slate-700/80 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                placeholder="e.g. Eco Dog Dental Treats Launch"
              />
            </div>
          </div>

          {/* Product Description with AI Enhance */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Product Description & Value Proposition (Input for RAG Vector Search)
              </label>
              <button
                type="button"
                onClick={handleAiEnhance}
                disabled={isEnhancing || !description}
                className="flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 bg-purple-500/10 hover:bg-purple-500/20 px-2.5 py-1 rounded-md border border-purple-500/30 transition-all"
              >
                <Wand2 className={`w-3.5 h-3.5 ${isEnhancing ? 'animate-spin' : ''}`} />
                <span>{isEnhancing ? 'Gemini Enhancing...' : 'AI Enhance Brief'}</span>
              </button>
            </div>
            <textarea
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 bg-slate-900/80 border border-slate-700/80 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all resize-y"
              placeholder="Describe what your product is, who it is for, ingredients/features, location, and why it stands out..."
            />
            {aiTip && (
              <div className="mt-2 text-xs text-purple-300 bg-purple-950/40 border border-purple-500/20 p-2.5 rounded-lg flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400 flex-shrink-0" />
                <span>{aiTip}</span>
              </div>
            )}
          </div>

          {/* Row of Controls: Budget, Platforms, Location */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
            
            {/* Micro-Budget Slider */}
            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                  Budget / Post
                </span>
                <span className="text-base font-bold text-emerald-400">${budget} USD</span>
              </div>
              <input
                type="range"
                min={20}
                max={250}
                step={5}
                value={budget}
                onChange={e => setBudget(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>$20 (Nano/Barter)</span>
                <span>$100</span>
                <span>$250 (Micro max)</span>
              </div>
            </div>

            {/* Target Platforms */}
            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
              <span className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2.5">
                Target Platforms
              </span>
              <div className="flex items-center gap-2">
                {(['instagram', 'tiktok', 'youtube', 'facebook'] as PlatformType[]).map(p => {
                  const active = targetPlatforms.includes(p);
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => togglePlatform(p)}
                      className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium capitalize border transition-all text-center ${
                        active
                          ? 'bg-purple-600/30 border-purple-500 text-purple-200'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {p === 'youtube' ? 'YT' : p === 'instagram' ? 'IG' : p === 'tiktok' ? 'TikTok' : 'FB'}
                    </button>
                  );
                })}
              </div>
              <p className="text-[10px] text-slate-500 mt-2">Filter creators by active channels</p>
            </div>

            {/* Location Targeting */}
            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
              <div>
                <span className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                    Target Geography
                  </span>
                  {location && location.toLowerCase() !== 'any' && (
                    <span className="text-[10px] text-emerald-400 font-mono font-semibold">Active Filter</span>
                  )}
                </span>
                <input
                  type="text"
                  list="popular-locations"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  placeholder="e.g. Austin, Texas or Denver, Colorado"
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
                <datalist id="popular-locations">
                  <option value="Austin, Texas" />
                  <option value="Denver, Colorado" />
                  <option value="Seattle, Washington" />
                  <option value="Chicago, Illinois" />
                  <option value="Brooklyn, New York" />
                  <option value="San Francisco, California" />
                  <option value="Portland, Oregon" />
                  <option value="Atlanta, Georgia" />
                  <option value="Columbus, Ohio" />
                  <option value="Salt Lake City, Utah" />
                  <option value="San Jose, California" />
                  <option value="Worldwide" />
                </datalist>

                {/* Quick City Selector Pills */}
                <div className="flex flex-wrap items-center gap-1 mt-2">
                  {['Austin, TX', 'Denver, CO', 'Seattle, WA', 'Chicago, IL', 'New York, NY', 'Any'].map(city => (
                    <button
                      key={city}
                      type="button"
                      onClick={() => setLocation(city === 'Any' ? 'Any' : city.replace(', TX', ', Texas').replace(', CO', ', Colorado').replace(', WA', ', Washington').replace(', IL', ', Illinois').replace(', NY', ', New York'))}
                      className="text-[10px] px-2 py-0.5 rounded bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors"
                    >
                      {city}
                    </button>
                  ))}
                </div>
              </div>
              <p className="text-[10px] text-slate-500 mt-2">Boosts local creators to #1 rank</p>
            </div>

          </div>

          {/* Deliverables & Niches */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Niches & Keywords (Comma-separated)
              </label>
              <input
                type="text"
                value={nichesInput}
                onChange={e => setNichesInput(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-900/80 border border-slate-700/80 rounded-xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="e.g. Pets, Sustainability, Dog Health, Austin"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Deliverables Required
              </label>
              <input
                type="text"
                value={deliverables}
                onChange={e => setDeliverables(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-900/80 border border-slate-700/80 rounded-xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="e.g. 1 60s Reel/TikTok + 1 Story link"
              />
            </div>
          </div>

          {/* Submit Search Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-6 rounded-xl font-bold text-sm bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:via-indigo-500 hover:to-cyan-400 text-white shadow-xl shadow-purple-600/25 flex items-center justify-center gap-2 transition-all transform active:scale-[0.99] disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin text-white" />
                  <span>Computing Vector Similarity & Ranking Creators...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 text-white" />
                  <span>Execute RAG Search & Match Creators</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
