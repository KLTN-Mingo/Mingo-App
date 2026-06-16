import React from "react";
import { useColorScheme, View } from "react-native";

import { Text } from "@/components/ui";
import { ModerationStatus } from "@/dtos";

export interface ModerationBannerProps {
  status?: ModerationStatus;
  isHidden?: boolean;
  hiddenReason?: string;
  /**
   * Khi `true` (máº·c Ä‘á»‹nh), banner chá»‰ render náº¿u post bá»‹ áº©n hoáº·c Ä‘ang chá» duyá»‡t.
   * Truyá»n `false` Ä‘á»ƒ luÃ´n show (dÃ¹ng debug).
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
      label: "Pending review",
      detail: "Your post will appear after the system finishes reviewing it.",
      emoji: "â³",
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
      label: "Under review",
      detail: "This post was flagged and may be reviewed by an admin.",
      emoji: "âš ï¸",
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
      label: "Post hidden for a violation",
      detail:
        hiddenReason ??
        "This post violates community standards. Only you can see it.",
      emoji: "ðŸš«",
    };
  }

  return null;
}

/**
 * Banner má» á»Ÿ Ä‘áº§u posts hiá»ƒn thá»‹ tráº¡ng thÃ¡i moderation cho **chÃ­nh tÃ¡c giáº£**.
 * User khÃ¡c khÃ´ng tháº¥y bÃ i isHidden nÃªn khÃ´ng cáº§n render.
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
