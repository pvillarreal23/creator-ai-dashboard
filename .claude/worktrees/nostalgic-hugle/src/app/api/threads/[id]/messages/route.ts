import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    const newMessage = {
      id: `msg-${id}-${Date.now()}`,
      thread_id: id,
      sender: body.sender || 'Unknown',
      content: body.content || '',
      created_at: new Date().toISOString(),
      likes: 0,
    };

    return NextResponse.json(newMessage, { status: 201 });
  } catch (error) {
    console.error('Error creating message:', error);
    return NextResponse.json({ error: 'Failed to create message' }, { status: 400 });
  }
}
