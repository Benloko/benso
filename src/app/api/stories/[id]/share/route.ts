import { NextResponse } from 'next/server';
import { incrementShareStory } from '@/lib/db';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const story = await incrementShareStory(id);
    if (!story) {
      return NextResponse.json({ success: false, error: 'Histoire introuvable' }, { status: 404 });
    }
    return NextResponse.json({ success: true, story });
  } catch (error) {
    console.error('POST /api/stories/[id]/share error:', error);
    return NextResponse.json({ success: false, error: 'Erreur lors du partage' }, { status: 500 });
  }
}
