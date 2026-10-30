import { Campaign, CreatorProfile, CreatorMatch, MatchScoreBreakdown } from '@/types';
import { GoogleGenerativeAI } from '@google/generative-ai';

const getApiKey = () => {
  return process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
};

/**
 * Calculates cosine similarity between two float vectors
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length || vecA.length === 0) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Generates an embedding vector using Gemini text-embedding-004.
 * Falls back to an in-memory TF-IDF semantic hash vector if no API key is set.
 */
export async function getEmbedding(text: string): Promise<number[]> {
  const apiKey = getApiKey();
  if (apiKey) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'text-embedding-004' });
      const result = await model.embedContent(text);
      if (result.embedding?.values) {
        return result.embedding.values;
      }
    } catch (err) {
      console.warn('Gemini embedding failed, using local semantic fallback vector:', err);
    }
  }

  // Local dense feature vector fallback (128 dimensions)
  return generateLocalSemanticVector(text);
}

// Fixed vocabulary features for local semantic hashing
const KEY_VOCABULARY = [
  'pet', 'dog', 'cat', 'vegan', 'plant', 'sustainability', 'eco', 'organic',
  'coffee', 'espresso', 'brew', 'cafe', 'food', 'snack', 'baking', 'sourdough',
  'skin', 'skincare', 'beauty', 'serum', 'clean', 'derma', 'hypoallergenic',
  'tech', 'gadget', 'software', 'productivity', 'desk', 'keyboard', 'saas', 'app',
  'fitness', 'workout', 'strength', 'mobility', 'training', 'health', 'wellness',
  'fashion', 'thrift', 'vintage', 'clothes', 'sustainable', 'apparel', 'styling',
  'outdoor', 'camping', 'hiking', 'nature', 'travel', 'backpack', 'adventure',
  'home', 'plant', 'interior', 'decor', 'garden', 'urban', 'apartment',
  'budget', 'cheap', 'afford', 'meal', 'prep', 'student', 'haul',
  'austin', 'denver', 'seattle', 'portland', 'chicago', 'york', 'california',
  'short', 'reel', 'tiktok', 'youtube', 'instagram', 'video', 'story', 'post',
  'small', 'startup', 'local', 'handcraft', 'artisan', 'indie', 'review',
];

function generateLocalSemanticVector(text: string): number[] {
  const tokens = text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/);
  const tokenFreq = new Map<string, number>();
  for (const t of tokens) {
    if (t.length > 2) {
      tokenFreq.set(t, (tokenFreq.get(t) || 0) + 1);
    }
  }

  const dim = 128;
  const vector = new Array(dim).fill(0);

  // Vocabulary projection
  KEY_VOCABULARY.forEach((word, idx) => {
    const freq = tokenFreq.get(word) || 0;
    if (freq > 0) {
      const pos = idx % dim;
      vector[pos] += freq * 2.5;
    }
  });

  // N-gram hash projection for unlisted words
  for (const [word, freq] of tokenFreq.entries()) {
    let hash = 0;
    for (let i = 0; i < word.length; i++) {
      hash = (hash << 5) - hash + word.charCodeAt(i);
      hash |= 0;
    }
    const bucket = Math.abs(hash) % dim;
    vector[bucket] += freq * 0.8;
  }

  // Normalize
  let norm = 0;
  for (let i = 0; i < dim; i++) norm += vector[i] * vector[i];
  norm = Math.sqrt(norm);
  if (norm > 0) {
    for (let i = 0; i < dim; i++) vector[i] /= norm;
  }

  return vector;
}

/**
 * Prepares the rich contextual text representation of a creator for embedding
 */
export function getCreatorEmbeddingText(creator: CreatorProfile): string {
  const platformsStr = Object.entries(creator.platforms)
    .map(([p, m]) => `${p} (${m?.followers} followers, ${m?.engagementRate}% engagement)`)
    .join(', ');

  const postsStr = creator.recentTopPosts.map(p => `"${p.title}" on ${p.topic}`).join('; ');

  return `
Creator Name: ${creator.name} (@${creator.username})
Location: ${creator.location}
Niches: ${creator.niches.join(', ')}
Content Style: ${creator.contentDescription}
Bio: ${creator.bio}
Platforms: ${platformsStr}
Recent Content: ${postsStr}
Rate: $${creator.ratePerPost} USD
Barter: ${creator.barterAccepted ? 'Yes accepts product exchange' : 'Cash only'}
`.trim();
}

/**
 * Prepares the campaign query text for embedding
 */
export function getCampaignEmbeddingText(campaign: Partial<Campaign>): string {
  return `
Campaign Title: ${campaign.title || ''}
Product & Brief: ${campaign.productDescription || ''}
Target Niches: ${(campaign.targetNiches || []).join(', ')}
Location Target: ${campaign.targetLocation || 'Any'}
Platforms: ${(campaign.targetPlatforms || []).join(', ')}
Budget per post: $${campaign.budgetPerDeliverable || 0}
Deliverables: ${campaign.deliverablesRequired || ''}
`.trim();
}

/**
 * Core RAG Matching Pipeline:
 * Takes a campaign and list of creators, computes semantic embeddings,
 * calculates multi-factor ranking, and returns sorted matches.
 */
