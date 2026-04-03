import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Return realistic mock thread data
    const threads = [
      {
        id: 'thread-1',
        subject: 'Q2 Content Strategy Review',
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        participant_count: 5,
        message_count: 23,
        status: 'active',
      },
      {
        id: 'thread-2',
        subject: 'YouTube Shorts Performance Metrics',
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        participant_count: 3,
        message_count: 12,
        status: 'active',
      },
      {
        id: 'thread-3',
        subject: 'Affiliate Program Expansion',
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        participant_count: 4,
        message_count: 18,
        status: 'resolved',
      },
    ];

    return NextResponse.json({ threads, total: threads.length });
  } catch (error) {
    console.error('Error in threads API:', error);
    return NextResponse.json({ threads: [], total: 0 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const newThread = {
      id: `thread-${Date.now()}`,
      subject: body.subject || 'New Thread',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      participant_count: 1,
      message_count: 0,
      status: 'active',
    };

    return NextResponse.json(newThread, { status: 201 });
  } catch (error) {
    console.error('Error creating thread:', error);
    return NextResponse.json({ error: 'Failed to create thread' }, { status: 400 });
  }
}
