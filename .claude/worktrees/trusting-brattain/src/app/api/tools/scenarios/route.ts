import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Return tool usage scenarios
    const scenarios = [
      {
        id: 'scenario-1',
        name: 'Script Generation Pipeline',
        description: 'Automated script generation for video content',
        tools: ['Claude AI', 'Notion', 'YouTube Studio'],
        agents: ['Scriptwriter', 'Hook Specialist', 'Voice Director'],
        frequency: 'daily',
        status: 'active',
        last_run: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'scenario-2',
        name: 'Performance Analysis',
        description: 'Weekly analytics review and reporting',
        tools: ['Google Analytics', 'Notion', 'Claude AI'],
        agents: ['Analytics VP', 'Data Analyst'],
        frequency: 'weekly',
        status: 'active',
        last_run: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'scenario-3',
        name: 'Content Approval Workflow',
        description: 'Quality assurance and approval process',
        tools: ['Notion', 'Claude AI'],
        agents: ['Content VP', 'Quality Assurance Lead'],
        frequency: 'continuous',
        status: 'active',
        last_run: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'scenario-4',
        name: 'Deployment Automation',
        description: 'Automated deployment to Vercel',
        tools: ['GitHub', 'Vercel'],
        agents: ['Automation Engineer', 'CEO Agent'],
        frequency: 'on-demand',
        status: 'active',
        last_run: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      },
    ];

    return NextResponse.json({ scenarios, total: scenarios.length });
  } catch (error) {
    console.error('Error in tools scenarios API:', error);
    return NextResponse.json({ scenarios: [], total: 0 });
  }
}
