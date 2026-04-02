import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const channels = [
      {
        id: '1',
        name: 'AgentIQ',
        subs: '0',
        views: '0',
        freq: '3x/week',
        color: 'from-blue-600 to-cyan-500',
        growth: '+0%',
        vids: '0',
        ctr: '0%',
        revenue: '$0',
        nextVideo: 'Apr 2',
      },
      {
        id: '2',
        name: 'Cash Flow Code',
        subs: '—',
        views: '—',
        freq: '2x/week',
        color: 'from-green-600 to-emerald-500',
        growth: '—',
        vids: '—',
        ctr: '—',
        revenue: '—',
        nextVideo: 'Month 7',
      },
      {
        id: '3',
        name: 'Mind Shift',
        subs: '—',
        views: '—',
        freq: '1x/week',
        color: 'from-purple-600 to-pink-500',
        growth: '—',
        vids: '—',
        ctr: '—',
        revenue: '—',
        nextVideo: 'Month 13',
      },
    ];

    return NextResponse.json(channels);
  } catch (error) {
    console.error('Error in channels API:', error);
    return NextResponse.json([]);
  }
}
