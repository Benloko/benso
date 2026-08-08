import fs from 'fs/promises';
import path from 'path';

export interface StoryItem {
  id: string;
  title: string;
  author: {
    name: string;
    avatar: string;
    isVerified: boolean;
    handle: string;
  };
  coverImage: string;
  coverEffect?: string;
  category: string;
  format?: string;
  isPremium: boolean;
  priceFCFA?: number;
  excerpt: string;
  fullContent?: string;
  pdfUrl?: string;
  mediaUrl?: string;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  readsCount?: number;
  isLiked?: boolean;
  isBookmarked?: boolean;
  createdAt: string;
}

export interface CommentItem {
  id: string;
  storyId: string;
  author: {
    name: string;
    avatar: string;
    isVerified?: boolean;
  };
  text: string;
  createdAt: string;
  likesCount: number;
  isLiked?: boolean;
  parentId?: string | null;
  replies?: CommentItem[];
}

const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'stories.json');
const COMMENTS_FILE = path.join(DB_DIR, 'comments.json');

const INITIAL_STORIES: StoryItem[] = [
  {
    id: 'story-1',
    title: "L'Ombre du Baobab",
    author: {
      name: 'Amina Kouyaté',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      isVerified: true,
      handle: 'amina_k',
    },
    coverImage: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=1200&q=80',
    coverEffect: 'zoom',
    category: 'Conte & Légende',
    format: 'lyrique',
    isPremium: true,
    priceFCFA: 500,
    excerpt: "Sous le grand baobab centenaire du village, un secret enfoui depuis des générations s'apprête à être révélé...",
    fullContent: "Sous le grand baobab centenaire du village de Kandi, les anciens se réunissaient chaque soir au coucher du soleil. Mais ce soir-là, une étrange lumière dorée s'échappait des racines sacrées. Amina, jeune herboriste et gardienne des coutumes, s'approcha prudemment...",
    likesCount: 142,
    commentsCount: 38,
    sharesCount: 12,
    readsCount: 1250,
    isLiked: false,
    isBookmarked: true,
    createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
  },
  {
    id: 'story-2',
    title: 'Les Rois de la Rue',
    author: {
      name: 'Kofi Mensah',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      isVerified: true,
      handle: 'kofimensah',
    },
    coverImage: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1200&q=80',
    coverEffect: 'glow',
    category: 'Manga & BD',
    format: 'image',
    isPremium: false,
    excerpt: 'Dans les rues animées de Cotonou, deux amis d\'enfance rêvent de transformer leur passion pour la musique en empire...',
    fullContent: 'Cotonou, 08h00 du matin. Le marché Dantokpa s\'éveille dans une symphonie de couleurs et de bruits. Yao et Bakari branchent leurs enceintes de fortune...',
    likesCount: 89,
    commentsCount: 14,
    sharesCount: 5,
    readsCount: 840,
    isLiked: true,
    isBookmarked: false,
    createdAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
  },
  {
    id: 'story-3',
    title: 'Le Souffle des Ancêtres',
    author: {
      name: 'Fatou Sow',
      avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=150&q=80',
      isVerified: false,
      handle: 'fatousow',
    },
    coverImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
    coverEffect: 'vortex',
    category: 'Slam & Poésie',
    format: 'audio',
    isPremium: true,
    priceFCFA: 300,
    excerpt: 'Un poème engagé vibrant sur le rythme des kora et des djembe, résonnant au cœur des traditions modernes...',
    fullContent: 'Écoute le vent murmurer dans les platanes, écoute la voix des anciens qui chantent dans nos cœurs...',
    likesCount: 230,
    commentsCount: 52,
    sharesCount: 29,
    readsCount: 2100,
    isLiked: false,
    isBookmarked: false,
    createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
  },
];

async function ensureDbExists() {
  try {
    await fs.mkdir(DB_DIR, { recursive: true });
    try {
      await fs.access(DB_FILE);
    } catch {
      await fs.writeFile(DB_FILE, JSON.stringify(INITIAL_STORIES, null, 2), 'utf-8');
    }
  } catch (error) {
    console.error('Error ensuring DB directory:', error);
  }
}

