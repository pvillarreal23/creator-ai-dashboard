import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Return available tools
    const tools = [
      {
        id: 'tool-1',
        name: 'Claude AI',
        category: 'AI',
        status: 'active',
        description: 'Advanced AI assistant for content generation and analysis',
        integrations: ['all'],
      },
      {
        id: 'tool-2',
        name: 'YouTube Studio',
        category: 'Video',
        status: 'active',
        description: 'YouTube channel management and analytics',
        integrations: ['Content VP', 'Analytics VP', 'Video Editor'],
      },
      {
        id: 'tool-3',
        name: 'Notion',
        category: 'Project Management',
        status: 'active',
        description: 'Database and content planning',
        integrations: ['Content VP', 'Project Manager'],
      },
      {
        id: 'tool-4',
        name: 'GitHub',
        category: 'Development',
        status: 'active',
        description: 'Code repository and version control',
        integrations: ['Automation Engineer', 'CEO Agent'],
      },
      {
        id: 'tool-5',
        name: 'Vercel',
        category: 'Hosting',
        status: 'active',
        description: 'Web app deployment and monitoring',
        integrations: ['CEO Agent', 'Automation Engineer'],
      },
      {
        id: 'tool-6',
        name: 'Google Analytics',
        category: 'Analytics',
        status: 'active',
        description: 'Website and user behavior analytics',
        integrations: ['Analytics VP', 'Data Analyst'],
      },
    ];

    return NextResponse.json({ tools, total: tools.length });
  } catch (error) {
    console.error('Error in tools API:', error);
    return NextResponse.json({ tools: [], total: 0 });
  }
}
