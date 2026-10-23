export type Step = 1 | 2 | 3 | 4 | 5 | 6;
export type Status = "DRAFT" | "PUBLISHED";
export type ImageInputMode = "url" | "upload";

export interface PublishFormData {
  name: string;
  shortDescription: string;
  fullDescription: string;
  developer: string;
  publisher: string;
  genre: string;
  category: string;
  version: string;
  originalReleaseDate: string;
  renplayPublishDate: string;
  lastUpdateDate: string;
  translatedBy: string;
  gameIcon: string;
  mainCover: string;
  horizontalBanner: string;
  githubUrl: string;
  screenshots: string;
  downloadUrl: string;
  downloadSize: string;
  sha256: string;
  platforms: string[];
  tags: string[];
  languages: string[];
  status: Status;
  isAdult: boolean;
  classification: string;
  engine: string;
  customEngine: string;
  releaseNotes: string;
}
