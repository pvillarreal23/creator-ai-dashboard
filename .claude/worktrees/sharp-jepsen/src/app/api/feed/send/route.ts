import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const newMessage = {
      id: `msg-${Date.now()}`,
      channel: body.channel || 'general',
      sender: body.sender || 'Unknown',
      content: body.content || body.message || '',
      created_at: new Date().toISOString(),
      likes: 0,
      replies: 0,
      unread: false,
    };

    return NextResponse.json(newMessage, { status: 201 });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 400 });
  }
}
