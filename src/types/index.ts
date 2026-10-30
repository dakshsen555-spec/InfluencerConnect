export type UserRole = 'business' | 'creator';

export type PlatformType = 'youtube' | 'instagram' | 'tiktok' | 'facebook';

export interface PlatformMetric {
  handle: string;
  url: string;
  followers: number;
  avgLikes: number;
  avgComments?: number;
  engagementRate: number; // percentage, e.g. 4.8
}

export interface CreatorProfile {
  id: string;
  name: string;
  username: string;
  avatarUrl: string;
  bio: string;
  location: string;
  niches: string[];
  platforms: Partial<Record<PlatformType, PlatformMetric>>;
  totalReach: number;
  avgEngagementRate: number;
  ratePerPost: number; // in USD
  barterAccepted: boolean;
  contactEmail: string;
  sampleDeliverables: string[];
  recentTopPosts: {
    title: string;
    viewsOrLikes: string;
    url?: string;
    topic: string;
  }[];
  contentDescription: string;
  embedding?: number[];
  rating?: number;
  completedDeals?: number;
}

export interface BusinessProfile {
  id: string;
  companyName: string;
  tagline: string;
  industry: string;
  website: string;
  location: string;
  monthlyBudget: number;
  contactEmail: string;
}

export interface Campaign {
  id: string;
  businessId: string;
  businessName: string;
  title: string;
  productDescription: string;
  targetNiches: string[];
  targetPlatforms: PlatformType[];
  targetLocation?: string;
  budgetPerDeliverable: number;
  deliverablesRequired: string; // e.g. "1 YouTube Short / Reel + 1 Story with promo code"
  status: 'draft' | 'active' | 'in_progress' | 'completed';
  createdAt: string;
  embedding?: number[];
}

export interface MatchScoreBreakdown {
  semanticScore: number;     // 0 - 100
  nicheAlignment: number;    // 0 - 100
  locationScore: number;     // 0 - 100
  budgetCompatibility: number; // 0 - 100
  engagementBoost: number;   // 0 - 100
  totalScore: number;        // 0 - 100
  matchReason: string;
  highlightedKeywords: string[];
}

export interface CreatorMatch {
  creator: CreatorProfile;
  score: MatchScoreBreakdown;
}

export interface Pitch {
  id: string;
  campaignId: string;
  campaignTitle: string;
  businessId: string;
  businessName: string;
  creatorId: string;
  creatorName: string;
  creatorEmail: string;
  pitchSubject: string;
  pitchBody: string;
  deliverables: string;
  offeredAmount: number;
  status: 'draft' | 'sent' | 'negotiating' | 'accepted' | 'declined' | 'escrow_funded' | 'content_submitted' | 'completed';
  contentSubmissionUrl?: string;
  feedback?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EscrowTransaction {
  id: string;
  pitchId: string;
  amount: number;
  status: 'held' | 'released' | 'refunded';
  fundedAt: string;
  releasedAt?: string;
}
