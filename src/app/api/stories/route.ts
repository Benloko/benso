import { NextResponse } from 'next/server';
import { getStories, addStory } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter'); // 'all', 'free', 'premium'
    const format = searchParams.get('format'); // 'lyrique', 'image', 'video', 'audio'
    const search = searchParams.get('search');

    let stories = await getStories();

    if (filter === 'free') {
      stories = stories.filter((s) => !s.isPremium);
    } else if (filter === 'premium') {
      stories = stories.filter((s) => s.isPremium);
    }

    if (format) {
      stories = stories.filter((s) => s.format === format);
    }

    if (search) {
      const q = search.toLowerCase();
      stories = stories.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.excerpt.toLowerCase().includes(q) ||
          s.author.name.toLowerCase().includes(q) ||
          s.category.toLowerCase().includes(q)
      );
    }

    return NextResponse.json({ success: true, stories });
  } catch (error) {
    console.error('API GET /api/stories error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch stories' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, excerpt, fullContent, category, format, isPremium, priceFCFA, coverImage, coverEffect, pdfUrl, mediaUrl } = body;

    if (!title || !excerpt) {
      return NextResponse.json({ success: false, error: 'Titre et résumé requis.' }, { status: 400 });
    }

    const story = await addStory({
      title,
      excerpt,
      fullContent: fullContent || excerpt,
      category: category || 'Conte & Légende',
      format: format || 'lyrique',
      isPremium: Boolean(isPremium),
      priceFCFA: isPremium ? Number(priceFCFA) || 500 : 0,
      coverImage: coverImage || '/category_lyrique.png',
      coverEffect: coverEffect || 'zoom',
      pdfUrl,
      mediaUrl,
      author: {
        name: 'Auteur BenSo',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
        isVerified: true,
        handle: 'auteur_benso',
      },
    });

    return NextResponse.json({ success: true, story });
  } catch (error) {
    console.error('API POST /api/stories error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create story' }, { status: 500 });
  }
}
