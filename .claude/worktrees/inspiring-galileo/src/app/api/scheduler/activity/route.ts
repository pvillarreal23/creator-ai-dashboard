import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Return realistic scheduler activity data
    const activityData = {
      timestamp: new Date().toISOString(),
      recent_activities: [
        {
          id: 'act-1',
          type: 'task_completed',
          agent: 'Content VP',
          description: 'Reviewed and approved 5 new video scripts',
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          status: 'completed',
        },
        {
          id: 'act-2',
          type: 'escalation',
          agent: 'Analytics VP',
          description: 'Video performance below target threshold',
          created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          status: 'pending',
          priority: 'high',
        },
        {
          id: 'act-3',
          type: 'task_assigned',
          agent: 'Scriptwriter',
          description: 'New script assignment for Q2 campaign',
          created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          status: 'in_progress',
        },
        {
          id: 'act-4',
          type: 'workflow_completed',
          agent: 'SEO Specialist',
          description: 'Completed keyword research for 3 new topics',
          created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
          status: 'completed',
        },
      ],
      escalations: [
        {
          id: 'esc-1',
          type: 'performance',
          title: 'Video Performance Below Target',
          description: 'Last 3 videos underperformed on YouTube',
          agent: 'Analytics VP',
          priority: 'high',
          created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        },
      ],
    };

    return NextResponse.json(activityData);
  } catch (error) {
    console.error('Error in scheduler activity API:', error);
    return NextResponse.json({ recent_activities: [], escalations: [] });
  }
}
