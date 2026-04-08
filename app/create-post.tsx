import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ArrowIcon, ImageIcon, VideoIcon } from "@/components/shared/icons/Icons";
import { Avatar, Text } from "@/components/ui";
import { TextArea } from "@/components/ui/TextArea";
import { getSemantic } from "@/constants/designTokens";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { PostVisibility, UpdatePostRequestDto } from "@/dtos";
import { postService } from "@/services/post.service";

const VISIBILITY_OPTIONS: { value: PostVisibility; label: string }[] = [
  { value: PostVisibility.PUBLIC, label: "Công khai" },
  { value: PostVisibility.FRIENDS, label: "Bạn bè" },
  { value: PostVisibility.BESTFRIENDS, label: "Bạn thân" },
  { value: PostVisibility.PRIVATE, label: "Chỉ mình tôi" },
];

function extractHashtags(text: string): string[] {
  const re = /#[\p{L}\p{N}_]+/gu;
  const found = text.match(re) ?? [];
  const tags = [
    ...new Set(
      found.map((t) => t.slice(1).replace(/^#+/, "").toLowerCase()).filter(Boolean)
    ),
  ];
  return tags.slice(0, 30);
}

type PickedAsset = {
  localUri: string;
  mediaType: "image" | "video";
  width?: number;
  height?: number;
  duration?: number;
  mimeType?: string | null;
  fileName?: string | null;
};

export default function CreatePostScreen() {
  const { id: editPostId } = useLocalSearchParams<{ id?: string }>();
  const isEdit = Boolean(editPostId);
  const { profile } = useAuth();
  const { colorScheme } = useTheme();
  const sem = getSemantic(colorScheme === "dark" ? "dark" : "light");

  const [contentText, setContentText] = useState("");
  const [visibility, setVisibility] = useState<PostVisibility>(PostVisibility.PUBLIC);
  const [locationName, setLocationName] = useState("");
  const [locationLat, setLocationLat] = useState("");
  const [locationLng, setLocationLng] = useState("");
  const [pendingMedia, setPendingMedia] = useState<PickedAsset[]>([]);
  const [loadingPost, setLoadingPost] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [existingMediaNote, setExistingMediaNote] = useState(false);
  const [initialContent, setInitialContent] = useState("");
  const [initialVisibility, setInitialVisibility] = useState<PostVisibility | null>(
    null
  );

  const canSubmit = useMemo(() => {
    const text = contentText.trim();
    const initialT = (initialContent ?? "").trim();
    if (isEdit) {
      if (initialVisibility === null) return false;
      return visibility !== initialVisibility || text !== initialT;
    }
    return text.length > 0 || pendingMedia.length > 0;
  }, [
    contentText,
    pendingMedia.length,
    isEdit,
    visibility,
    initialVisibility,
    initialContent,
  ]);

  const loadPost = useCallback(async () => {
    if (!editPostId) return;
    setLoadingPost(true);
    try {
      const post = await postService.getPostById(editPostId);
      if (profile?.id && post.userId !== profile.id) {
        Alert.alert("Không thể sửa", "Bạn không phải chủ bài viết.");
        router.back();
        return;
      }
      const loadedText = post.contentText ?? "";
      setContentText(loadedText);
      setInitialContent(loadedText);
      const loadedVis = post.visibility ?? PostVisibility.PUBLIC;
      setVisibility(loadedVis);
      setInitialVisibility(loadedVis);
      setLocationName(post.location?.name ?? "");
      if (post.location?.latitude != null) setLocationLat(String(post.location.latitude));
      if (post.location?.longitude != null) setLocationLng(String(post.location.longitude));
      setExistingMediaNote(Boolean(post.media && post.media.length > 0));
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Không tải được bài viết";
      Alert.alert("Lỗi", msg);
      router.back();
    } finally {
      setLoadingPost(false);
    }
  }, [editPostId, profile?.id]);

  useEffect(() => {
    if (isEdit) loadPost();
  }, [isEdit, loadPost]);

  const appendAssets = (assets: ImagePicker.ImagePickerAsset[]) => {
    const next: PickedAsset[] = assets.map((a) => ({
      localUri: a.uri,
      mediaType: a.type === "video" ? "video" : "image",
      width: a.width ?? undefined,
      height: a.height ?? undefined,
      duration: a.duration != null ? a.duration : undefined,
      mimeType: a.mimeType ?? null,
      fileName: a.fileName ?? null,
    }));
    setPendingMedia((prev) => {
      const merged = [...prev, ...next];
      return merged.slice(0, 10);
    });
  };

  const pickMedia = async (kind: "image" | "video" | "mixed") => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Quyền truy cập", "Cần quyền thư viện ảnh để đính kèm media.");
      return;
    }

    const mediaTypes =
      kind === "image"
        ? ImagePicker.MediaTypeOptions.Images
        : kind === "video"
          ? ImagePicker.MediaTypeOptions.Videos
          : ImagePicker.MediaTypeOptions.All;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes,
      allowsMultipleSelection: true,
      selectionLimit: Math.max(1, 10 - pendingMedia.length),
      quality: 0.85,
    });

    if (result.canceled || !result.assets?.length) return;
    appendAssets(result.assets);
  };

  const removePendingAt = (index: number) => {
    setPendingMedia((prev) => prev.filter((_, i) => i !== index));
  };

  const parseLocation = (): {
    locationName?: string;
    locationLatitude?: number;
    locationLongitude?: number;
  } => {
    const name = locationName.trim();
    const lat = locationLat.trim() ? Number.parseFloat(locationLat) : NaN;
    const lng = locationLng.trim() ? Number.parseFloat(locationLng) : NaN;
    const out: {
      locationName?: string;
      locationLatitude?: number;
      locationLongitude?: number;
    } = {};
    if (name) out.locationName = name;
    if (!Number.isNaN(lat)) out.locationLatitude = lat;
    if (!Number.isNaN(lng)) out.locationLongitude = lng;
    return out;
  };

  const handleSubmit = async () => {
    const text = contentText.trim();
    if (!isEdit && !text && pendingMedia.length === 0) {
      Alert.alert("Thiếu nội dung", "Thêm chữ hoặc ít nhất một ảnh/video.");
      return;
    }

    setSubmitting(true);
    try {
      if (isEdit && editPostId) {
        const payload: UpdatePostRequestDto = {};
        if (visibility !== initialVisibility) {
          payload.visibility = visibility;
        }
        if (text !== (initialContent ?? "").trim()) {
          payload.contentText = text;
        }
        if (Object.keys(payload).length === 0) {
          Alert.alert("Không có thay đổi", "Bạn chưa chỉnh sửa gì.");
          return;
        }
        if (
          payload.contentText !== undefined &&
          payload.contentText.trim().length === 0
        ) {
          Alert.alert("Nội dung", "Nội dung bài viết không được để trống.");
          return;
        }
        await postService.updatePost(editPostId, payload);
        Alert.alert("Đã lưu", "Bài viết đã được cập nhật.", [
          { text: "OK", onPress: () => router.replace(`/post/${editPostId}` as any) },
        ]);
        return;
      }

      const hashtags = extractHashtags(contentText);
      const loc = parseLocation();

      const localAssets = pendingMedia.map((p) => ({
        uri: p.localUri,
        fileName:
          p.fileName ?? (p.mediaType === "video" ? "clip.mp4" : "photo.jpg"),
        mimeType:
          p.mimeType ?? (p.mediaType === "video" ? "video/mp4" : "image/jpeg"),
      }));

      const created = await postService.createPostWithLocalMedia(
        {
          contentText: text || undefined,
          visibility,
          hashtags: hashtags.length ? hashtags : undefined,
          ...loc,
        },
        localAssets
      );

      router.replace(`/post/${created.id}` as any);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Đã xảy ra lỗi";
      Alert.alert("Không thành công", msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingPost) {
    return (
      <SafeAreaView
        className="flex-1 bg-background-light dark:bg-background-dark items-center justify-center"
        edges={["top"]}
      >
        <ActivityIndicator color={sem.primary} size="large" />
        <Text variant="muted" className="mt-3">
          Đang tải bài viết…
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      className="flex-1 bg-background-light dark:bg-background-dark"
      edges={["top"]}
    >
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
      >
        <View className="flex-row items-center px-4 py-3 border-b border-border-light dark:border-border-dark">
          <TouchableOpacity onPress={() => router.back()} className="p-1 mr-2" disabled={submitting}>
            <ArrowIcon size={22} color={sem.text} />
          </TouchableOpacity>
          <Text className="font-semibold text-lg text-text-light dark:text-text-dark flex-1">
            {isEdit ? "Sửa bài viết" : "Tạo bài viết"}
          </Text>
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={!canSubmit || submitting}
            className="px-3 py-1.5 rounded-lg bg-primary-100 opacity-100 disabled:opacity-40"
          >
            {submitting ? (
              <ActivityIndicator color={sem.onPrimary} size="small" />
            ) : (
              <Text className="text-primary-foreground-light dark:text-primary-foreground-dark font-semibold text-sm">
                {isEdit ? "Lưu" : "Đăng"}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-row items-start gap-3 mb-4">
            <Avatar
              source={profile?.avatar ? { uri: profile.avatar } : undefined}
              fallback={profile?.name}
              size="md"
              className="h-10 w-10"
            />
            <View className="flex-1">
              <Text className="font-semibold text-text-light dark:text-text-dark">
                {profile?.name ?? "Bạn"}
              </Text>
              <Text variant="muted" className="text-xs mt-0.5">
                {VISIBILITY_OPTIONS.find((v) => v.value === visibility)?.label}
              </Text>
            </View>
          </View>

          <Text className="mb-2 text-sm font-medium text-text-light dark:text-text-dark">
            Ai có thể xem?
          </Text>
          <View className="flex-row flex-wrap gap-2 mb-4">
            {VISIBILITY_OPTIONS.map((opt) => {
              const active = visibility === opt.value;
              return (
                <TouchableOpacity
                  key={opt.value}
                  onPress={() => setVisibility(opt.value)}
                  className={`px-3 py-2 rounded-full ${
                    active
                      ? "bg-primary-100"
                      : "bg-input-light dark:bg-input-dark"
                  }`}
                >
                  <Text
                    className={`text-sm font-medium ${
                      active
                        ? "text-primary-foreground-light dark:text-primary-foreground-dark"
                        : "text-text-light dark:text-text-dark"
                    }`}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TextArea
            placeholder="Bạn đang nghĩ gì? Dùng #hashtag trong nội dung nếu cần."
            value={contentText}
            onChangeText={setContentText}
            maxLength={10000}
            rows={6}
            className="min-h-[140px] border-0"
          />
          <Text variant="muted" className="text-xs mt-1 mb-4 text-right">
            {contentText.length}/10000
          </Text>

          {!isEdit && (
            <>
              <Text className="mb-2 text-sm font-medium text-text-light dark:text-text-dark">
                Địa điểm (tuỳ chọn)
              </Text>
              <TextInput
                value={locationName}
                onChangeText={setLocationName}
                placeholder="Tên địa điểm"
                placeholderTextColor={sem.placeholder}
                className="mb-2 rounded-xl px-4 py-3 font-regular text-base bg-input-light dark:bg-input-dark text-text-light dark:text-text-dark"
              />
              <View className="flex-row gap-2 mb-4">
                <TextInput
                  value={locationLat}
                  onChangeText={setLocationLat}
                  placeholder="Vĩ độ"
                  keyboardType="decimal-pad"
                  placeholderTextColor={sem.placeholder}
                  className="flex-1 rounded-xl px-4 py-3 font-regular text-base bg-input-light dark:bg-input-dark text-text-light dark:text-text-dark"
                />
                <TextInput
                  value={locationLng}
                  onChangeText={setLocationLng}
                  placeholder="Kinh độ"
                  keyboardType="decimal-pad"
                  placeholderTextColor={sem.placeholder}
                  className="flex-1 rounded-xl px-4 py-3 font-regular text-base bg-input-light dark:bg-input-dark text-text-light dark:text-text-dark"
                />
              </View>

              <Text className="mb-2 text-sm font-medium text-text-light dark:text-text-dark">
                Ảnh / video (tối đa 10)
              </Text>
              <View className="flex-row flex-wrap gap-3 mb-2">
                <TouchableOpacity
                  onPress={() => pickMedia("image")}
                  className="flex-row items-center gap-2 px-4 py-3 rounded-xl bg-input-light dark:bg-input-dark"
                >
                  <ImageIcon size={22} color={sem.textMuted} />
                  <Text className="text-text-light dark:text-text-dark">Ảnh</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => pickMedia("video")}
                  className="flex-row items-center gap-2 px-4 py-3 rounded-xl bg-input-light dark:bg-input-dark"
                >
                  <VideoIcon size={22} color={sem.textMuted} />
                  <Text className="text-text-light dark:text-text-dark">Video</Text>
                </TouchableOpacity>
              </View>
              <Text variant="muted" className="text-xs mb-3">
                Ảnh/video gửi lên{" "}
                <Text className="font-mono text-[11px]">POST /posts/{"{id}"}/media</Text> (multipart, field{" "}
                <Text className="font-mono text-[11px]">files</Text>) sau khi tạo bài — đúng Mingo API.
              </Text>

              {pendingMedia.length > 0 && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
                  <View className="flex-row gap-2">
                    {pendingMedia.map((item, index) => (
                      <View key={`${item.localUri}-${index}`} className="relative">
                        {item.mediaType === "video" ? (
                          <View className="w-24 h-24 rounded-lg bg-surface-muted-light dark:bg-surface-muted-dark items-center justify-center">
                            <VideoIcon size={32} color={sem.textMuted} />
                          </View>
                        ) : (
                          <Image
                            source={{ uri: item.localUri }}
                            style={{ width: 96, height: 96, borderRadius: 8 }}
                            contentFit="cover"
                          />
                        )}
                        <TouchableOpacity
                          onPress={() => removePendingAt(index)}
                          className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-error-light dark:bg-error-dark items-center justify-center"
                        >
                          <Text className="text-white text-xs font-bold">×</Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                </ScrollView>
              )}
            </>
          )}

          {isEdit && existingMediaNote && (
            <Text variant="muted" className="text-xs mb-2">
              Ảnh/video đã đăng giữ nguyên. Để thêm/xóa media, dùng API media trên backend hoặc tính
              năng riêng sau khi có endpoint phù hợp.
            </Text>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
