import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Return social media accounts data
    const socialAccounts = [
      {
        id: 'social-1',
        platform: 'YouTube',
        username: 'theedgeai',
        handle: '@theedgeai',
        status: 'active',
        followers: 125000,
        engaged_24h: 8500,
        last_post: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'social-2',
        platform: 'Instagram',
        username: 'agentiq.ai',
        handle: '@agentiq.ai',
        status: 'active',
        followers: 45000,
        engaged_24h: 3200,
        last_post: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'social-3',
        platform: 'TikTok',
        username: 'agentiq_shorts',
        handle: '@agentiq_shorts',
        status: 'active',
        followers: 78000,
        engaged_24h: 5600,
        last_post: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'social-4',
        platform: 'Twitter/X',
        username: 'agentiq_ai',
        handle: '@agentiq_ai',
        status: 'active',
        followers: 32000,
        engaged_24h: 2100,
        last_post: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'social-5',
        platform: 'LinkedIn',
        username: 'agentiq',
        handle: 'agentiq',
        status: 'active',
        followers: 18000,
        engaged_24h: 900,
        last_post: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      },
    ];

    return NextResponse.json({ accounts: socialAccounts, total: socialAccounts.length });
  } catch (error) {
    console.error('Error in social accounts API:', error);
    return NextResponse.json({ accounts: [], total: 0 });
  }
}
