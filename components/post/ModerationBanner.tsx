import React from "react";
import { useColorScheme, View } from "react-native";

import { Text } from "@/components/ui";
import { ModerationStatus } from "@/dtos";

export interface ModerationBannerProps {
  status?: ModerationStatus;
  isHidden?: boolean;
  hiddenReason?: string;
  /**
   * Khi `true` (mặc định), banner chỉ render nếu post bị ẩn hoặc đang chờ duyệt.
   * Truyền `false` để luôn show (dùng debug).
   */
  hideIfApproved?: boolean;
}

interface BannerContent {
  bg: string;
  border: string;
  textColor: string;
  iconColor: string;
  label: string;
  detail?: string;
  emoji: string;
}

function getContent(
  status: ModerationStatus | undefined,
  isHidden: boolean,
  hiddenReason: string | undefined,
  isDark: boolean
): BannerContent | null {
  if (status === ModerationStatus.PENDING) {
    return {
      bg: isDark ? "#3A2E12" : "#FFF7E0",
      border: isDark ? "#5C4815" : "#F0CE6A",
      textColor: isDark ? "#F5D58A" : "#7A5A0C",
      iconColor: isDark ? "#F5D58A" : "#A57708",
      label: "Đang chờ kiểm duyệt",
      detail: "Bài viết của bạn sẽ hiển thị sau khi hệ thống kiểm tra xong.",
      emoji: "⏳",
    };
  }

  if (
    status === ModerationStatus.FLAGGED &&
    !isHidden
  ) {
    return {
      bg: isDark ? "#3A2E12" : "#FFF7E0",
      border: isDark ? "#5C4815" : "#F0CE6A",
      textColor: isDark ? "#F5D58A" : "#7A5A0C",
      iconColor: isDark ? "#F5D58A" : "#A57708",
      label: "Đang được xem xét",
      detail: "Bài viết bị đánh dấu nghi vấn, admin có thể xem xét lại.",
      emoji: "⚠️",
    };
  }

  if (
    isHidden ||
    status === ModerationStatus.REJECTED ||
    status === ModerationStatus.VIOLATED
  ) {
    return {
      bg: isDark ? "#3A1A1A" : "#FFEEEE",
      border: isDark ? "#6B2828" : "#F0A4A4",
      textColor: isDark ? "#F4A8A8" : "#8A1C1C",
      iconColor: isDark ? "#F4A8A8" : "#C03030",
      label: "Bài đang bị ẩn vì vi phạm",
      detail:
        hiddenReason ??
        "Bài viết vi phạm tiêu chuẩn cộng đồng. Chỉ bạn nhìn thấy bài này.",
      emoji: "🚫",
    };
  }

  return null;
}

/**
 * Banner mờ ở đầu bài viết hiển thị trạng thái moderation cho **chính tác giả**.
 * User khác không thấy bài isHidden nên không cần render.
 */
export function ModerationBanner({
  status,
  isHidden,
  hiddenReason,
  hideIfApproved = true,
}: ModerationBannerProps) {
  const isDark = useColorScheme() === "dark";

  const content = getContent(status, !!isHidden, hiddenReason, isDark);
  if (!content && hideIfApproved) return null;
  if (!content) return null;

  return (
    <View
      className="rounded-2xl px-3 py-2.5 flex-row gap-2 border"
      style={{ backgroundColor: content.bg, borderColor: content.border }}
    >
      <Text style={{ fontSize: 16, lineHeight: 20 }}>{content.emoji}</Text>
      <View className="flex-1">
        <Text
          className="text-sm font-semibold"
          style={{ color: content.textColor }}
        >
          {content.label}
        </Text>
        {content.detail ? (
          <Text
            className="text-xs leading-relaxed mt-0.5"
            style={{ color: content.textColor }}
          >
            {content.detail}
          </Text>
        ) : null}
      </View>
    </View>
  );
}