export async function matchCreatorsWithCampaign(
  campaign: Campaign,
  creators: CreatorProfile[]
): Promise<CreatorMatch[]> {
  const campaignText = getCampaignEmbeddingText(campaign);
  const campaignVector = await getEmbedding(campaignText);

  const matches: CreatorMatch[] = [];

  for (const creator of creators) {
    const creatorText = getCreatorEmbeddingText(creator);
    const creatorVector = creator.embedding && creator.embedding.length === campaignVector.length
      ? creator.embedding
      : await getEmbedding(creatorText);

    // 1. Semantic Cosine Similarity (0 to 1) -> scaled to 0-100
    const rawCosSim = Math.max(0, cosineSimilarity(campaignVector, creatorVector));
    const semanticScore = Math.min(100, Math.round(rawCosSim * 100));

    // 2. Niche Alignment (Direct keyword & tag overlap)
    const campaignTokens = (
      campaign.title + ' ' +
      campaign.productDescription + ' ' +
      campaign.targetNiches.join(' ')
    ).toLowerCase();

    const matchedNiches = creator.niches.filter(n =>
      campaignTokens.includes(n.toLowerCase()) ||
      n.toLowerCase().split(' ').some(part => campaignTokens.includes(part))
    );
    const nicheAlignment = Math.min(
      100,
      Math.round((matchedNiches.length / Math.max(1, creator.niches.length)) * 100) +
      (matchedNiches.length > 0 ? 30 : 0)
    );

    // 3. Location / Geography Alignment
    let locationScore = 100;
    const targetLoc = (campaign.targetLocation || '').toLowerCase().trim();
    const isSpecificLocation =
      targetLoc.length > 0 &&
      !['any', 'worldwide', 'global', 'remote', 'all', 'none'].includes(targetLoc);

    if (isSpecificLocation) {
      const creatorLoc = creator.location.toLowerCase();
      // Tokenize locations
      const targetTokens = targetLoc.replace(/[^a-z0-9]/g, ' ').split(/\s+/).filter(t => t.length > 1);
      const creatorTokens = creatorLoc.replace(/[^a-z0-9]/g, ' ').split(/\s+/).filter(t => t.length > 1);

      // Check for exact city or token match
      const hasCityMatch = targetTokens.some(token => creatorLoc.includes(token)) ||
                           creatorTokens.some(token => targetLoc.includes(token));

      if (hasCityMatch) {
        locationScore = 100;
      } else {
        locationScore = 15; // Low score if location doesn't match requested city
      }
    }

    // 4. Budget Compatibility
    let budgetScore = 50;
    if (campaign.budgetPerDeliverable >= creator.ratePerPost) {
      // Small business pays at or above creator's asking rate -> 100%
      budgetScore = 100;
    } else {
      const ratio = campaign.budgetPerDeliverable / Math.max(1, creator.ratePerPost);
      if (creator.barterAccepted) {
        // Creator accepts product exchange/barter -> softens budget gap
        budgetScore = Math.min(95, Math.round(ratio * 70) + 25);
      } else {
        budgetScore = Math.min(80, Math.round(ratio * 80));
      }
    }

    // 5. Engagement Rate Boost
    // Nano-influencer benchmark: 3% is average, 6%+ is stellar, 9%+ is elite
    const engagementBoost = Math.min(100, Math.round((creator.avgEngagementRate / 8.0) * 85));

    // 6. Composite Weighted Score
    // If specific location is requested, give location 35% weight so local influencers rank #1
    let totalScore = 0;
    if (isSpecificLocation) {
      totalScore = Math.round(
        locationScore * 0.35 +
        semanticScore * 0.25 +
        nicheAlignment * 0.20 +
        budgetScore * 0.10 +
        engagementBoost * 0.10
      );
    } else {
      totalScore = Math.round(
        semanticScore * 0.45 +
        nicheAlignment * 0.25 +
        budgetScore * 0.15 +
        engagementBoost * 0.15
      );
    }

    // 7. Natural Language Reason & Highlights
    const highlightedKeywords: string[] = [];
    if (isSpecificLocation && locationScore >= 75) {
      highlightedKeywords.push(`📍 Local (${creator.location})`);
    }
    matchedNiches.forEach(n => highlightedKeywords.push(n));

    if (creator.ratePerPost <= campaign.budgetPerDeliverable) {
      highlightedKeywords.push(`Budget match ($${creator.ratePerPost} <= $${campaign.budgetPerDeliverable})`);
    } else if (creator.barterAccepted) {
      highlightedKeywords.push('Accepts product barter');
    }
    if (creator.avgEngagementRate >= 7.5) {
      highlightedKeywords.push(`High ${creator.avgEngagementRate}% engagement`);
    }

    let matchReason = '';
    const localPrefix = isSpecificLocation && locationScore >= 75 ? `[Local in ${creator.location}] ` : '';
    if (totalScore >= 75) {
      matchReason = `${localPrefix}Exceptional fit: ${creator.name}'s audience actively engages with ${creator.niches.slice(0, 2).join(' & ')}. Their content shows strong organic alignment with your product.`;
    } else if (totalScore >= 55) {
      matchReason = `${localPrefix}Solid match: Thematic overlap in ${creator.niches[0] || 'lifestyle'} with an authentic ${creator.avgEngagementRate}% engagement rate and micro-budget rate ($${creator.ratePerPost}).`;
    } else {
      matchReason = `Potential reach: Covers adjacent topics with an engaged micro-community of ${creator.totalReach.toLocaleString()} followers.`;
    }

    const scoreBreakdown: MatchScoreBreakdown = {
      semanticScore,
      nicheAlignment,
      locationScore,
      budgetCompatibility: budgetScore,
      engagementBoost,
      totalScore,
      matchReason,
      highlightedKeywords,
    };

    matches.push({
      creator,
      score: scoreBreakdown,
    });
  }

  // Sort by highest composite score descending
  return matches.sort((a, b) => b.score.totalScore - a.score.totalScore);
}
