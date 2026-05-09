import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  ArrowIcon,
  ImageIcon,
  VideoIcon,
} from "@/components/shared/icons/Icons";
import { LocationPickerModal } from "@/components/post/LocationPickerModal";
import { TagFriendsModal } from "@/components/post/TagFriendsModal";
import { Avatar, Button, Text } from "@/components/ui";
import { TextArea } from "@/components/ui/TextArea";
import { getSemantic } from "@/constants/designTokens";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import {
  PostVisibility,
  UpdatePostRequestDto,
  UserMinimalDto,
} from "@/dtos";
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

interface RowSectionProps {
  iconName: keyof typeof Ionicons.glyphMap;
  label: string;
  trailing?: React.ReactNode;
  onPress?: () => void;
  iconColor: string;
  textColor: string;
}

function RowSection({
  iconName,
  label,
  trailing,
  onPress,
  iconColor,
  textColor,
}: RowSectionProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={onPress ? 0.65 : 1}
      disabled={!onPress}
      className="flex-row items-center py-3"
    >
      <Ionicons name={iconName} size={22} color={iconColor} />
      <Text
        className="ml-3 flex-1 text-base font-medium"
        style={{ color: textColor }}
      >
        {label}
      </Text>
      {trailing}
    </TouchableOpacity>
  );
}

