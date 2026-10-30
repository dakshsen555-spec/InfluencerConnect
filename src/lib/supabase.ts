import { createClient } from '@supabase/supabase-js';
import { Campaign, CreatorProfile, Pitch, EscrowTransaction } from '@/types';
import { INITIAL_CREATORS } from './data/creators';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Persistent Store Manager (works client-side with localStorage or in-memory)
const STORAGE_KEYS = {
  CREATORS: 'influencer_connect_creators',
  CAMPAIGNS: 'influencer_connect_campaigns',
  PITCHES: 'influencer_connect_pitches',
  ESCROWS: 'influencer_connect_escrows',
};

class LocalDataManager {
  private creators: CreatorProfile[] = [...INITIAL_CREATORS];
  private campaigns: Campaign[] = [];
  private pitches: Pitch[] = [];
  private escrows: EscrowTransaction[] = [];

  constructor() {
    this.initDemoData();
  }

  private isClient(): boolean {
    return typeof window !== 'undefined';
  }

  private initDemoData() {
    if (this.isClient()) {
      try {
        const storedCreators = localStorage.getItem(STORAGE_KEYS.CREATORS);
        if (storedCreators) {
          this.creators = JSON.parse(storedCreators);
        } else {
          localStorage.setItem(STORAGE_KEYS.CREATORS, JSON.stringify(INITIAL_CREATORS));
        }

        const storedCampaigns = localStorage.getItem(STORAGE_KEYS.CAMPAIGNS);
        if (storedCampaigns) {
          this.campaigns = JSON.parse(storedCampaigns);
        } else {
          // Seed initial demo campaign
          const demoCampaign: Campaign = {
            id: 'camp-1',
            businessId: 'biz-1',
            businessName: 'BarkPure Botanicals',
            title: 'Organic Vegan Dog Dental Chews Launch',
            productDescription: 'Handmade, eco-friendly vegan dental chew treats made with pea protein and mint in Austin, TX. Biodegradable packaging, zero artificial preservatives.',
            targetNiches: ['Pets', 'Sustainability', 'Vegan Living'],
            targetPlatforms: ['instagram', 'tiktok'],
            targetLocation: 'Austin, Texas',
            budgetPerDeliverable: 80,
            deliverablesRequired: '1 60s Reel/TikTok showing dog trying treat + 1 Story slide with promo code BARK20',
            status: 'active',
            createdAt: new Date().toISOString(),
          };
          this.campaigns = [demoCampaign];
          localStorage.setItem(STORAGE_KEYS.CAMPAIGNS, JSON.stringify(this.campaigns));
        }

        const storedPitches = localStorage.getItem(STORAGE_KEYS.PITCHES);
        if (storedPitches) {
          this.pitches = JSON.parse(storedPitches);
        }

        const storedEscrows = localStorage.getItem(STORAGE_KEYS.ESCROWS);
        if (storedEscrows) {
          this.escrows = JSON.parse(storedEscrows);
        }
      } catch (e) {
        console.warn('LocalStorage error:', e);
      }
    }
  }

  // Creators
  getCreators(): CreatorProfile[] {
    if (this.isClient()) {
      const data = localStorage.getItem(STORAGE_KEYS.CREATORS);
      if (data) return JSON.parse(data);
    }
    return this.creators;
  }

  addCreator(creator: CreatorProfile): CreatorProfile {
    this.creators.unshift(creator);
    if (this.isClient()) {
      localStorage.setItem(STORAGE_KEYS.CREATORS, JSON.stringify(this.creators));
    }
    return creator;
  }

  // Campaigns
  getCampaigns(): Campaign[] {
    if (this.isClient()) {
      const data = localStorage.getItem(STORAGE_KEYS.CAMPAIGNS);
      if (data) return JSON.parse(data);
    }
    return this.campaigns;
  }

  addCampaign(campaign: Campaign): Campaign {
    this.campaigns.unshift(campaign);
    if (this.isClient()) {
      localStorage.setItem(STORAGE_KEYS.CAMPAIGNS, JSON.stringify(this.campaigns));
    }
    return campaign;
  }

  // Pitches
  getPitches(): Pitch[] {
    if (this.isClient()) {
      const data = localStorage.getItem(STORAGE_KEYS.PITCHES);
      if (data) return JSON.parse(data);
    }
    return this.pitches;
  }

  addPitch(pitch: Pitch): Pitch {
    this.pitches.unshift(pitch);
    if (this.isClient()) {
      localStorage.setItem(STORAGE_KEYS.PITCHES, JSON.stringify(this.pitches));
    }
    return pitch;
  }

  updatePitchStatus(pitchId: string, status: Pitch['status'], contentSubmissionUrl?: string): Pitch | null {
    const list = this.getPitches();
    const idx = list.findIndex(p => p.id === pitchId);
    if (idx !== -1) {
      list[idx].status = status;
      list[idx].updatedAt = new Date().toISOString();
      if (contentSubmissionUrl) {
        list[idx].contentSubmissionUrl = contentSubmissionUrl;
      }
      this.pitches = list;
      if (this.isClient()) {
        localStorage.setItem(STORAGE_KEYS.PITCHES, JSON.stringify(list));
      }
      return list[idx];
    }
    return null;
  }

  // Escrow
  getEscrows(): EscrowTransaction[] {
    if (this.isClient()) {
      const data = localStorage.getItem(STORAGE_KEYS.ESCROWS);
      if (data) return JSON.parse(data);
    }
    return this.escrows;
  }

  fundEscrow(pitchId: string, amount: number): EscrowTransaction {
    const tx: EscrowTransaction = {
      id: `escrow-${Date.now()}`,
      pitchId,
      amount,
      status: 'held',
      fundedAt: new Date().toISOString(),
    };
    const list = this.getEscrows();
    list.unshift(tx);
    this.escrows = list;
    if (this.isClient()) {
      localStorage.setItem(STORAGE_KEYS.ESCROWS, JSON.stringify(list));
    }
    this.updatePitchStatus(pitchId, 'escrow_funded');
    return tx;
  }

  releaseEscrow(pitchId: string): EscrowTransaction | null {
    const list = this.getEscrows();
    const tx = list.find(t => t.pitchId === pitchId);
    if (tx) {
      tx.status = 'released';
      tx.releasedAt = new Date().toISOString();
      this.escrows = list;
      if (this.isClient()) {
        localStorage.setItem(STORAGE_KEYS.ESCROWS, JSON.stringify(list));
      }
      this.updatePitchStatus(pitchId, 'completed');
      return tx;
    }
    return null;
  }
}

export const localStore = new LocalDataManager();
