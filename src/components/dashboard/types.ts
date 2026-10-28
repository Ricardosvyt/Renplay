export type DashboardTab = "overview" | "games" | "saves" | "users" | "advertising" | "settings";

export interface GameItem {
  id: string;
  title: string;
  developer: string;
  category: string;
  genre: string;
  version: string;
  engine: string;
  adult: boolean;
  coverUrl: string;
  downloadUrl: string;
  downloads: number;
  status: "PUBLISHED" | "PENDING_REVIEW" | "DRAFT" | "SUSPENDED" | "ARCHIVED";
  lastUpdate: string;
}

export type DashboardGameItem = GameItem;

export interface UserItem {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "DEVELOPER" | "MODERATOR" | "TRANSLATOR" | "VIP" | "USUARIO" | string;
  status: "ACTIVE" | "PENDING";
  joinedDate: string;
  verificationLevel?: number;
}

export type TeamMember = UserItem;
