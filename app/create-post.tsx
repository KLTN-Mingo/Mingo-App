import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
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

import { ScreenContainer } from "@/components/containers/ScreenContainer";
import { LocationPickerModal } from "@/components/post/LocationPickerModal";
import { TagFriendsModal } from "@/components/post/TagFriendsModal";
import { ImageIcon, VideoIcon } from "@/components/shared/icons/Icons";
import { Avatar, BackHeader, Button, Text } from "@/components/ui";
import { TextArea } from "@/components/ui/TextArea";
import { getSemantic } from "@/constants/designTokens";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { PostVisibility, UpdatePostRequestDto, UserMinimalDto } from "@/dtos";
import {
  frontendCacheKeys,
  invalidateCacheKeys,
} from "@/services/frontend-cache";
import { postService } from "@/services/post.service";

const VISIBILITY_OPTIONS: { value: PostVisibility; label: string }[] = [
  { value: PostVisibility.PUBLIC, label: "Public" },
  { value: PostVisibility.FRIENDS, label: "Friends" },
  { value: PostVisibility.BESTFRIENDS, label: "Close friends" },
  { value: PostVisibility.PRIVATE, label: "Only me" },
];
function extractHashtags(text: string): string[] {
  const re = /#[\p{L}\p{N}_]+/gu;
  const found = text.match(re) ?? [];
  const tags = [
    ...new Set(
      found
        .map((t) => t.slice(1).replace(/^#+/, "").toLowerCase())
        .filter(Boolean)
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
  const [initialVisibility, setInitialVisibility] =
    useState<PostVisibility | null>(null);
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
        Alert.alert("Cannot edit", "You are not the post owner.");
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
      const msg = e instanceof Error ? e.message : "Could not load post";
      Alert.alert("Error", msg);
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

  const appendDocumentAssets = (
    assets: DocumentPicker.DocumentPickerAsset[]
  ) => {
    const next: PickedAsset[] = assets.map((a) => ({
      localUri: a.uri,
      mediaType: "video",
      mimeType: a.mimeType ?? "video/mp4",
      fileName: a.name ?? null,
    }));
    setPendingMedia((prev) => {
      const merged = [...prev, ...next];
      return merged.slice(0, 10);
    });
  };

  const pickMedia = async (kind: "image" | "video" | "mixed") => {
    if (Platform.OS === "ios" && kind === "video") {
      try {
        const result = await DocumentPicker.getDocumentAsync({
          type: "video/*",
          copyToCacheDirectory: true,
          multiple: false,
        });
        if (result.canceled || !result.assets?.length) return;
        appendDocumentAssets(result.assets);
      } catch (err) {
        console.error("[create-post] document video pick failed", err);
        Alert.alert("Media selection error", "Cannot select video from Files.");
      }
      return;
    }

    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(
        "Permission required",
        "Photo library permission is required to attach media."
      );
      return;
    }

    const mediaTypes: ImagePicker.MediaType[] =
      kind === "image"
        ? ["images"]
        : kind === "video"
          ? ["videos"]
          : ["images", "videos"];

    const allowsMultipleSelection = kind !== "video";
    const selectionLimit = allowsMultipleSelection
      ? Math.max(1, 10 - pendingMedia.length)
      : 1;
    const launchPicker = (
      preferredAssetRepresentationMode?: ImagePicker.UIImagePickerPreferredAssetRepresentationMode
    ) =>
      ImagePicker.launchImageLibraryAsync({
        mediaTypes,
        allowsMultipleSelection,
        selectionLimit,
        quality: kind === "video" ? 1 : 0.85,
        preferredAssetRepresentationMode,
        videoExportPreset:
          kind !== "image" && Platform.OS === "ios"
            ? ImagePicker.VideoExportPreset.Passthrough
            : undefined,
      });

    try {
      const result = await launchPicker(
        Platform.OS !== "ios"
          ? undefined
          : kind === "image"
            ? ImagePicker.UIImagePickerPreferredAssetRepresentationMode
                .Compatible
            : kind === "video"
              ? ImagePicker.UIImagePickerPreferredAssetRepresentationMode
                  .Current
              : ImagePicker.UIImagePickerPreferredAssetRepresentationMode
                  .Automatic
      );

      if (result.canceled || !result.assets?.length) return;
      appendAssets(result.assets);
    } catch (err: unknown) {
      console.error("[create-post] pickMedia failed", err);
      // iOS PHPhotosErrorDomain often means asset not available locally (iCloud)
      const msg = err instanceof Error ? err.message : String(err);
      if (
        Platform.OS === "ios" &&
        kind !== "image" &&
        msg.includes("PHPhotosErrorDomain")
      ) {
        try {
          const retryResult = await launchPicker(
            ImagePicker.UIImagePickerPreferredAssetRepresentationMode.Automatic
          );
          if (retryResult.canceled || !retryResult.assets?.length) return;
          appendAssets(retryResult.assets);
          return;
        } catch (retryErr) {
          console.error("[create-post] pickMedia retry failed", retryErr);
          try {
            const fallbackResult = await DocumentPicker.getDocumentAsync({
              type: "video/*",
              copyToCacheDirectory: true,
              multiple: allowsMultipleSelection,
            });
            if (fallbackResult.canceled || !fallbackResult.assets?.length)
              return;
            appendDocumentAssets(fallbackResult.assets);
            return;
          } catch (documentErr) {
            console.error(
              "[create-post] document picker fallback failed",
              documentErr
            );
          }
        }
      }
      if (msg.includes("PHPhotosErrorDomain")) {
        const limitedAccessNote =
          perm.accessPrivileges === "limited"
            ? " The app currently has limited photo library access. Grant access to this video or allow full access in Settings > Photos."
            : "";
        Alert.alert(
          "Cannot select media",
          "iOS has not downloaded this photo or video yet. Open it in Photos to download it from iCloud, then try again." +
            limitedAccessNote
        );
        return;
      }
      Alert.alert("Media selection error", "Could not open the photo library.");
    }
  };

  const handleAddMedia = () => {
    if (pendingMedia.length >= 10) {
      Alert.alert("Limit reached", "Each post can include up to 10 photos/videos.");
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
      Alert.alert("Missing content", "Add text or at least one photo/video.");
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
          Alert.alert("No changes", "You have not changed anything.");
          return;
        }
        if (
          payload.contentText !== undefined &&
          payload.contentText.trim().length === 0
        ) {
          Alert.alert("Content", "Post content cannot be empty.");
          return;
        }
        await postService.updatePost(editPostId, payload);
        Alert.alert("Saved", "Your post has been updated.", [
          {
            text: "OK",
            onPress: () => router.replace(`/post/${editPostId}` as any),
          },
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

      invalidateCacheKeys([
        frontendCacheKeys.feedPosts,
        ...(profile?.id ? [frontendCacheKeys.userPosts(profile.id)] : []),
      ]);
      router.replace(`/post/${created.id}` as any);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Something went wrong";
      Alert.alert("Failed", msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingPost) {
    return (
      <ScreenContainer
        horizontalPadding="default"
        className="items-center justify-center"
      >
        <ActivityIndicator color={sem.primary} size="large" />
        <Text variant="muted" className="mt-3">
          Loading post...
        </Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer
      horizontalPadding="default"
      style={{ paddingTop: Platform.OS === "ios" ? 8 : 4 }}
    >
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
      >
        <BackHeader
          title={isEdit ? "Edit post" : "Create post"}
          disabled={submitting}
        />

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 40, paddingTop: 12 }}
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
                {profile?.name ?? "You"}
              </Text>
            </View>
          </View>

          {/* Caption */}
          <TextArea
            placeholder="What are you thinking? Add #hashtags if needed."
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
                  <View key={`${item.localUri}-${index}`} className="relative">
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
            <Text className="mb-2 text-sm font-medium text-title-light dark:text-title-dark">
              Who can see this?
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
    </ScreenContainer>
  );
}
