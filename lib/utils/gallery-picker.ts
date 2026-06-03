import { Platform } from "react-native";
import * as ImagePicker from "expo-image-picker";

export type PickedMedia = {
  uri: string;
  type: string;
  name: string | null | undefined;
};

// ✅ Thêm helper lấy MIME type đầy đủ từ uri
function getMimeType(uri: string, fallbackType?: string | null): string {
  const ext = uri.split(".").pop()?.toLowerCase();
  const mimeMap: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
    heic: "image/heic",
    mp4: "video/mp4",
    mov: "video/quicktime",
    avi: "video/x-msvideo",
    mkv: "video/x-matroska",
  };
  if (ext && mimeMap[ext]) return mimeMap[ext];
  if (fallbackType === "video") return "video/mp4";
  return "image/jpeg";
}

export async function pickMedia(): Promise<PickedMedia[]> {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== "granted") {
    alert("Permission is required to access media library!");
    return [];
  }

  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images", "videos"],
      allowsEditing: false,
      quality: 1,
      allowsMultipleSelection: true,
    });

    if (!result || typeof result.canceled === "undefined") return [];
    if (result.canceled) return [];

    return result.assets.map((asset) => ({
      uri: asset.uri,
      // ✅ Dùng mimeType nếu có, fallback sang helper
      type: asset.mimeType ?? getMimeType(asset.uri, asset.type),
      name: asset.fileName ?? asset.uri.split("/").pop() ?? "file",
    }));
  } catch (error) {
    console.error("Error selecting media:", error);
    return [];
  }
}

export async function pickFromCamera(): Promise<PickedMedia | null> {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status !== "granted") {
    alert("Camera permission is required!");
    return null;
  }

  try {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      allowsEditing: false,
      quality: 1,
    });

    if (!result || result.canceled || !result.assets[0]) return null;

    const asset = result.assets[0];
    
    // 1. Chuẩn hóa URI: Đảm bảo luôn có tiền tố file:// đúng chuẩn hệ điều hành
    let cleanUri = asset.uri;
    if (Platform.OS === "android" && !cleanUri.startsWith("file://")) {
      cleanUri = `file://${cleanUri}`;
    }

    // 2. Xác định phần mở rộng (extension) để làm tên file và định dạng MIME chuẩn
    const filename = asset.fileName ?? cleanUri.split("/").pop() ?? "photo.jpg";
    const ext = filename.split(".").pop()?.toLowerCase() ?? "jpg";
    
    // Định nghĩa MIME type an toàn tuyệt đối cho ảnh chụp từ camera
    const mimeType = asset.mimeType ?? `image/${ext === "png" ? "png" : "jpeg"}`;

    return {
      uri: cleanUri,
      type: mimeType,
      name: filename,
    };
  } catch (error) {
    console.error("Error opening camera:", error);
    return null;
  }
}
