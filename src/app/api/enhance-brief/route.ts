import { NextResponse } from 'next/server';
import { enhanceCampaignBrief } from '@/lib/gemini';

export async function POST(req: Request) {
  try {
    const { description } = await req.json();

    if (!description || typeof description !== 'string') {
      return NextResponse.json(
        { error: 'Description text is required' },
        { status: 400 }
      );
    }

    const enhancements = await enhanceCampaignBrief(description);
    return NextResponse.json({ enhancements });
  } catch (error: any) {
    console.error('Error in /api/enhance-brief:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to enhance brief' },
      { status: 500 }
    );
  }
}
