import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  View,
} from "react-native";

import { ScreenContainer } from "@/components/containers/ScreenContainer";
import HobbySelector from "@/components/shared/ui/hobby-selector";
import { Button, InfoInput, Text } from "@/components/ui";
import { PageHeader } from "@/components/ui/PageHeader";
import {
  ADDRESS_SUGGESTIONS,
  RELATIONSHIP_OPTIONS,
} from "@/constants/editProfileOptions";
import {
  PRESET_HOBBIES,
  PRESET_HOBBY_SET,
  matchPresetHobby,
} from "@/constants/hobbyCatalog";
import { useAuth } from "@/context/AuthContext";
import { Gender } from "@/dtos";
import { userService } from "@/services/user.service";
import { colors } from "@/styles/colors";
import { authUserFromProfile } from "@/utils/authUserFromProfile";

const GENDER_OPTIONS: { label: string; value: Gender }[] = [
  { label: "Nam", value: Gender.MALE },
  { label: "Nữ", value: Gender.FEMALE },
];

function toDateInputValue(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

export default function EditProfileScreen() {
  const { profile, setProfile } = useAuth();
  const [name, setName] = useState("");
  const [relationship, setRelationship] = useState("");
  const [presetHobbies, setPresetHobbies] = useState<string[]>([]);
  const [work, setWork] = useState("");
  const [currentAddress, setCurrentAddress] = useState("");
  const [hometown, setHometown] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState<Gender | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const u = await userService.getCurrentUser();
      setName(u.name ?? "");
      setRelationship(u.relationship ?? "");
      const preset: string[] = [];
      for (const h of u.hobby ?? []) {
        const m = matchPresetHobby(h);
        if (m && !preset.includes(m)) preset.push(m);
      }
      setPresetHobbies(preset);
      setWork(u.work ?? "");
      setCurrentAddress(u.currentAddress ?? "");
      setHometown(u.hometown ?? "");
      setDateOfBirth(toDateInputValue(u.dateOfBirth));
      setGender(
        u.gender === Gender.MALE || u.gender === Gender.FEMALE
          ? u.gender
          : undefined
      );
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

  const handleHobbyToggle = (hobby: string) => {
    setPresetHobbies((prev) =>
      prev.includes(hobby) ? prev.filter((h) => h !== hobby) : [...prev, hobby]
    );
  };

  const handleSave = async () => {
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      Alert.alert("Lỗi", "Tên cần ít nhất 2 ký tự.");
      return;
    }
    if (!gender) {
      Alert.alert("Lỗi", "Vui lòng chọn giới tính.");
      return;
    }
    const hobbies = presetHobbies.filter((h) => PRESET_HOBBY_SET.has(h));
    for (const h of hobbies) {
      if (h.length > 100) {
        Alert.alert("Lỗi", "Mỗi sở thích tối đa 100 ký tự.");
        return;
      }
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
        relationship: relationship.trim(),
        hobby: hobbies,
        work: work.trim(),
        currentAddress: currentAddress.trim(),
        hometown: hometown.trim(),
        dateOfBirth: dobIso,
        gender,
      });
      setProfile(authUserFromProfile(updated));
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
      <ScreenContainer className="gap-4">
        <PageHeader title="Chỉnh sửa hồ sơ" />
        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color={colors.primary[100]} />
          </View>
        ) : (
          <ScrollView
            className="flex-1"
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: 32 }}
          >
            <View className="gap-2">
            <InfoInput
              label="Họ và tên"
              required
              value={name}
              onChangeText={setName}
              placeholder="Tên hiển thị"
              autoCapitalize="words"
            />

            <InfoInput
              mode="select"
              label="Giới tính"
              required
              value={gender ?? ""}
              onValueChange={(v) => setGender(v as Gender)}
              options={GENDER_OPTIONS.map((o) => ({
                label: o.label,
                value: String(o.value),
              }))}
              placeholder="Chọn giới tính"
            />

            <InfoInput
              mode="select"
              label="Tình trạng mối quan hệ"
              value={relationship}
              onValueChange={setRelationship}
              options={RELATIONSHIP_OPTIONS}
              placeholder="Chọn..."
            />

            <InfoInput
              label="Công việc"
              value={work}
              onChangeText={setWork}
              placeholder="Nghề nghiệp / công ty"
              maxLength={150}
            />

            <InfoInput
              label="Nơi ở hiện tại"
              value={currentAddress}
              onChangeText={setCurrentAddress}
              placeholder="Nhập địa chỉ hoặc chọn gợi ý"
              maxLength={255}
              suggestions={ADDRESS_SUGGESTIONS}
              mapPickEnabled
            />

            <InfoInput
              label="Quê quán"
              value={hometown}
              onChangeText={setHometown}
              placeholder="Nhập hoặc chọn gợi ý"
              maxLength={255}
              suggestions={ADDRESS_SUGGESTIONS}
              mapPickEnabled
            />

            <InfoInput
              mode="date"
              label="Ngày sinh"
              value={dateOfBirth}
              onValueChange={setDateOfBirth}
            />

            <View className="mt-4">
              <Text variant="muted" className="mb-2 font-medium">
                Sở thích
              </Text>
              <HobbySelector
                hobbies={PRESET_HOBBIES}
                selectedHobbies={presetHobbies}
                onToggle={handleHobbyToggle}
              />
            </View>
          </View>

          <Button className="mt-8" onPress={handleSave} loading={saving}>
            Lưu thay đổi
          </Button>
          </ScrollView>
        )}
      </ScreenContainer>
  );
}
