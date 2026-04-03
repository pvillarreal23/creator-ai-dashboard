import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

function formatSubscriberCount(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  } else if (count >= 1000) {
    return `${Math.round(count / 1000)}K`;
  }
  return String(count);
}

export async function GET() {
  let aiEdgeSubs = '1';
  let aiEdgeVids = '0';

  try {
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (apiKey) {
      const res = await fetch(
        `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=UCL8YhfeYupRlfKGYh7rDjVQ&key=${apiKey}`
      );
      const data = await res.json();
      const stats = data?.items?.[0]?.statistics;
      if (stats) {
        aiEdgeSubs = formatSubscriberCount(parseInt(stats.subscriberCount, 10));
        aiEdgeVids = stats.videoCount;
      }
    }
  } catch (err) {
    console.error('Failed to fetch YouTube stats:', err);
  }

  try {
    const channels = [
      {
        id: '1',
        name: 'The AI Edge',
        handle: '@theedgeai',
        subs: aiEdgeSubs,
        views: '0',
        freq: '3x/week',
        color: 'from-blue-600 to-cyan-500',
        growth: '+12%',
        vids: aiEdgeVids,
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
