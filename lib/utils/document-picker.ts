import * as DocumentPicker from "expo-document-picker";

export type PickedFile = {
  uri: string;
  type: string;
  name: string | null | undefined;
};

export async function pickDocument(): Promise<PickedFile[]> {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: "*/*",
      multiple: true,
    });

    if (!result || typeof result.canceled === "undefined") {
      console.warn("Unexpected result or user exited.");
      return [];
    }
    if (result.canceled) return [];

    return result.assets.map((asset) => ({
      uri: asset.uri,
      type: asset.mimeType ?? "application/octet-stream",
      name: asset.name,
    }));
  } catch (error) {
    console.error("Error picking document:", error);
    return [];
  }
}
