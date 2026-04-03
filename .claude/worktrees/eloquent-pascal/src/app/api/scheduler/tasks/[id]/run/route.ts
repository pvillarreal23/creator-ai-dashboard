import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const response = {
      id,
      status: 'running',
      started_at: new Date().toISOString(),
      message: 'Task execution started',
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error running task:', error);
    return NextResponse.json({ error: 'Failed to run task' }, { status: 400 });
  }
}
