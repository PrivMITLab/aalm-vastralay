/**
 * 👑 AALM VASTRALAY — MEDIA RESOLVER DELEGATE
 * Re-exports the complete Universal Image & Media Engine from src/lib/image-resolver.ts.
 * Guarantees 100% backward compatibility for existing components.
 */

export {
  PLACEHOLDER_IMAGE,
  isVideoUrl,
  extractYouTubeId,
  resolveImage,
  resolveThumbnail,
  firstImage,
  resolveVideo,
} from "./image-resolver";

export type { ResolveOptions, VideoResolveResult, MediaItem, MediaSourceType } from "@/types/media";
