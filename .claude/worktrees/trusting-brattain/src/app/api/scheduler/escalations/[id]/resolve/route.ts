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
      status: 'resolved',
      resolved_at: new Date().toISOString(),
      message: 'Escalation marked as resolved',
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error resolving escalation:', error);
    return NextResponse.json({ error: 'Failed to resolve escalation' }, { status: 400 });
  }
}
