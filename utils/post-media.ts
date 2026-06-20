import type { PostMediaDto } from "@/dtos";

const VIDEO_EXTENSIONS = new Set([
  "mp4",
  "mov",
  "m4v",
  "webm",
  "mkv",
  "avi",
  "3gp",
  "m3u8",
]);

const POST_MEDIA_PREVIEW_HEIGHT = 320;
const POST_MEDIA_DETAIL_MAX_HEIGHT = 460;

function extractExtension(value?: string): string {
  if (!value) return "";

  const cleanValue = value.split("?")[0]?.split("#")[0] ?? "";
  const ext = cleanValue.split(".").pop()?.toLowerCase() ?? "";
  return ext;
}

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function asPositiveNumber(value: unknown): number | undefined {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

export function isVideoPostMedia(media?: Pick<PostMediaDto, "mediaType" | "mediaUrl"> | null): boolean {
  if (!media) return false;

  if (media.mediaType === "video") {
    return true;
  }

  return VIDEO_EXTENSIONS.has(extractExtension(media.mediaUrl));
}

export function getPostMediaPreviewHeight(
  _media?: Pick<PostMediaDto, "width" | "height"> | null
): number {
  return POST_MEDIA_PREVIEW_HEIGHT;
}

export function getPostMediaDetailHeight(
  containerWidth: number,
  media?: Pick<PostMediaDto, "width" | "height"> | null
): number {
  const width = media?.width;
  const height = media?.height;

  if (!width || !height || width <= 0 || height <= 0) {
    return containerWidth;
  }

  return Math.min(
    POST_MEDIA_DETAIL_MAX_HEIGHT,
    Math.round((containerWidth * height) / width)
  );
}

export function normalizePostMedia(raw: unknown): PostMediaDto {
  const media = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const mediaUrl =
    asString(media.mediaUrl) || asString(media.fileUrl) || asString(media.url);
  const rawType = asString(media.mediaType) || asString(media.type);
  const mediaType =
    rawType.toLowerCase() === "video" ||
    isVideoPostMedia({ mediaType: "image", mediaUrl })
      ? "video"
      : "image";
  const orderIndex = Number(media.orderIndex);
  const thumbnailUrl =
    asString(media.thumbnailUrl) ||
    asString(media.thumbnail) ||
    asString(media.previewUrl) ||
    undefined;
  const width = asPositiveNumber(media.width);
  const height = asPositiveNumber(media.height);
  const duration = asPositiveNumber(media.duration);
  const fileSize = asPositiveNumber(media.fileSize);

  return {
    id: asString(media.id) || asString(media._id),
    mediaType,
    mediaUrl,
    orderIndex: Number.isFinite(orderIndex) && orderIndex >= 0 ? orderIndex : 0,
    ...(thumbnailUrl ? { thumbnailUrl } : {}),
    ...(width ? { width } : {}),
    ...(height ? { height } : {}),
    ...(duration ? { duration } : {}),
    ...(fileSize ? { fileSize } : {}),
  };
}