export async function getStories(): Promise<StoryItem[]> {
  await ensureDbExists();
  try {
    const data = await fs.readFile(DB_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading stories from DB:', error);
    return INITIAL_STORIES;
  }
}

export async function saveStories(stories: StoryItem[]): Promise<void> {
  await ensureDbExists();
  await fs.writeFile(DB_FILE, JSON.stringify(stories, null, 2), 'utf-8');
}

export async function addStory(newStory: Omit<StoryItem, 'id' | 'createdAt' | 'likesCount' | 'commentsCount' | 'sharesCount'>): Promise<StoryItem> {
  const stories = await getStories();
  const created: StoryItem = {
    ...newStory,
    id: `story-${Date.now()}`,
    likesCount: 0,
    commentsCount: 0,
    sharesCount: 0,
    readsCount: 1,
    createdAt: new Date().toISOString(),
  };
  stories.unshift(created);
  await saveStories(stories);
  return created;
}

export async function toggleLikeStory(id: string): Promise<StoryItem | null> {
  const stories = await getStories();
  const story = stories.find((s) => s.id === id);
  if (!story) return null;

  story.isLiked = !story.isLiked;
  story.likesCount = story.isLiked ? story.likesCount + 1 : Math.max(0, story.likesCount - 1);

  await saveStories(stories);
  return story;
}

export async function toggleBookmarkStory(id: string): Promise<StoryItem | null> {
  const stories = await getStories();
  const story = stories.find((s) => s.id === id);
  if (!story) return null;

  story.isBookmarked = !story.isBookmarked;
  await saveStories(stories);
  return story;
}

export async function incrementShareStory(id: string): Promise<StoryItem | null> {
  const stories = await getStories();
  const story = stories.find((s) => s.id === id);
  if (!story) return null;

  story.sharesCount += 1;
  await saveStories(stories);
  return story;
}

const INITIAL_COMMENTS: CommentItem[] = [
  {
    id: 'comm-1',
    storyId: 'story-1',
    author: {
      name: 'Yao Kouassi',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
      isVerified: true,
    },
    text: "Magnifique conte ! La plume d'Amina nous transporte directement au cœur du village.",
    createdAt: new Date(Date.now() - 3600 * 1000).toISOString(),
    likesCount: 12,
    isLiked: false,
    parentId: null,
    replies: [
      {
        id: 'comm-1-reply-1',
        storyId: 'story-1',
        author: {
          name: 'Amina Kouyaté',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
          isVerified: true,
        },
        text: "Merci beaucoup Yao ! Très heureuse que l'histoire vous ait touché 🙏🏿✨",
        createdAt: new Date(Date.now() - 1800 * 1000).toISOString(),
        likesCount: 5,
        isLiked: true,
        parentId: 'comm-1',
      }
    ]
  },
  {
    id: 'comm-2',
    storyId: 'story-1',
    author: {
      name: 'Sékou Traoré',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
      isVerified: false,
    },
    text: "Captivant du début à la fin. J'attends le chapitre 2 avec impatience !",
    createdAt: new Date(Date.now() - 7200 * 1000).toISOString(),
    likesCount: 4,
    isLiked: false,
    parentId: null,
    replies: []
  }
];

async function ensureCommentsDbExists() {
  try {
    await fs.mkdir(DB_DIR, { recursive: true });
    try {
      await fs.access(COMMENTS_FILE);
    } catch {
      await fs.writeFile(COMMENTS_FILE, JSON.stringify(INITIAL_COMMENTS, null, 2), 'utf-8');
    }
  } catch (error) {
    console.error('Error ensuring comments DB directory:', error);
  }
}

export async function getAllComments(): Promise<CommentItem[]> {
  await ensureCommentsDbExists();
  try {
    const data = await fs.readFile(COMMENTS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading comments DB:', error);
    return INITIAL_COMMENTS;
  }
}

export async function saveComments(comments: CommentItem[]): Promise<void> {
  await ensureCommentsDbExists();
  await fs.writeFile(COMMENTS_FILE, JSON.stringify(comments, null, 2), 'utf-8');
}

export async function getCommentsForStory(storyId: string): Promise<CommentItem[]> {
  const comments = await getAllComments();
  return comments.filter((c) => c.storyId === storyId && !c.parentId);
}

export async function addCommentToStory(
  storyId: string,
  text: string,
  parentId?: string | null,
  authorName: string = 'Lecteur Passionné',
  authorAvatar: string = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'
): Promise<CommentItem> {
  const comments = await getAllComments();
  const stories = await getStories();

  const newComment: CommentItem = {
    id: `comm-${Date.now()}`,
    storyId,
    author: {
      name: authorName,
      avatar: authorAvatar,
      isVerified: true,
    },
    text,
    createdAt: new Date().toISOString(),
    likesCount: 0,
    isLiked: false,
    parentId: parentId || null,
    replies: [],
  };

  if (parentId) {
    // Threaded Reply logic
    const parentComment = comments.find((c) => c.id === parentId);
    if (parentComment) {
      if (!parentComment.replies) parentComment.replies = [];
      parentComment.replies.push(newComment);
    } else {
      comments.unshift(newComment);
    }
  } else {
    comments.unshift(newComment);
  }

  // Increment comment count on the story
  const story = stories.find((s) => s.id === storyId);
  if (story) {
    story.commentsCount += 1;
    await saveStories(stories);
  }

  await saveComments(comments);
  return newComment;
}

export async function toggleLikeComment(commentId: string): Promise<CommentItem | null> {
  const comments = await getAllComments();
  
  let targetComment: CommentItem | null = null;

  for (const c of comments) {
    if (c.id === commentId) {
      targetComment = c;
      break;
    }
    if (c.replies) {
      const reply = c.replies.find((r) => r.id === commentId);
      if (reply) {
        targetComment = reply;
        break;
      }
    }
  }

  if (!targetComment) return null;

  targetComment.isLiked = !targetComment.isLiked;
  targetComment.likesCount = targetComment.isLiked
    ? targetComment.likesCount + 1
    : Math.max(0, targetComment.likesCount - 1);

  await saveComments(comments);
  return targetComment;
}

