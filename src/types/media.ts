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

export type DeliveryStrategy = "wsrv" | "direct" | "b2" | "auto";

export type ResolveOptions = {
  width?: number;
  quality?: number;
  thumbnail?: boolean;
  version?: string | number;
  strategy?: DeliveryStrategy;
  mirroredUrl?: string;
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

export type HeroSlide = {
  id?: string;
  image: string;
  title: string;
  subtitle: string;
  badge: string;
  ctaLabel: string;
  ctaHref: string;
  cta2Label?: string;
  cta2Href?: string;
  alt: string;
  active: boolean;
  order: number;
  strategy?: DeliveryStrategy;
  mirroredUrl?: string;
  mirroredBytes?: number;
  mirroredAt?: string;
};
