import React, { useMemo, useState } from "react";
import { Modal, ScrollView, TouchableOpacity, useColorScheme, View } from "react-native";

import { Text } from "@/components/ui";
import { paletteDark, paletteLight } from "@/constants/designTokens";
import { CultureTermDto } from "@/dtos";

export interface CultureHighlightedTextProps {
  text: string;
  terms: CultureTermDto[];
  className?: string;
  /** Cho phép caller override style chữ thường (non-highlighted). */
  baseTextClassName?: string;
}

interface Segment {
  text: string;
  term?: CultureTermDto;
}

function buildSegments(text: string, terms: CultureTermDto[]): Segment[] {
  if (!terms.length) return [{ text }];

  const sorted = [...terms]
    .filter(
      (t) =>
        typeof t.startIndex === "number" &&
        typeof t.endIndex === "number" &&
        t.startIndex >= 0 &&
        t.endIndex <= text.length &&
        t.endIndex > t.startIndex
    )
    .sort((a, b) => a.startIndex - b.startIndex);

  const out: Segment[] = [];
  let cursor = 0;
  for (const t of sorted) {
    if (t.startIndex < cursor) continue;
    if (t.startIndex > cursor) {
      out.push({ text: text.slice(cursor, t.startIndex) });
    }
    out.push({ text: text.slice(t.startIndex, t.endIndex), term: t });
    cursor = t.endIndex;
  }
  if (cursor < text.length) {
    out.push({ text: text.slice(cursor) });
  }
  return out;
}

/**
 * Render text với slang/idiom được highlight (gạch dưới chấm).
 * Khi tap, mở tooltip modal hiển thị nghĩa, nguồn gốc, tone, context.
 */
export function CultureHighlightedText({
  text,
  terms,
  className,
  baseTextClassName,
}: CultureHighlightedTextProps) {
  const isDark = useColorScheme() === "dark";
  const colors = isDark ? paletteDark : paletteLight;
  const [selected, setSelected] = useState<CultureTermDto | null>(null);

  const segments = useMemo(() => buildSegments(text, terms), [text, terms]);

  if (segments.length === 1 && !segments[0].term) {
    return (
      <Text className={baseTextClassName ?? className} style={{ color: colors.textPrimary }}>
        {text}
      </Text>
    );
  }

  return (
    <>
      <Text
        className={baseTextClassName ?? className}
        style={{ color: colors.textPrimary }}
      >
        {segments.map((s, i) => {
          if (!s.term) {
            return <Text key={i}>{s.text}</Text>;
          }
          return (
            <Text
              key={i}
              onPress={() => setSelected(s.term ?? null)}
              style={{
                color: "#2E8B7B",
                textDecorationLine: "underline",
                textDecorationStyle: "dotted",
                fontWeight: "600",
              }}
            >
              {s.text}
            </Text>
          );
        })}
      </Text>

      <Modal
        visible={!!selected}
        transparent
        animationType="fade"
        onRequestClose={() => setSelected(null)}
      >
        <TouchableOpacity
          activeOpacity={1}
          className="flex-1 items-center justify-center px-6"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onPress={() => setSelected(null)}
        >
          <TouchableOpacity
            activeOpacity={1}
            className="w-full max-w-sm rounded-2xl p-5"
            style={{
              backgroundColor: colors.background,
              borderWidth: 1,
              borderColor: colors.border,
            }}
            onPress={() => {
              /* swallow */
            }}
          >
            {selected ? (
              <ScrollView
                showsVerticalScrollIndicator={false}
                style={{ maxHeight: 400 }}
              >
                <Text
                  className="text-lg font-bold mb-1"
                  style={{ color: "#2E8B7B" }}
                >
                  {selected.term}
                </Text>
                {selected.tone ? (
                  <Text variant="muted" className="text-xs mb-3 uppercase">
                    {selected.tone}
                  </Text>
                ) : null}
                <Text
                  className="text-sm leading-relaxed mb-3"
                  style={{ color: colors.textPrimary }}
                >
                  {selected.meaning}
                </Text>
                {selected.origin ? (
                  <View className="mb-2">
                    <Text variant="muted" className="text-xs font-semibold">
                      Nguồn gốc
                    </Text>
                    <Text
                      className="text-sm"
                      style={{ color: colors.textSecondary }}
                    >
                      {selected.origin}
                    </Text>
                  </View>
                ) : null}
                {selected.contextNote ? (
                  <View>
                    <Text variant="muted" className="text-xs font-semibold">
                      Ghi chú ngữ cảnh
                    </Text>
                    <Text
                      className="text-sm"
                      style={{ color: colors.textSecondary }}
                    >
                      {selected.contextNote}
                    </Text>
                  </View>
                ) : null}
              </ScrollView>
            ) : null}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </>
  );
}
