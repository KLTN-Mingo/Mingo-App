import React, { useMemo, useState } from "react";
import { Alert, Modal, StatusBar, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { SafeScreenView } from "@/components/containers/SafeLayout";
import { ActionInput, BackHeader, Button, Text } from "@/components/ui";
import { authService } from "@/services/auth.service";
import { getSemantic } from "@/styles/colors";
import {
  AuthValidationErrors,
  validateAuthFields,
} from "@/utils/authValidation";
import { useColorScheme } from "@/hooks/use-color-scheme";

type FormData = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

type Props = {
  visible: boolean;
  onRequestClose: () => void;
};

const INITIAL_FORM: FormData = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

export function ChangePasswordModal({ visible, onRequestClose }: Props) {
  const colorScheme = useColorScheme() ?? "light";
  const isDark = colorScheme === "dark";
  const semantic = getSemantic(colorScheme);
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM);
  const [errors, setErrors] = useState<AuthValidationErrors<FormData>>({});
  const [saving, setSaving] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const eyeColor = useMemo(() => semantic.placeholder, [semantic.placeholder]);

  const updateField = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = () => {
    const nextErrors = validateAuthFields(formData, {
      currentPassword: {
        label: "current password",
        rules: ["required", "password"],
      },
      newPassword: {
        label: "new password",
        rules: ["required", "password"],
      },
      confirmPassword: {
        label: "confirm password",
        rules: [
          "required",
          { type: "confirmPassword", matchesField: "newPassword" },
        ],
      },
    });
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const resetAndClose = () => {
    setFormData(INITIAL_FORM);
    setErrors({});
    setSaving(false);
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    onRequestClose();
  };

  const handleSubmit = async () => {
    if (!validate() || saving) return;
    setSaving(true);
    try {
      await authService.changePassword({
        currentPassword: formData.currentPassword.trim(),
        newPassword: formData.newPassword.trim(),
      });
      Alert.alert("Success", "Password changed successfully.");
      resetAndClose();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not change password";
      Alert.alert("Error", message);
      setSaving(false);
    }
  };

  const eye = (visibleValue: boolean, onToggle: () => void) => (
    <TouchableOpacity onPress={onToggle} activeOpacity={0.7}>
      <Ionicons
        name={visibleValue ? "eye-off-outline" : "eye-outline"}
        size={18}
        color={eyeColor}
      />
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={resetAndClose}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <SafeScreenView style={{ backgroundColor: semantic.background }}>
        <BackHeader
          title="Change Password"
          onBackPress={resetAndClose}
          className="px-4"
        />

        <View className="px-5 pt-4 gap-4">
          <Text className="text-text-muted-light dark:text-text-muted-dark text-sm">
            Update your password to keep your account secure.
          </Text>

          <ActionInput
            variant="auth"
            label="Current Password"
            isRequired
            placeholder="Enter current password"
            value={formData.currentPassword}
            onChangeText={(text) => updateField("currentPassword", text)}
            secureTextEntry={!showCurrentPassword}
            autoCapitalize="none"
            error={errors.currentPassword}
            rightIcon={eye(showCurrentPassword, () =>
              setShowCurrentPassword((prev) => !prev)
            )}
          />

          <ActionInput
            variant="auth"
            label="New Password"
            isRequired
            placeholder="Enter new password"
            value={formData.newPassword}
            onChangeText={(text) => updateField("newPassword", text)}
            secureTextEntry={!showNewPassword}
            autoCapitalize="none"
            error={errors.newPassword}
            rightIcon={eye(showNewPassword, () => setShowNewPassword((prev) => !prev))}
          />

          <ActionInput
            variant="auth"
            label="Confirm Password"
            isRequired
            placeholder="Confirm new password"
            value={formData.confirmPassword}
            onChangeText={(text) => updateField("confirmPassword", text)}
            secureTextEntry={!showConfirmPassword}
            autoCapitalize="none"
            error={errors.confirmPassword}
            rightIcon={eye(showConfirmPassword, () =>
              setShowConfirmPassword((prev) => !prev)
            )}
          />

          <Button
            className="mt-2"
            size="lg"
            loading={saving}
            onPress={handleSubmit}
          >
            Save Password
          </Button>
        </View>
      </SafeScreenView>
    </Modal>
  );
}
