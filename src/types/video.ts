export interface Video {
  id: string;
  title: string;
  description?: string;
  thumbnail: string;
  src: string;
  duration?: string | number;
  category?: string;
  index?: number;
  impactScore?: number;
}

export interface Category {
  id: string;
  title: string;
  videos: Video[];
}

export interface ExtendedVideo extends Video {
  index: number;
}