export default function CreatePostScreen() {
  const { id: editPostId } = useLocalSearchParams<{ id?: string }>();
  const isEdit = Boolean(editPostId);
  const { profile } = useAuth();
  const { colorScheme } = useTheme();
  const sem = getSemantic(colorScheme === "dark" ? "dark" : "light");
  const dropdownChevronColor = sem.textMuted;

  const [contentText, setContentText] = useState("");
  const [visibility, setVisibility] = useState<PostVisibility>(
    PostVisibility.PUBLIC
  );
  const [locationName, setLocationName] = useState("");
  const [pendingMedia, setPendingMedia] = useState<PickedAsset[]>([]);
  const [taggedFriends, setTaggedFriends] = useState<UserMinimalDto[]>([]);
  const [loadingPost, setLoadingPost] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [existingMediaNote, setExistingMediaNote] = useState(false);
  const [initialContent, setInitialContent] = useState("");
  const [initialVisibility, setInitialVisibility] = useState<PostVisibility | null>(
    null
  );
  const [tagFriendsOpen, setTagFriendsOpen] = useState(false);
  const [locationPickerOpen, setLocationPickerOpen] = useState(false);

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

  const handleAddMedia = () => {
    if (pendingMedia.length >= 10) {
      Alert.alert("Đã đủ", "Tối đa 10 ảnh/video cho mỗi bài viết.");
      return;
    }
    Alert.alert("Add media", undefined, [
      { text: "Photos", onPress: () => pickMedia("image") },
      { text: "Videos", onPress: () => pickMedia("video") },
      { text: "Mixed", onPress: () => pickMedia("mixed") },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const removePendingAt = (index: number) => {
    setPendingMedia((prev) => prev.filter((_, i) => i !== index));
  };

  const removeTaggedFriend = (id: string) => {
    setTaggedFriends((prev) => prev.filter((u) => u.id !== id));
  };

  const parseLocation = (): { locationName?: string } => {
    const name = locationName.trim();
    return name ? { locationName: name } : {};
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
      const mentions = taggedFriends.map((u) => u.id);

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
          mentions: mentions.length ? mentions : undefined,
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
          <TouchableOpacity
            onPress={() => router.back()}
            className="p-1 mr-2"
            disabled={submitting}
          >
            <ArrowIcon size={22} color={sem.text} />
          </TouchableOpacity>
          <Text className="font-semibold text-lg text-text-light dark:text-text-dark flex-1">
            {isEdit ? "Sửa bài viết" : "Tạo bài viết"}
          </Text>
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* User row */}
          <View className="flex-row items-center gap-3 mb-3">
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
            </View>
          </View>

          {/* Caption */}
          <TextArea
            placeholder="Bạn đang nghĩ gì? Dùng #hashtag trong nội dung nếu cần."
            value={contentText}
            onChangeText={setContentText}
            maxLength={10000}
            rows={3}
            className="min-h-[80px] border-0 px-0"
          />

          {/* Media gallery preview */}
          {(pendingMedia.length > 0 || existingMediaNote) && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="my-3"
            >
              <View className="flex-row gap-2">
                {existingMediaNote && (
                  <View className="w-32 h-40 rounded-xl bg-surface-muted-light dark:bg-surface-muted-dark items-center justify-center px-2">
                    <Text variant="muted" className="text-xs text-center">
                      Existing media kept
                    </Text>
                  </View>
                )}
                {pendingMedia.map((item, index) => (
                  <View
                    key={`${item.localUri}-${index}`}
                    className="relative"
                  >
                    {item.mediaType === "video" ? (
                      <View className="w-32 h-40 rounded-xl bg-surface-muted-light dark:bg-surface-muted-dark items-center justify-center">
                        <VideoIcon size={36} color={sem.textMuted} />
                      </View>
                    ) : (
                      <Image
                        source={{ uri: item.localUri }}
                        style={{
                          width: 128,
                          height: 160,
                          borderRadius: 12,
                        }}
                        contentFit="cover"
                      />
                    )}
                    <TouchableOpacity
                      onPress={() => removePendingAt(index)}
                      className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-black/70 items-center justify-center"
                    >
                      <Text className="text-white text-xs font-bold">×</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </ScrollView>
          )}

          <View className="my-3 h-px bg-border-light dark:bg-border-dark" />

          {/* Add media */}
          {!isEdit && (
            <RowSection
              iconName="images-outline"
              label="Add media"
              iconColor={sem.text}
              textColor={sem.text}
              onPress={handleAddMedia}
              trailing={
                <View className="flex-row items-center gap-2">
                  <ImageIcon size={20} color={sem.textMuted} />
                  <VideoIcon size={20} color={sem.textMuted} />
                </View>
              }
            />
          )}

          {/* Tag friends */}
          <RowSection
            iconName="people-outline"
            label="Tag friends"
            iconColor={sem.text}
            textColor={sem.text}
            onPress={() => setTagFriendsOpen(true)}
            trailing={
              <View className="flex-row items-center gap-1 px-3 py-1.5 rounded-full bg-input-light dark:bg-input-dark">
                <Text
                  variant="muted"
                  className="text-sm text-text-muted-light dark:text-text-muted-dark"
                >
                  {taggedFriends.length > 0
                    ? `${taggedFriends.length} selected`
                    : "Select friends"}
                </Text>
                <Ionicons
                  name="chevron-down"
                  size={16}
                  color={dropdownChevronColor}
                />
              </View>
            }
          />

          {taggedFriends.length > 0 && (
            <View className="flex-row flex-wrap gap-2 pb-3">
              {taggedFriends.map((u) => (
                <View
                  key={u.id}
                  className="flex-row items-center gap-2 px-2 py-1.5 rounded-full bg-input-light dark:bg-input-dark"
                >
                  <Avatar
                    source={u.avatar ? { uri: u.avatar } : undefined}
                    fallback={u.name}
                    size="sm"
                    className="h-6 w-6"
                  />
                  <Text className="text-sm text-text-light dark:text-text-dark">
                    {u.name || "User"}
                  </Text>
                  <Pressable
                    onPress={() => removeTaggedFriend(u.id)}
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                  >
                    <Ionicons name="close" size={14} color={sem.textMuted} />
                  </Pressable>
                </View>
              ))}
            </View>
          )}

          {/* Location */}
          {!isEdit && (
            <RowSection
              iconName="location-outline"
              label="Location"
              iconColor={sem.text}
              textColor={sem.text}
              onPress={() => setLocationPickerOpen(true)}
              trailing={
                <View className="flex-row items-center gap-1 px-3 py-1.5 rounded-full bg-input-light dark:bg-input-dark max-w-[60%]">
                  <Text
                    numberOfLines={1}
                    className={`text-sm ${
                      locationName.trim()
                        ? "text-text-light dark:text-text-dark"
                        : "text-text-muted-light dark:text-text-muted-dark"
                    }`}
                  >
                    {locationName.trim() || "Add location"}
                  </Text>
                  <Ionicons
                    name="chevron-down"
                    size={16}
                    color={dropdownChevronColor}
                  />
                </View>
              }
            />
          )}

          {/* Visibility */}
          <View className="mt-3">
            <Text className="mb-2 text-sm font-medium text-text-light dark:text-text-dark">
              Ai có thể xem?
            </Text>
            <View className="flex-row flex-wrap gap-2">
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
          </View>

          <Button
            className="mt-6"
            size="lg"
            onPress={handleSubmit}
            disabled={!canSubmit || submitting}
            loading={submitting}
          >
            {isEdit ? "Save changes" : "Create Post"}
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>

      <TagFriendsModal
        visible={tagFriendsOpen}
        initialSelected={taggedFriends}
        onClose={() => setTagFriendsOpen(false)}
        onConfirm={(users) => {
          setTaggedFriends(users);
          setTagFriendsOpen(false);
        }}
      />

      <LocationPickerModal
        visible={locationPickerOpen}
        initialValue={locationName}
        onClose={() => setLocationPickerOpen(false)}
        onSelect={(name) => setLocationName(name)}
      />
    </SafeAreaView>
  );
}
