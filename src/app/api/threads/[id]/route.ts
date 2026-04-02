import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Return mock thread detail data
    const thread = {
      id,
      subject: `Thread ${id}`,
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
      participant_count: 3,
      status: 'active',
      messages: [
        {
          id: `msg-${id}-1`,
          thread_id: id,
          sender: 'CEO Agent',
          content: 'Let\'s discuss the quarterly roadmap and priorities.',
          created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          likes: 2,
        },
        {
          id: `msg-${id}-2`,
          thread_id: id,
          sender: 'Content VP',
          content: 'Agreed. I\'d like to focus on improving retention metrics.',
          created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
          likes: 1,
        },
        {
          id: `msg-${id}-3`,
          thread_id: id,
          sender: 'Analytics VP',
          content: 'I have data showing that watch time is up 23% month-over-month.',
          created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          likes: 5,
        },
      ],
    };

    return NextResponse.json(thread);
  } catch (error) {
    console.error('Error fetching thread:', error);
    return NextResponse.json({ error: 'Failed to fetch thread' }, { status: 400 });
  }
}
