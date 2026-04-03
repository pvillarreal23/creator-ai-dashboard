import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Return scheduled tasks data
    const scheduledTasks = [
      {
        id: 'task-1',
        title: 'Weekly Content Strategy Sync',
        description: 'Review metrics and plan next week\'s content',
        assigned_to: 'Content VP',
        scheduled_for: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        priority: 'high',
        status: 'scheduled',
        recurring: 'weekly',
      },
      {
        id: 'task-2',
        title: 'Monthly Performance Report',
        description: 'Compile and analyze all channel metrics',
        assigned_to: 'Analytics VP',
        scheduled_for: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        priority: 'medium',
        status: 'scheduled',
        recurring: 'monthly',
      },
      {
        id: 'task-3',
        title: 'Thumbnail Design for Top 5 Videos',
        description: 'Create custom thumbnails for highest performing content',
        assigned_to: 'Thumbnail Designer',
        scheduled_for: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
        priority: 'medium',
        status: 'pending',
        recurring: null,
      },
      {
        id: 'task-4',
        title: 'SEO Optimization Audit',
        description: 'Check and optimize all video metadata for search',
        assigned_to: 'SEO Specialist',
        scheduled_for: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        priority: 'medium',
        status: 'scheduled',
        recurring: 'bi-weekly',
      },
    ];

    return NextResponse.json({ tasks: scheduledTasks, total: scheduledTasks.length });
  } catch (error) {
    console.error('Error in scheduler tasks API:', error);
    return NextResponse.json({ tasks: [], total: 0 });
  }
}
