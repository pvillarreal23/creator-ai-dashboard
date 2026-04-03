import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Return vault entries with safe, non-sensitive data
    const vaultEntries = [
      {
        id: 'cred-1',
        name: 'YouTube API',
        type: 'api_key',
        service: 'youtube',
        status: 'active',
        last_rotated: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'cred-2',
        name: 'GitHub Token',
        type: 'token',
        service: 'github',
        status: 'active',
        last_rotated: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        expires_at: new Date(Date.now() + 70 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'cred-3',
        name: 'Vercel API',
        type: 'token',
        service: 'vercel',
        status: 'active',
        last_rotated: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        expires_at: new Date(Date.now() + 75 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'cred-4',
        name: 'Claude API',
        type: 'api_key',
        service: 'anthropic',
        status: 'active',
        last_rotated: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
        expires_at: new Date(Date.now() + 65 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];

    return NextResponse.json({ credentials: vaultEntries, total: vaultEntries.length });
  } catch (error) {
    console.error('Error in vault credentials API:', error);
    return NextResponse.json({ credentials: [], total: 0 });
  }
}
