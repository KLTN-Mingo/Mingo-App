import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";

export async function pickProfileImage(options: {
  aspect: [number, number];
  allowsEditing?: boolean;
}): Promise<ImagePicker.ImagePickerAsset | null> {
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) {
    Alert.alert("Quyền truy cập", "Cần quyền thư viện ảnh.");
    return null;
  }
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: options.allowsEditing ?? true,
    aspect: options.aspect,
    quality: 0.85,
  });
  if (result.canceled || !result.assets[0]) return null;
  return result.assets[0];
}
