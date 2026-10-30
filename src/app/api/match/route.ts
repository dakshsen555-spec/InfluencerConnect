import { NextResponse } from 'next/server';
import { matchCreatorsWithCampaign } from '@/lib/rag';
import { INITIAL_CREATORS } from '@/lib/data/creators';
import { Campaign, CreatorProfile } from '@/types';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const campaign: Campaign = body.campaign;
    const customCreators: CreatorProfile[] = body.creators || INITIAL_CREATORS;

    if (!campaign || !campaign.productDescription) {
      return NextResponse.json(
        { error: 'Campaign details and product description are required' },
        { status: 400 }
      );
    }

    const matches = await matchCreatorsWithCampaign(campaign, customCreators);
    return NextResponse.json({ matches });
  } catch (error: any) {
    console.error('Error in /api/match:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to match creators' },
      { status: 500 }
    );
  }
}
