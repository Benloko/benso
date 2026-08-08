import { NextResponse } from 'next/server';
import { toggleBookmarkStory } from '@/lib/db';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const story = await toggleBookmarkStory(id);
    if (!story) {
      return NextResponse.json({ success: false, error: 'Histoire introuvable' }, { status: 404 });
    }
    return NextResponse.json({ success: true, story });
  } catch (error) {
    console.error('POST /api/stories/[id]/bookmark error:', error);
    return NextResponse.json({ success: false, error: 'Erreur lors de la sauvegarde' }, { status: 500 });
  }
}
