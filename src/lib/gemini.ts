import { GoogleGenerativeAI } from '@google/generative-ai';
import { Campaign, CreatorProfile } from '@/types';

// Read API key from environment
const getApiKey = () => {
  return process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
};

/**
 * Deterministic tone-aware pitch generator
 * Used when Gemini API is offline, throttled (429 quota), or API key is pending.
 */
export function getSmartPitchTemplate(
  campaign: Campaign,
  creator: CreatorProfile,
  tone: 'friendly' | 'professional' | 'casual'
): { subject: string; body: string } {
  const topPost = creator.recentTopPosts[0] || {
    title: 'your recent creative content',
    topic: creator.niches[0] || 'lifestyle',
  };

  const productBenefit = campaign.productDescription;
  const deliverables = campaign.deliverablesRequired;
  const budget = campaign.budgetPerDeliverable;
  const barterNote = creator.barterAccepted
    ? ' plus complimentary full-sized product packages delivered directly to your doorstep'
    : '';

  if (tone === 'casual') {
    return {
      subject: `Hey ${creator.name.split(' ')[0]}! Quick question from ${campaign.businessName} 👋`,
      body: `Hey ${creator.name.split(' ')[0]}!

Big fan of your page (@${creator.username}) — your recent post on "${topPost.title}" was so good! Loved your authentic take on ${topPost.topic}.

I'm reaching out from ${campaign.businessName}. We just rolled out "${campaign.title}" (${productBenefit}) and thought of you right away. Because your followers love ${creator.niches.slice(0, 2).join(' and ')}, this feels like a super natural fit.

Here's what we'd love to partner on:
• Deliverable: ${deliverables}
• Pay: $${budget} USD (locked in InfluencerConnect escrow before you start!)${barterNote}
• Schedule: Super flexible over the next 2-3 weeks

Zero pressure at all — let me know if you'd be down to check out some samples and collaborate!

Cheers,
The ${campaign.businessName} Team`,
    };
  }

  if (tone === 'professional') {
    return {
      subject: `Brand Partnership Proposal: ${campaign.businessName} x ${creator.name}`,
      body: `Dear ${creator.name},

I hope this message finds you well.

I am writing to you on behalf of ${campaign.businessName} to propose a sponsored creator collaboration. We have been following your published work across @${creator.username}, and were particularly impressed by your recent piece: "${topPost.title}".

Our brand is currently executing a targeted campaign for "${campaign.title}" (${productBenefit}). Given your verified reach in ${creator.location} and your audience's affinity for ${creator.niches.join(', ')}, we believe a partnership would yield strong mutual value.

Proposed Collaboration Terms:
• Scope of Deliverables: ${deliverables}
• Remuneration: $${budget} USD (guaranteed via escrow deposit prior to content creation)${barterNote}
• Turnaround Window: 14 business days from product delivery

Please let us know if you are open to reviewing our campaign brief and product samples. We would be pleased to coordinate next steps.

Sincerely,
Partnerships & Marketing Team
${campaign.businessName}`,
    };
  }

  // Default: Friendly
  return {
    subject: `Loved your recent post, ${creator.name}! Collab with ${campaign.businessName} ✨`,
    body: `Hi ${creator.name}! Hope you're having a wonderful week.

I've been following your journey on @${creator.username} and especially loved your recent post on "${topPost.title}". Your thoughtful approach to ${topPost.topic} really resonated with our team.

I'm reaching out from ${campaign.businessName}. We created "${campaign.title}" to solve a real everyday problem: ${productBenefit}.

Because your community deeply values authentic recommendations in ${creator.niches.slice(0, 2).join(' & ')}, we think your audience would truly love this!

Here is what we would love to propose:
• Deliverables: ${deliverables}
• Compensation: $${budget} USD (secured via InfluencerConnect escrow protection)${barterNote}
• Timeline: At your convenience over the next 2-3 weeks

Would you be open to collaborating on this? We would be thrilled to send over a package for you to try first!

Warm regards,
The ${campaign.businessName} Team`,
  };
}

