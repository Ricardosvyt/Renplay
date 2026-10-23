export type Step = 1 | 2 | 3 | 4 | 5 | 6;
export type Status = "DRAFT" | "PUBLISHED" | "SUSPENDED";
export type ImageInputMode = "url" | "upload";

export interface SystemRequirements {
  os: string;
  cpu: string;
  ram: string;
  gpu: string;
  storage: string;
}

export interface DownloadMirror {
  id: string;
  name: string;
  url: string;
  priority: number;
  provider: string;
  status: string;
}

export interface PublishFormData {
  // 1. Informações básicas
  name: string;
  slug: string;
  developer: string;
  publisher: string;
  genre: string;
  category: string;
  tags: string[];
  shortDescription: string;
  fullDescription: string;
  classification: string;
  engine: string;
  customEngine: string;

  // 2. Imagens e mídia
  gameIcon: string;
  mainCover: string;
  horizontalBanner: string;
  screenshots: string;
  trailerUrl: string;
  githubUrl: string;

  // 3. Download e instalação
  version: string;
  platforms: string[];
  downloadUrl: string;
  downloadMirrors: DownloadMirror[];
  mainFileName: string;
  fileSize: string;
  sha256: string;
  systemRequirements: SystemRequirements;

  // 4. Idiomas e traduções
  languages: string[];
  translationStatus: string;
  translatedBy: string;
  translationNotes: string;

  // 5. Publicação
  status: Status;
  originalReleaseDate: string;
  renplayPublishDate: string;
  lastUpdateDate: string;
  featuredOrder: number;
  releaseNotes: string;

  // Governança / Equipe
  responsibleDev: string;
  responsibleTranslator: string;
  editPermissions: string;
  scheduledPublishDate: string;
  changeLog: string;
}
