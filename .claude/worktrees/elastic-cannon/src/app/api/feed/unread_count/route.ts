import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const channel = searchParams.get('channel');

    if (channel) {
      return NextResponse.json({ channel, unread_count: 3 });
    }

    // Return unread count for all channels
    const unreadData = {
      total: 12,
      by_channel: {
        general: 5,
        announcements: 3,
        content: 2,
        analytics: 2,
      },
    };

    return NextResponse.json(unreadData);
  } catch (error) {
    console.error('Error in unread count API:', error);
    return NextResponse.json({ total: 0, by_channel: {} });
  }
}

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const channel = searchParams.get('channel');

    const response = {
      status: 'marked_read',
      channel: channel || 'all',
      marked_at: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error marking messages as read:', error);
    return NextResponse.json({ error: 'Failed to mark as read' }, { status: 400 });
  }
}
