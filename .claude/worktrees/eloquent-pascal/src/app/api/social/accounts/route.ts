import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const socialAccounts = [
      // YouTube
      { id: 'yt-1', platform: 'youtube', account_name: 'theedgeai', display_name: 'The AI Edge', channel_brand: 'The AI Edge — AI & Automation (@theedgeai)', managed_by: 'ai-and-tech-channel-manager', status: 'active', followers: '47000' },
      { id: 'yt-2', platform: 'youtube', account_name: 'CashFlowCode', display_name: 'Cash Flow Code', channel_brand: 'Cash Flow Code — Business & Finance', managed_by: 'finance-and-business-channel-manager', status: 'pending_creation', followers: '—' },
      { id: 'yt-3', platform: 'youtube', account_name: 'MindShiftYT', display_name: 'Mind Shift', channel_brand: 'Mind Shift — Psychology & Behavior', managed_by: 'psychology-and-behavior-channel-manager', status: 'pending_creation', followers: '—' },
      // Instagram
      { id: 'ig-1', platform: 'instagram', account_name: 'theedgeai', display_name: 'The AI Edge', channel_brand: 'The AI Edge — AI & Automation', managed_by: 'social-media-manager', status: 'active', followers: '—' },
      { id: 'ig-2', platform: 'instagram', account_name: 'cashflowcode', display_name: 'Cash Flow Code', channel_brand: 'Cash Flow Code — Business & Finance', managed_by: 'social-media-manager', status: 'pending_creation', followers: '—' },
      { id: 'ig-3', platform: 'instagram', account_name: 'mindshift.io', display_name: 'Mind Shift', channel_brand: 'Mind Shift — Psychology & Behavior', managed_by: 'social-media-manager', status: 'pending_creation', followers: '—' },
      // TikTok
      { id: 'tt-1', platform: 'tiktok', account_name: 'theedgeai', display_name: 'The AI Edge', channel_brand: 'The AI Edge — AI & Automation', managed_by: 'shorts-and-clips-agent', status: 'active', followers: '—' },
      { id: 'tt-2', platform: 'tiktok', account_name: 'cashflowcode', display_name: 'Cash Flow Code', channel_brand: 'Cash Flow Code — Business & Finance', managed_by: 'shorts-and-clips-agent', status: 'pending_creation', followers: '—' },
      // Twitter/X
      { id: 'tw-1', platform: 'twitter', account_name: 'theedgeai', display_name: 'The AI Edge', channel_brand: 'The AI Edge — AI & Automation', managed_by: 'secretary-agent', status: 'active', followers: '—' },
      { id: 'tw-2', platform: 'twitter', account_name: 'cashflowcode', display_name: 'Cash Flow Code', channel_brand: 'Cash Flow Code — Business & Finance', managed_by: 'secretary-agent', status: 'pending_creation', followers: '—' },
      // LinkedIn
      { id: 'li-1', platform: 'linkedin', account_name: 'theedgeai', display_name: 'The AI Edge', channel_brand: 'The AI Edge — AI & Automation', managed_by: 'community-manager', status: 'active', followers: '—' },
    ];

    return NextResponse.json(socialAccounts);
  } catch (error) {
    console.error('Error in social accounts API:', error);
    return NextResponse.json([]);
  }
}
