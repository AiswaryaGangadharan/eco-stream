import rawData from './videos.json';

interface RawVideo {
  title: string;
  mediaUrl: string;
  thumbnailUrl: string;
  duration: string;
  impactScore: number;
}

interface RawCategory {
  category: string;
  slug: string;
  contents: RawVideo[];
}

interface Video {
  id: string;
  title: string;
  thumbnail: string;
  src: string;
  duration: string;
  impactScore: number;
  category: string;
}

interface Category {
  id: string;
  title: string;
  videos: Video[];
}

// Transform raw video content to Video
const transformVideo = (raw: RawVideo, categoryTitle: string, categorySlug: string): Video => {
  const titleSlug = raw.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return {
    id: `${categorySlug}-${titleSlug}`,
    title: raw.title,
    thumbnail: raw.thumbnailUrl,
    src: raw.mediaUrl,
    duration: raw.duration,
    impactScore: raw.impactScore,
    category: categoryTitle,
  };
};

// Group and transform into categories
export const categories: Category[] = (rawData as unknown as RawCategory[]).map((cat): Category => ({
  id: cat.slug,
  title: cat.category,
  videos: (cat.contents || []).map((rawVideo: RawVideo) => transformVideo(rawVideo, cat.category, cat.slug)),
}));

