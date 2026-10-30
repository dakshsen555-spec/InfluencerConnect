'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { CampaignCreator } from '@/components/CampaignCreator';
import { MatchCard } from '@/components/MatchCard';
import { PitchGeneratorModal } from '@/components/PitchGeneratorModal';
import { CreatorStudio } from '@/components/CreatorStudio';
import { CreatorOnboardingModal } from '@/components/CreatorOnboardingModal';
import { EscrowTracker } from '@/components/EscrowTracker';
import { Campaign, CreatorMatch, CreatorProfile, Pitch, UserRole } from '@/types';
import { localStore } from '@/lib/supabase';
import { matchCreatorsWithCampaign } from '@/lib/rag';
import { Sparkles, Filter, SlidersHorizontal, ArrowUpDown, Search, ShieldCheck, Users, Zap, CheckCircle2, MapPin } from 'lucide-react';

export default function Home() {
  const [role, setRole] = useState<UserRole>('business');
  const [creators, setCreators] = useState<CreatorProfile[]>([]);
  const [pitches, setPitches] = useState<Pitch[]>([]);
  const [matches, setMatches] = useState<CreatorMatch[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // Current active campaign for matching
  const [activeCampaign, setActiveCampaign] = useState<Campaign>({
    id: 'camp-default',
    businessId: 'biz-default',
    businessName: 'GreenBite Botanicals',
    title: 'Eco-friendly Vegan Dog Dental Chews Launch',
    productDescription: 'Handmade, eco-friendly vegan dental chew treats made with pea protein and mint in Austin, TX. Biodegradable packaging, zero artificial preservatives.',
    targetNiches: ['Pets', 'Sustainability', 'Vegan Living'],
    targetPlatforms: ['instagram', 'tiktok'],
    targetLocation: 'Austin, Texas',
    budgetPerDeliverable: 80,
    deliverablesRequired: '1 60s Reel/TikTok showing dog taste test + 1 Story slide with promo code BARK20',
    status: 'active',
    createdAt: new Date().toISOString(),
  });

  // Filters & Sorting
  const [selectedNiche, setSelectedNiche] = useState<string>('All');
  const [selectedLocation, setSelectedLocation] = useState<string>('All');
  const [onlyTargetLocation, setOnlyTargetLocation] = useState<boolean>(false);
  const [maxBudgetFilter, setMaxBudgetFilter] = useState<number>(200);
  const [onlyBarter, setOnlyBarter] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'match' | 'engagement' | 'rate' | 'reach'>('match');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [selectedPitchMatch, setSelectedPitchMatch] = useState<CreatorMatch | null>(null);
  const [isCreatorModalOpen, setIsCreatorModalOpen] = useState<boolean>(false);

  // Initialize and run initial RAG matching on mount
  useEffect(() => {
    const loadedCreators = localStore.getCreators();
    const loadedPitches = localStore.getPitches();
    setCreators(loadedCreators);
    setPitches(loadedPitches);

    runMatch(activeCampaign, loadedCreators);
  }, []);

  const runMatch = async (campaign: Campaign, creatorPool: CreatorProfile[]) => {
    setIsSearching(true);
    setActiveCampaign(campaign);
    try {
      const res = await fetch('/api/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaign, creators: creatorPool }),
      });
      const data = await res.json();
      if (data.matches) {
        setMatches(data.matches);
      } else {
        // Fallback to local computation
        const computed = await matchCreatorsWithCampaign(campaign, creatorPool);
        setMatches(computed);
      }
    } catch (err) {
      console.warn('API route fallback to local RAG:', err);
      const computed = await matchCreatorsWithCampaign(campaign, creatorPool);
      setMatches(computed);
    } finally {
      setIsSearching(false);
    }
  };

  const handleRefreshStore = () => {
    setPitches(localStore.getPitches());
    setCreators(localStore.getCreators());
  };

  const handlePitchSent = (newPitch: Pitch) => {
    handleRefreshStore();
  };

  const handleCreatorAdded = (newCreator: CreatorProfile) => {
    const updated = localStore.getCreators();
    setCreators(updated);
    runMatch(activeCampaign, updated);
  };

  // Extract distinct niches & locations for filter pills
  const allNiches = ['All', 'Pets', 'Sustainability', 'Coffee & Beverage', 'Tech & Gadgets', 'Skincare', 'Fitness', 'Sustainable Fashion', 'Food & Dining'];
  const allLocations = ['All', 'Austin, Texas', 'Denver, Colorado', 'Seattle, Washington', 'Chicago, Illinois', 'Brooklyn, New York', 'San Francisco, California', 'Portland, Oregon', 'Atlanta, Georgia', 'Columbus, Ohio', 'Salt Lake City, Utah', 'San Jose, California'];

  // Filter & Sort Matches
  const filteredMatches = matches
    .filter(({ creator }) => {
      // Geography Strict Filter (if checked)
      if (onlyTargetLocation && activeCampaign.targetLocation && !['any', 'worldwide', 'global'].includes(activeCampaign.targetLocation.toLowerCase())) {
        const targetTokens = activeCampaign.targetLocation.toLowerCase().replace(/[^a-z0-9]/g, ' ').split(/\s+/).filter(t => t.length > 2);
        const creatorLoc = creator.location.toLowerCase();
        const matchesTarget = targetTokens.some(t => creatorLoc.includes(t));
        if (!matchesTarget) return false;
      }

      // Selected Location Pill Filter
      if (selectedLocation !== 'All') {
        const targetCity = selectedLocation.toLowerCase().split(',')[0].trim();
        const creatorLoc = creator.location.toLowerCase();
        if (!creatorLoc.includes(targetCity)) {
          return false;
        }
      }

      // Niche filter
      if (selectedNiche !== 'All' && !creator.niches.some(n => n.toLowerCase().includes(selectedNiche.toLowerCase()))) {
        return false;
      }
      // Budget filter
      if (creator.ratePerPost > maxBudgetFilter) {
        return false;
      }
      // Barter filter
      if (onlyBarter && !creator.barterAccepted) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = creator.name.toLowerCase().includes(query);
        const matchesBio = creator.bio.toLowerCase().includes(query);
        const matchesLoc = creator.location.toLowerCase().includes(query);
        const matchesNiche = creator.niches.some(n => n.toLowerCase().includes(query));
        if (!matchesName && !matchesBio && !matchesLoc && !matchesNiche) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'match') return b.score.totalScore - a.score.totalScore;
      if (sortBy === 'engagement') return b.creator.avgEngagementRate - a.creator.avgEngagementRate;
      if (sortBy === 'rate') return a.creator.ratePerPost - b.creator.ratePerPost;
      if (sortBy === 'reach') return b.creator.totalReach - a.creator.totalReach;
      return 0;
    });

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      
      {/* Navbar */}
      <Navbar
        currentRole={role}
        onRoleChange={setRole}
        onOpenCreatorOnboarding={() => setIsCreatorModalOpen(true)}
        activePitchesCount={pitches.filter(p => p.status === 'sent').length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* SMALL BUSINESS / STARTUP VIEW */}
        {role === 'business' && (
          <div className="space-y-8">
            
            {/* Value Prop Banner */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-900/30 to-slate-900/50 border border-purple-500/20 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center flex-shrink-0">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">Micro & Nano Reach</h4>
                  <p className="text-xs text-slate-400">High trust, 6-11% engagement rates starting at $20-$120/post</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-900/30 to-slate-900/50 border border-cyan-500/20 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">RAG + Gemini Match</h4>
                  <p className="text-xs text-slate-400">Semantic cosine matching against content transcripts & bio embeddings</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-900/30 to-slate-900/50 border border-emerald-500/20 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">Escrow Protection</h4>
                  <p className="text-xs text-slate-400">Funds held securely; payout released only after link verification</p>
                </div>
              </div>
            </div>

            {/* Campaign Creator Form (RAG Input) */}
            <CampaignCreator
              onSearch={campaign => runMatch(campaign, creators)}
              isLoading={isSearching}
            />

            {/* Filter & Sorting Controls */}
            <div className="glass-panel p-4 rounded-2xl border border-slate-800 bg-slate-900/70 space-y-3">
              
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                
                {/* Search Bar */}
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search creators by city, topic, handle..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>

                {/* Sort & Rate Limit */}
                <div className="flex flex-wrap items-center gap-3 text-xs">
                  
                  {/* Max Rate Slider */}
                  <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
                    <span className="text-slate-400">Max Ask:</span>
                    <span className="font-mono font-bold text-purple-300">${maxBudgetFilter}</span>
                    <input
                      type="range"
                      min={30}
                      max={200}
                      step={10}
                      value={maxBudgetFilter}
                      onChange={e => setMaxBudgetFilter(Number(e.target.value))}
                      className="w-20 accent-purple-500"
                    />
                  </div>

                  {/* Barter Checkbox */}
                  <label className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 cursor-pointer text-slate-300">
                    <input
                      type="checkbox"
                      checked={onlyBarter}
                      onChange={e => setOnlyBarter(e.target.checked)}
                      className="accent-purple-500 rounded"
                    />
                    <span>Barter / Gifting only</span>
                  </label>

                  {/* Sort dropdown */}
                  <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                    <select
                      value={sortBy}
                      onChange={e => setSortBy(e.target.value as any)}
                      className="bg-transparent text-slate-200 focus:outline-none"
                    >
                      <option value="match" className="bg-slate-900">Highest RAG Match %</option>
                      <option value="engagement" className="bg-slate-900">Highest Engagement Rate</option>
                      <option value="rate" className="bg-slate-900">Lowest Rate First</option>
                      <option value="reach" className="bg-slate-900">Largest Audience</option>
                    </select>
                  </div>

                </div>

              </div>

              {/* Niche Tag Buttons */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 scrollbar-none">
                <span className="text-xs text-slate-500 mr-1 flex items-center gap-1 flex-shrink-0">
                  <Filter className="w-3 h-3" /> Niche:
                </span>
                {allNiches.map(niche => (
                  <button
                    key={niche}
                    onClick={() => setSelectedNiche(niche)}
                    className={`text-xs px-2.5 py-1 rounded-lg whitespace-nowrap transition-all ${
                      selectedNiche === niche
                        ? 'bg-purple-600 text-white font-semibold shadow-sm'
                        : 'bg-slate-950/80 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    {niche}
                  </button>
                ))}
              </div>

              {/* Geography / City Filter Strip */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-slate-800/60">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  <span className="text-xs text-slate-500 mr-1 flex items-center gap-1 flex-shrink-0">
                    <MapPin className="w-3 h-3 text-cyan-400" /> City:
                  </span>
                  {allLocations.map(loc => {
                    const isTargetMatch = activeCampaign.targetLocation && loc.toLowerCase().includes(activeCampaign.targetLocation.toLowerCase().split(',')[0]);
                    return (
                      <button
                        key={loc}
                        onClick={() => setSelectedLocation(loc)}
                        className={`text-xs px-2.5 py-1 rounded-lg whitespace-nowrap transition-all flex items-center gap-1 ${
                          selectedLocation === loc
                            ? 'bg-cyan-600 text-white font-semibold shadow-sm'
                            : isTargetMatch
                            ? 'bg-emerald-950/50 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-900/50'
                            : 'bg-slate-950/80 text-slate-400 hover:text-slate-200 border border-slate-800'
                        }`}
                      >
                        {isTargetMatch && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />}
                        <span>{loc === 'All' ? 'All Cities' : loc.split(',')[0]}</span>
                      </button>
                    );
                  })}
                </div>

                {activeCampaign.targetLocation && !['any', 'worldwide', 'global'].includes(activeCampaign.targetLocation.toLowerCase()) && (
                  <label className="flex items-center gap-1.5 text-xs text-cyan-300 bg-cyan-950/40 border border-cyan-500/30 px-2.5 py-1 rounded-lg cursor-pointer whitespace-nowrap self-start sm:self-auto">
                    <input
                      type="checkbox"
                      checked={onlyTargetLocation}
                      onChange={e => setOnlyTargetLocation(e.target.checked)}
                      className="accent-cyan-500 rounded"
                    />
                    <span>Strict: Only {activeCampaign.targetLocation.split(',')[0]}</span>
                  </label>
                )}
              </div>

            </div>

            {/* Results Grid Header */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>Matched Micro-Influencers</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-mono">
                    {filteredMatches.length} Found
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  Ranked by semantic profile alignment, engagement rates, and budget fit for "{activeCampaign.title}".
                </p>
              </div>
            </div>

            {/* Creator Cards Grid */}
            {filteredMatches.length === 0 ? (
              <div className="p-12 text-center rounded-2xl glass-panel border border-slate-800 space-y-2">
                <p className="text-sm font-semibold text-slate-300">No creators matched your current filters.</p>
                <p className="text-xs text-slate-500">Try adjusting your budget filter or selecting "All" niches.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredMatches.map(match => (
                  <MatchCard
                    key={match.creator.id}
                    match={match}
                    campaign={activeCampaign}
                    onOpenPitch={m => setSelectedPitchMatch(m)}
                  />
                ))}
              </div>
            )}

            {/* Escrow & Campaign Management Section */}
            <EscrowTracker
              pitches={pitches}
              onUpdate={handleRefreshStore}
            />

          </div>
        )}

        {/* CREATOR STUDIO VIEW */}
        {role === 'creator' && (
          <CreatorStudio
            creators={creators}
            pitches={pitches}
            onPitchUpdate={handleRefreshStore}
          />
        )}

      </main>

      {/* Pitch Generator Modal */}
      {selectedPitchMatch && (
        <PitchGeneratorModal
          match={selectedPitchMatch}
          campaign={activeCampaign}
          onClose={() => setSelectedPitchMatch(null)}
          onPitchSent={handlePitchSent}
        />
      )}

      {/* Creator Onboarding Modal */}
      <CreatorOnboardingModal
        isOpen={isCreatorModalOpen}
        onClose={() => setIsCreatorModalOpen(false)}
        onCreatorAdded={handleCreatorAdded}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 mt-12 text-center text-xs text-slate-500">
        <p>InfluencerConnect • Built with Next.js 15, Tailwind CSS, Supabase PostgreSQL, and Google Gemini AI</p>
      </footer>

    </div>
  );
}
