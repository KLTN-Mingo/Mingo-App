import React, { useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

import { Button, ScreenHeader, Text } from "@/components/ui";
import { paletteDark, paletteLight } from "@/constants/designTokens";
import {
  REPORT_REASON_LABELS,
  ReportEntityType,
  ReportReason,
} from "@/dtos";
import { reportService } from "@/services/report.service";

export interface ReportEntityModalProps {
  visible: boolean;
  entityType: ReportEntityType;
  entityId: string;
  /** Tên hiển thị (vd "An's post") — chỉ để hint user. */
  entityLabel?: string;
  onClose: () => void;
  onSuccess?: () => void;
}

const REASONS: ReportReason[] = [
  ReportReason.SPAM,
  ReportReason.HARASSMENT,
  ReportReason.HATE_SPEECH,
  ReportReason.INAPPROPRIATE,
  ReportReason.SCAM,
  ReportReason.COPYRIGHT,
  ReportReason.VIOLENCE,
  ReportReason.MISINFORMATION,
  ReportReason.OTHER,
];

export function ReportEntityModal({
  visible,
  entityType,
  entityId,
  entityLabel,
  onClose,
  onSuccess,
}: ReportEntityModalProps) {
  const isDark = useColorScheme() === "dark";
  const colors = isDark ? paletteDark : paletteLight;

  const [selected, setSelected] = useState<ReportReason | null>(null);
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selected) {
      Alert.alert("Error", "Please select a reason");
      return;
    }
    setSubmitting(true);
    try {
      if (entityType === ReportEntityType.USER) {
        await reportService.reportUser(entityId, {
          reason: selected,
          description: description.trim() || undefined,
        });
      } else if (entityType === ReportEntityType.POST) {
        await reportService.reportPost(
          entityId,
          selected,
          description.trim() || undefined
        );
      } else {
        await reportService.reportComment(
          entityId,
          selected,
          description.trim() || undefined
        );
      }
      Alert.alert(
        "Report sent",
        "Thank you. We will review this report soon.",
        [
          {
            text: "OK",
            onPress: () => {
              setSelected(null);
              setDescription("");
              onSuccess?.();
              onClose();
            },
          },
        ]
      );
    } catch (err: unknown) {
      console.error("[report] submit failed", err);
      Alert.alert(
        "Error",
        err instanceof Error ? err.message : "Could not submit report"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View
        className="flex-1"
        style={{ backgroundColor: colors.background }}
      >
        <ScreenHeader
          title="Report"
          rightSlot={
            <TouchableOpacity onPress={onClose} className="p-2">
              <Text style={{ color: colors.textMuted }}>Close</Text>
            </TouchableOpacity>
          }
        />

        <ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          keyboardShouldPersistTaps="handled"
        >
          <Text
            className="text-sm leading-relaxed mb-4"
            style={{ color: colors.textSecondary }}
          >
            Help us understand the issue
            {entityLabel ? ` with ${entityLabel}` : ""}. Your report will
            be kept private.
          </Text>

          <View className="gap-2">
            {REASONS.map((reason) => {
              const isSel = selected === reason;
              return (
                <TouchableOpacity
                  key={reason}
                  onPress={() => setSelected(reason)}
                  className="flex-row items-center px-4 py-3 rounded-xl border"
                  style={{
                    backgroundColor: isSel
                      ? isDark
                        ? "#2A2A2A"
                        : "#FFEEEE"
                      : colors.surfaceMuted,
                    borderColor: isSel ? "#EF4444" : colors.border,
                  }}
                  activeOpacity={0.8}
                >
                  <View
                    className="w-5 h-5 rounded-full mr-3 items-center justify-center"
                    style={{
                      borderWidth: 2,
                      borderColor: isSel ? "#EF4444" : colors.border,
                    }}
                  >
                    {isSel ? (
                      <View
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: "#EF4444" }}
                      />
                    ) : null}
                  </View>
                  <Text
                    className="flex-1 text-sm"
                    style={{
                      color: colors.textPrimary,
                      fontWeight: isSel ? "600" : "400",
                    }}
                  >
                    {REPORT_REASON_LABELS[reason]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text
            className="text-sm mt-6 mb-2"
            style={{ color: colors.textPrimary }}
          >
            Additional details (optional)
          </Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Tell us more details..."
            placeholderTextColor={colors.textMuted}
            multiline
            maxLength={500}
            className="rounded-xl px-3 py-2.5 text-sm"
            style={{
              backgroundColor: colors.surfaceMuted,
              color: colors.textPrimary,
              borderWidth: 1,
              borderColor: colors.border,
              minHeight: 90,
              textAlignVertical: "top",
            }}
          />

          <Button
            onPress={handleSubmit}
            loading={submitting}
            disabled={!selected}
            className="mt-6"
          >
            Submit report
          </Button>
        </ScrollView>
      </View>
    </Modal>
  );
}
