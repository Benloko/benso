import { NextResponse } from 'next/server';
import { toggleLikeStory } from '@/lib/db';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const updated = await toggleLikeStory(id);

    if (!updated) {
      return NextResponse.json({ success: false, error: 'Histoire introuvable' }, { status: 404 });
    }

    return NextResponse.json({ success: true, story: updated });
  } catch (error) {
    console.error('API /api/stories/[id]/like error:', error);
    return NextResponse.json({ success: false, error: 'Erreur lors du like' }, { status: 500 });
  }
}
