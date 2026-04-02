import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const threads = [
      {
        id: 'thread-1',
        subject: 'Q2 Content Strategy Review',
        participants: ['ceo-agent', 'content-vp', 'analytics-vp'],
        messages: [],
        status: 'active',
        updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'thread-2',
        subject: 'YouTube Shorts Performance Metrics',
        participants: ['analytics-vp', 'shorts-and-clips-agent', 'social-media-manager'],
        messages: [],
        status: 'active',
        updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'thread-3',
        subject: 'Affiliate Program Expansion',
        participants: ['monetization-vp', 'affiliate-coordinator', 'partnership-manager'],
        messages: [],
        status: 'resolved',
        updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];

    return NextResponse.json(threads);
  } catch (error) {
    console.error('Error in threads API:', error);
    return NextResponse.json([]);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const newThread = {
      id: `thread-${Date.now()}`,
      subject: body.subject || 'New Thread',
      participants: body.participants || [],
      messages: [],
      status: 'active',
      updated_at: new Date().toISOString(),
    };

    return NextResponse.json(newThread, { status: 201 });
  } catch (error) {
    console.error('Error creating thread:', error);
    return NextResponse.json({ error: 'Failed to create thread' }, { status: 400 });
  }
}
