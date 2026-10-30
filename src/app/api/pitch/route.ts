import { NextResponse } from 'next/server';
import { generatePersonalizedPitch } from '@/lib/gemini';
import { Campaign, CreatorProfile } from '@/types';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { campaign, creator, tone } = body as {
      campaign: Campaign;
      creator: CreatorProfile;
      tone?: 'friendly' | 'professional' | 'casual';
    };

    if (!campaign || !creator) {
      return NextResponse.json(
        { error: 'Campaign and creator profile are required' },
        { status: 400 }
      );
    }

    const pitch = await generatePersonalizedPitch(campaign, creator, tone || 'friendly');
    return NextResponse.json({ pitch });
  } catch (error: any) {
    console.error('Error in /api/pitch:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to generate personalized pitch' },
      { status: 500 }
    );
  }
}
