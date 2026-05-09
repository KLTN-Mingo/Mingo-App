import { router } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";

import { ScreenContainer } from "@/components/containers/ScreenContainer";
import HobbySelector from "@/components/shared/ui/hobby-selector";
import {
  ActionDatePicker,
  ActionInput,
  ActionSelectPicker,
  Button,
  Text,
} from "@/components/ui";
import { PageHeader } from "@/components/ui/PageHeader";
import { RELATIONSHIP_OPTIONS } from "@/constants/editProfileOptions";
import {
  PRESET_HOBBIES,
  PRESET_HOBBY_SET,
  matchPresetHobby,
} from "@/constants/hobbyCatalog";
import { useAuth } from "@/context/AuthContext";
import { Gender } from "@/dtos";
import { useVNLocationSuggestions } from "@/hooks/use-vn-locations";
import { userService } from "@/services/user.service";
import { paletteIcon } from "@/styles/colors";
import { authUserFromProfile } from "@/utils/authUserFromProfile";

const GENDER_OPTIONS: { label: string; value: string }[] = [
  { label: "Male", value: Gender.MALE },
  { label: "Female", value: Gender.FEMALE },
];

function toDateInputValue(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

interface LocationFieldProps {
  label: string;
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
}

function LocationField({
  label,
  value,
  onChange,
  placeholder,
}: LocationFieldProps) {
  const [focused, setFocused] = useState(false);
  const suggestions = useVNLocationSuggestions(focused ? value : "", 6);

  return (
    <View>
      <ActionInput
        label={label}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        maxLength={255}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          setTimeout(() => setFocused(false), 150);
        }}
      />
      {focused && suggestions.length > 0 ? (
        <View className="mt-2 rounded-2xl bg-input-light dark:bg-input-dark overflow-hidden">
          {suggestions.map((item, idx) => (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.65}
              onPress={() => {
                onChange(item.shortLabel);
                setFocused(false);
              }}
              className={`px-4 py-3 ${
                idx > 0
                  ? "border-t border-border-light dark:border-border-dark"
                  : ""
              }`}
            >
              <Text className="text-sm text-text-light dark:text-text-dark">
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : null}
    </View>
  );
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
      const msg = e instanceof Error ? e.message : "Failed to load profile";
      Alert.alert("Error", msg);
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

  const relationshipOptions = useMemo(
    () =>
      RELATIONSHIP_OPTIONS.map((o) => ({
        label: o.label,
        value: o.value,
      })),
    []
  );

  const handleSave = async () => {
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      Alert.alert("Error", "Name must be at least 2 characters.");
      return;
    }
    if (!gender) {
      Alert.alert("Error", "Please select your gender.");
      return;
    }
    const hobbies = presetHobbies.filter((h) => PRESET_HOBBY_SET.has(h));
    for (const h of hobbies) {
      if (h.length > 100) {
        Alert.alert("Error", "Each hobby can be up to 100 characters.");
        return;
      }
    }
    let dobIso: string | undefined;
    if (dateOfBirth.trim()) {
      const d = new Date(dateOfBirth.trim());
      if (Number.isNaN(d.getTime()) || d > new Date()) {
        Alert.alert("Error", "Invalid date of birth.");
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
      Alert.alert("Success", "Profile saved.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to save";
      Alert.alert("Error", msg);
    } finally {
      setSaving(false);
    }
  };

  if (!profile) {
    return null;
  }

  return (
    <ScreenContainer className="gap-4">
      <PageHeader title="Edit Profile" />
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={paletteIcon.lightMuted} />
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 32 }}
        >
          <View className="gap-4">
            <ActionInput
              label="Full Name"
              value={name}
              onChangeText={setName}
              placeholder="Display name"
              autoCapitalize="words"
            />

            <ActionSelectPicker
              label="Gender"
              value={gender ?? ""}
              onValueChange={(v) => setGender(v as Gender)}
              options={GENDER_OPTIONS}
              placeholder="Select gender"
            />

            <ActionSelectPicker
              label="Relationship Status"
              value={relationship}
              onValueChange={setRelationship}
              options={relationshipOptions}
              placeholder="Select..."
            />

            <ActionInput
              label="Work"
              value={work}
              onChangeText={setWork}
              placeholder="Job / Company"
              maxLength={150}
            />

            <LocationField
              label="Current Location"
              value={currentAddress}
              onChange={setCurrentAddress}
              placeholder="Type to search Vietnam locations"
            />

            <LocationField
              label="Hometown"
              value={hometown}
              onChange={setHometown}
              placeholder="Type to search Vietnam locations"
            />

            <ActionDatePicker
              label="Date of Birth"
              value={dateOfBirth}
              onValueChange={setDateOfBirth}
              placeholder="Select date of birth"
            />

            <View className="mt-2">
              <Text className="mb-2 font-medium text-base text-text-light dark:text-text-dark">
                Hobbies
              </Text>
              <HobbySelector
                hobbies={PRESET_HOBBIES}
                selectedHobbies={presetHobbies}
                onToggle={handleHobbyToggle}
              />
            </View>
          </View>

          <Button className="mt-8" onPress={handleSave} loading={saving}>
            Save Changes
          </Button>
        </ScrollView>
      )}
    </ScreenContainer>
  );
}
