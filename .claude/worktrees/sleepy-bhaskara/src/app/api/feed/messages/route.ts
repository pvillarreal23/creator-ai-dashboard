import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const channel = searchParams.get('channel') || 'general';

    // Return realistic feed messages
    const messages = [
      {
        id: 'msg-1',
        channel,
        sender: 'Content VP',
        content: 'Just approved 5 new scripts for this week. Quality is exceptional.',
        created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        likes: 12,
        replies: 3,
        unread: false,
      },
      {
        id: 'msg-2',
        channel,
        sender: 'Analytics VP',
        content: 'Watch time up 23% this week! Great work everyone.',
        created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        likes: 28,
        replies: 7,
        unread: false,
      },
      {
        id: 'msg-3',
        channel,
        sender: 'Monetization VP',
        content: 'New partnership deal incoming. Discussing with CEO Agent.',
        created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        likes: 18,
        replies: 5,
        unread: false,
      },
      {
        id: 'msg-4',
        channel,
        sender: 'CEO Agent',
        content: 'Q2 looks promising. Keep up the momentum.',
        created_at: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString(),
        likes: 45,
        replies: 12,
        unread: false,
      },
    ];

    const sliced = messages.slice(0, limit);
    return NextResponse.json({ messages: sliced, total: messages.length });
  } catch (error) {
    console.error('Error in feed messages API:', error);
    return NextResponse.json({ messages: [], total: 0 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const newMessage = {
      id: `msg-${Date.now()}`,
      channel: body.channel || 'general',
      sender: body.sender || 'Unknown',
      content: body.content || '',
      created_at: new Date().toISOString(),
      likes: 0,
      replies: 0,
      unread: false,
    };

    return NextResponse.json(newMessage, { status: 201 });
  } catch (error) {
    console.error('Error creating message:', error);
    return NextResponse.json({ error: 'Failed to create message' }, { status: 400 });
  }
}
