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

function extractExtension(value?: string): string {
  if (!value) return "";

  const cleanValue = value.split("?")[0]?.split("#")[0] ?? "";
  const ext = cleanValue.split(".").pop()?.toLowerCase() ?? "";
  return ext;
}

export function isVideoPostMedia(media?: Pick<PostMediaDto, "mediaType" | "mediaUrl"> | null): boolean {
  if (!media) return false;

  if (media.mediaType === "video") {
    return true;
  }

  return VIDEO_EXTENSIONS.has(extractExtension(media.mediaUrl));
}
