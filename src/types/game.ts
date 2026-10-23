export interface DownloadMirror {
  id: string;
  name: string;
  url: string;
  priority: number;
  provider: string;
  status: string;
}

export interface GameReview {
  user: string;
  rating: number;
  date: string;
  text: string;
}

export interface GameUpdate {
  date: string;
  version: string;
  title: string;
  improvements?: string;
  fixes?: string;
  translation?: string;
}

export interface Game {
  id: string;
  name: string;
  version: string;
  developer: string;
  description: string;
  fullDescription?: string;
  engine?: string;
  platforms?: string[];
  languages?: string[];
  adult?: boolean;
  coverImage?: string;
  screenshots?: string[];
  sourceUrl?: string;
  downloadUrl?: string;
  downloadMirrors?: DownloadMirror[];
  archiveType?: string;
  fileName?: string;
  sizeLabel?: string;
  sizeBytes?: number;
  sha256?: string;
  genre?: string;
  category?: string;
  publishedAt?: string;
  updatedAt?: string;
  translator?: string;
  story?: string;
  gameplay?: string;
  rating?: number;
  reviewCount?: number;
  downloads?: number;
  views?: number;
  reviews?: GameReview[];
  updates?: GameUpdate[];
}

export interface LauncherInfo {
  version: string;
  channel: string;
  downloadUrl: string | null;
  notes: string;
}
