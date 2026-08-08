import { NextResponse } from 'next/server';
import { getCommentsForStory, addCommentToStory } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const comments = await getCommentsForStory(id);
    return NextResponse.json({ success: true, comments });
  } catch (error) {
    console.error('GET /api/stories/[id]/comments error:', error);
    return NextResponse.json({ success: false, error: 'Erreur chargement commentaires' }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { text, parentId, authorName, authorAvatar } = body;

    if (!text || !text.trim()) {
      return NextResponse.json({ success: false, error: 'Texte du commentaire obligatoire' }, { status: 400 });
    }

    const comment = await addCommentToStory(id, text.trim(), parentId, authorName, authorAvatar);
    return NextResponse.json({ success: true, comment });
  } catch (error) {
    console.error('POST /api/stories/[id]/comments error:', error);
    return NextResponse.json({ success: false, error: 'Erreur ajout commentaire' }, { status: 500 });
  }
}
