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

export interface SystemRequirements {
  os?: string;
  cpu?: string;
  ram?: string;
  gpu?: string;
  storage?: string;
}

export interface Game {
  id: string;
  name: string;
  slug?: string;
  version: string;
  developer: string;
  publisher?: string;
  description: string;
  shortDescription?: string;
  fullDescription?: string;
  classification?: string;
  engine?: string;
  customEngine?: string;
  platforms?: string[];
  languages?: string[];
  translationStatus?: string;
  translatedBy?: string;
  translationNotes?: string;
  adult?: boolean;
  gameIcon?: string;
  coverImage?: string;
  bannerImage?: string;
  screenshots?: string[];
  trailerUrl?: string;
  sourceUrl?: string;
  githubUrl?: string;
  downloadUrl?: string;
  downloadMirrors?: DownloadMirror[];
  archiveType?: string;
  fileName?: string;
  mainFileName?: string;
  sizeLabel?: string;
  sizeBytes?: number;
  sha256?: string;
  systemRequirements?: SystemRequirements;
  genre?: string;
  category?: string;
  tags?: string[];
  featuredOrder?: number;
  originalReleaseDate?: string;
  publishedAt?: string;
  updatedAt?: string;
  versionNotes?: string;
  translator?: string;
  story?: string;
  gameplay?: string;
  rating?: number;
  reviewCount?: number;
  downloads?: number;
  views?: number;
  commentsCount?: number;
  reviews?: GameReview[];
  updates?: GameUpdate[];
}

export interface LauncherInfo {
  version: string;
  channel: string;
  downloadUrl: string | null;
  notes: string;
  downloads?: Partial<Record<"windows" | "linux" | "macos" | "android", {
    url: string | null;
    version?: string;
    architecture?: string;
  }>>;
}