export async function generatePersonalizedPitch(
  campaign: Campaign,
  creator: CreatorProfile,
  tone: 'friendly' | 'professional' | 'casual' = 'friendly'
): Promise<{ subject: string; body: string }> {
  const apiKey = getApiKey();
  const topPost = creator.recentTopPosts[0];

  if (!apiKey) {
    return getSmartPitchTemplate(campaign, creator, tone);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    let model;
    try {
      model = genAI.getGenerativeModel({ model: 'gemini-3.8-flash' });
    } catch {
      model = genAI.getGenerativeModel({ model: 'gemini-3.1-pro-preview' });
    }

    const toneInstructions = {
      casual: "Relaxed, friendly, modern creator tone. Start with 'Hey [First Name]!'. Use upbeat phrasing, zero corporate jargon, keep it approachable and brief.",
      professional: "Formal, respectful, polished business proposal. Start with 'Dear [Full Name],'. Use terms like 'Scope of Deliverables', 'Remuneration', 'Turnaround Window'.",
      friendly: "Warm, collaborative, enthusiastic tone. Start with 'Hi [Name]!'. Highlight shared community values and genuine admiration for their content.",
    }[tone];

    const prompt = `
You are an expert influencer marketing strategist writing a high-converting personalized cold pitch email/DM to a micro/nano-creator.

SELECTED TONE: ${tone.toUpperCase()}
TONE STYLE GUIDE: ${toneInstructions}

CONTEXT:
Business Name: ${campaign.businessName}
Campaign Title: ${campaign.title}
Product Description: ${campaign.productDescription}
Budget Per Deliverable: $${campaign.budgetPerDeliverable} (paid via escrow)
Deliverables Needed: ${campaign.deliverablesRequired}

CREATOR DETAILS:
Name: ${creator.name}
Handle: @${creator.username}
Niches: ${creator.niches.join(', ')}
Location: ${creator.location}
Recent Top Post: "${topPost?.title}" (Topic: ${topPost?.topic})
Content Style: ${creator.contentDescription}

REQUIREMENTS:
1. Follow the SELECTED TONE closely. The language, greetings, and closing MUST reflect the ${tone} tone.
2. Hook them in the first 2 sentences by referencing their recent post ("${topPost?.title}") and why it felt genuine.
3. Introduce the small business and product naturally.
4. State the deliverables (${campaign.deliverablesRequired}) and offered compensation ($${campaign.budgetPerDeliverable} via secure escrow).
5. Low-pressure call to action.
6. Return JSON format with keys "subject" and "body".
`;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
      },
    });

    const text = result.response.text();
    const parsed = JSON.parse(text);
    return {
      subject: parsed.subject || `Collaboration opportunity with ${campaign.businessName}`,
      body: parsed.body || text,
    };
  } catch (err) {
    console.warn(`Gemini API call failed (${(err as any)?.message}), using smart ${tone} template:`, err);
    return getSmartPitchTemplate(campaign, creator, tone);
  }
}

export async function enhanceCampaignBrief(description: string): Promise<{
  suggestedNiches: string[];
  suggestedDeliverables: string;
  recommendedBudgetMin: number;
  recommendedBudgetMax: number;
  targetAudienceSummary: string;
}> {
  const apiKey = getApiKey();

  if (!apiKey) {
    return getFallbackEnhancements(description);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    let model;
    try {
      model = genAI.getGenerativeModel({ model: 'gemini-3.8-flash' });
    } catch {
      model = genAI.getGenerativeModel({ model: 'gemini-3.1-pro-preview' });
    }

    const prompt = `
Analyze this small business product description for an influencer campaign:
"${description}"

Extract and recommend:
1. suggestedNiches (array of 3-5 specific influencer niches)
2. suggestedDeliverables (a clear string of 1-2 realistic deliverables for micro-creators)
3. recommendedBudgetMin (number in USD, typical micro/nano rate between 40 and 150)
4. recommendedBudgetMax (number in USD, typical micro/nano rate between 80 and 250)
5. targetAudienceSummary (1 concise sentence describing the consumer persona)

Return ONLY valid JSON with keys: suggestedNiches, suggestedDeliverables, recommendedBudgetMin, recommendedBudgetMax, targetAudienceSummary.
`;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json' },
    });

    return JSON.parse(result.response.text());
  } catch (err) {
    console.warn('Gemini enhance brief failed, using heuristic fallback:', err);
    return getFallbackEnhancements(description);
  }
}

function getFallbackEnhancements(description: string) {
  const lower = description.toLowerCase();
  const niches: string[] = [];
  if (lower.includes('dog') || lower.includes('cat') || lower.includes('pet')) niches.push('Pets', 'Pet Nutrition');
  if (lower.includes('vegan') || lower.includes('eco') || lower.includes('green') || lower.includes('sustain')) niches.push('Sustainability', 'Vegan Living');
  if (lower.includes('coffee') || lower.includes('food') || lower.includes('snack') || lower.includes('brew')) niches.push('Coffee & Beverage', 'Food & Dining');
  if (lower.includes('tech') || lower.includes('app') || lower.includes('software') || lower.includes('dev')) niches.push('Tech & Gadgets', 'Productivity');
  if (lower.includes('skin') || lower.includes('beauty') || lower.includes('cream')) niches.push('Skincare', 'Clean Beauty');
  if (niches.length === 0) niches.push('Lifestyle', 'Local Community', 'Creators');

  return {
    suggestedNiches: niches,
    suggestedDeliverables: '1 60s Reel / TikTok demonstrating product + 1 Story slide with promo code link',
    recommendedBudgetMin: 50,
    recommendedBudgetMax: 120,
    targetAudienceSummary: 'Engaged niche consumers looking for authentic product recommendations.',
  };
}
