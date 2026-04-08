import * as ImagePicker from "expo-image-picker";
import { Stack, router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button, Input, Text, TextArea } from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import { Gender } from "@/dtos";
import { userService } from "@/services/user.service";
import { colors } from "@/styles/colors";

function toDateInputValue(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

export default function EditProfileScreen() {
  const { profile, setProfile } = useAuth();
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState<Gender | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<"avatar" | "background" | null>(
    null
  );

  const syncAuthFromProfile = useCallback(
    (u: Awaited<ReturnType<typeof userService.getCurrentUser>>) => {
      setProfile({
        id: u.id,
        phoneNumber: u.phoneNumber,
        name: u.name,
        avatar: u.avatar,
        role: u.role,
        verified: u.verified,
      });
    },
    [setProfile]
  );

  const load = useCallback(async () => {
    try {
      const u = await userService.getCurrentUser();
      setName(u.name ?? "");
      setBio(u.bio ?? "");
      setDateOfBirth(toDateInputValue(u.dateOfBirth));
      setGender(u.gender);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Không tải được hồ sơ";
      Alert.alert("Lỗi", msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const pickImage = async (): Promise<ImagePicker.ImagePickerAsset | null> => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Quyền truy cập", "Cần quyền thư viện ảnh.");
      return null;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });
    if (result.canceled || !result.assets[0]) return null;
    return result.assets[0];
  };

  const handleUploadAvatar = async () => {
    const asset = await pickImage();
    if (!asset) return;
    setUploading("avatar");
    try {
      const updated = await userService.uploadAvatar({
        uri: asset.uri,
        fileName: asset.fileName ?? `avatar_${Date.now()}.jpg`,
        mimeType: asset.mimeType ?? "image/jpeg",
      });
      syncAuthFromProfile(updated);
      Alert.alert("Thành công", "Đã cập nhật ảnh đại diện.");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Upload thất bại";
      Alert.alert("Lỗi", msg);
    } finally {
      setUploading(null);
    }
  };

  const handleUploadBackground = async () => {
    const asset = await pickImage();
    if (!asset) return;
    setUploading("background");
    try {
      const updated = await userService.uploadBackground({
        uri: asset.uri,
        fileName: asset.fileName ?? `cover_${Date.now()}.jpg`,
        mimeType: asset.mimeType ?? "image/jpeg",
      });
      syncAuthFromProfile(updated);
      Alert.alert("Thành công", "Đã cập nhật ảnh bìa.");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Upload thất bại";
      Alert.alert("Lỗi", msg);
    } finally {
      setUploading(null);
    }
  };

  const handleSave = async () => {
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      Alert.alert("Lỗi", "Tên cần ít nhất 2 ký tự.");
      return;
    }
    let dobIso: string | undefined;
    if (dateOfBirth.trim()) {
      const d = new Date(dateOfBirth.trim());
      if (Number.isNaN(d.getTime()) || d > new Date()) {
        Alert.alert("Lỗi", "Ngày sinh không hợp lệ.");
        return;
      }
      dobIso = d.toISOString();
    }
    setSaving(true);
    try {
      const updated = await userService.updateProfile({
        name: trimmed,
        bio: bio.trim() || undefined,
        dateOfBirth: dobIso,
        gender,
      });
      syncAuthFromProfile(updated);
      Alert.alert("Thành công", "Đã lưu hồ sơ.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Không lưu được";
      Alert.alert("Lỗi", msg);
    } finally {
      setSaving(false);
    }
  };

  if (!profile) {
    return null;
  }

  return (
    <SafeAreaView
      className="flex-1 bg-background-light dark:bg-background-dark"
      edges={["bottom"]}
    >
      <Stack.Screen
        options={{
          title: "Chỉnh sửa hồ sơ",
          headerBackTitle: "Quay lại",
        }}
      />
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.primary[100]} />
        </View>
      ) : (
        <ScrollView
          className="flex-1 px-4 pt-2"
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 32 }}
        >
          <View className="gap-3 mb-6">
            <Button
              variant="outline"
              onPress={handleUploadAvatar}
              loading={uploading === "avatar"}
              disabled={uploading !== null}
            >
              Đổi ảnh đại diện
            </Button>
            <Button
              variant="outline"
              onPress={handleUploadBackground}
              loading={uploading === "background"}
              disabled={uploading !== null}
            >
              Đổi ảnh bìa
            </Button>
          </View>

          <View className="gap-4">
            <View>
              <Text variant="muted" className="mb-1">
                Họ tên <Text className="text-red-500">*</Text>
              </Text>
              <Input
                value={name}
                onChangeText={setName}
                placeholder="Tên hiển thị"
                autoCapitalize="words"
              />
            </View>

            <TextArea
              label="Giới thiệu"
              value={bio}
              onChangeText={setBio}
              placeholder="Bio (tối đa 500 ký tự)"
              rows={4}
            />

            <View>
              <Text variant="muted" className="mb-1">
                Ngày sinh (YYYY-MM-DD)
              </Text>
              <Input
                value={dateOfBirth}
                onChangeText={setDateOfBirth}
                placeholder="1990-01-01"
              />
            </View>

            <View>
              <Text variant="muted" className="mb-2">
                Giới tính
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {(
                  [
                    { v: Gender.MALE, label: "Nam" },
                    { v: Gender.FEMALE, label: "Nữ" },
                    { v: Gender.OTHER, label: "Khác" },
                  ] as const
                ).map(({ v, label }) => (
                  <TouchableOpacity
                    key={v}
                    onPress={() => setGender(gender === v ? undefined : v)}
                    className={`px-4 py-2 rounded-full border ${
                      gender === v
                        ? "bg-primary-100 border-primary-100"
                        : "bg-input-light dark:bg-input-dark border-border-light dark:border-border-dark"
                    }`}
                  >
                    <Text
                      className={
                        gender === v
                          ? "text-primary-foreground-light font-semibold"
                          : "text-text-light dark:text-text-dark"
                      }
                    >
                      {label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          <Button
            className="mt-8"
            onPress={handleSave}
            loading={saving}
            disabled={uploading !== null}
          >
            Lưu thay đổi
          </Button>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
