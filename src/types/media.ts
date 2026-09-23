/**
 * 👑 AALM VASTRALAY — MEDIA & CDN TYPES
 * Defines strict TypeScript contracts for media resolution, CDN optimization,
 * video embedding, and multi-source media items.
 */

export type MediaSourceType =
  | "imagekit"
  | "b2"
  | "gdrive"
  | "youtube"
  | "direct"
  | "local"
  | "video";

export type ResolveOptions = {
  width?: number;
  quality?: number;
  thumbnail?: boolean;
  version?: string | number;
};

export type VideoResolveResult = {
  type: "youtube" | "file";
  url: string;
};

export type MediaItem = {
  id: string;
  url: string;
  isPrimary?: boolean;
  order?: number;
  alt?: string;
  sourceType?: MediaSourceType;
};
