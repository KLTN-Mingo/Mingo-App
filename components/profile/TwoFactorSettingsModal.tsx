import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  View,
} from "react-native";

import { SafeScreenView } from "@/components/containers/SafeLayout";
import { ActionInput, BackHeader, Button, Text } from "@/components/ui";
import { TwoFactorSetupResponseDto } from "@/dtos";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { authService } from "@/services/auth.service";
import { getSemantic, getStatusColor } from "@/styles/colors";
import {
  AuthValidationErrors,
  validateAuthFields,
} from "@/utils/authValidation";

type Props = {
  visible: boolean;
  enabled: boolean;
  onRequestClose: () => void;
  onChanged: (enabled: boolean) => void;
};

type EnableForm = {
  code: string;
};

type DisableForm = {
  code: string;
  password: string;
};

const INITIAL_ENABLE_FORM: EnableForm = { code: "" };
const INITIAL_DISABLE_FORM: DisableForm = { code: "", password: "" };

function getQrUri(setup: (TwoFactorSetupResponseDto & { qrCode?: string }) | null) {
  if (!setup) return undefined;
  return setup.qrCodeDataUrl || setup.qrCode;
}

export function TwoFactorSettingsModal({
  visible,
  enabled,
  onRequestClose,
  onChanged,
}: Props) {
  const colorScheme = useColorScheme() ?? "light";
  const isDark = colorScheme === "dark";
  const semantic = getSemantic(colorScheme);
  const successColor = getStatusColor(colorScheme, "success");
  const dangerColor = getStatusColor(colorScheme, "error");
  const [setup, setSetup] = useState<
    (TwoFactorSetupResponseDto & { qrCode?: string }) | null
  >(null);
  const [enableForm, setEnableForm] = useState<EnableForm>(INITIAL_ENABLE_FORM);
  const [disableForm, setDisableForm] =
    useState<DisableForm>(INITIAL_DISABLE_FORM);
  const [enableErrors, setEnableErrors] =
    useState<AuthValidationErrors<EnableForm>>({});
  const [disableErrors, setDisableErrors] =
    useState<AuthValidationErrors<DisableForm>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [loadingSetup, setLoadingSetup] = useState(false);
  const [saving, setSaving] = useState(false);

  const qrUri = useMemo(() => getQrUri(setup), [setup]);

  useEffect(() => {
    if (!visible) return;
    setSetup(null);
    setEnableForm(INITIAL_ENABLE_FORM);
    setDisableForm(INITIAL_DISABLE_FORM);
    setEnableErrors({});
    setDisableErrors({});
    setShowPassword(false);
    setLoadingSetup(false);
    setSaving(false);
  }, [visible]);

  const resetAndClose = () => {
    setSetup(null);
    setEnableForm(INITIAL_ENABLE_FORM);
    setDisableForm(INITIAL_DISABLE_FORM);
    setEnableErrors({});
    setDisableErrors({});
    setSaving(false);
    onRequestClose();
  };

  const handleSetup = async () => {
    if (loadingSetup) return;
    setLoadingSetup(true);
    try {
      const data = await authService.setup2FA();
      setSetup(data);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Không thể tạo mã 2FA";
      Alert.alert("Lỗi", message);
    } finally {
      setLoadingSetup(false);
    }
  };

  const handleEnable = async () => {
    if (!setup || saving) return;
    const nextErrors = validateAuthFields(enableForm, {
      code: {
        label: "mã xác thực",
        rules: ["required", "otp"],
      },
    });
    setEnableErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    try {
      await authService.enable2FA(setup.secret, enableForm.code);
      onChanged(true);
      Alert.alert("Thành công", "Xác thực 2 yếu tố đã được bật.");
      resetAndClose();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Không thể bật 2FA";
      Alert.alert("Lỗi", message);
      setSaving(false);
    }
  };

  const handleDisable = async () => {
    if (saving) return;
    const nextErrors = validateAuthFields(disableForm, {
      password: {
        label: "mật khẩu",
        rules: ["required", "password"],
      },
      code: {
        label: "mã xác thực",
        rules: ["required", "otp"],
      },
    });
    setDisableErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    try {
      await authService.disable2FA(disableForm.code, disableForm.password);
      onChanged(false);
      Alert.alert("Thành công", "Xác thực 2 yếu tố đã được tắt.");
      resetAndClose();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Không thể tắt 2FA";
      Alert.alert("Lỗi", message);
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={resetAndClose}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <SafeScreenView style={{ backgroundColor: semantic.background }}>
        <BackHeader
          title="Two-Factor Authentication"
          onBackPress={resetAndClose}
          className="px-4"
        />

        <ScrollView
          className="px-5"
          contentContainerStyle={{ gap: 16, paddingTop: 16, paddingBottom: 32 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-row items-center gap-3">
            <View
              className="w-11 h-11 rounded-full items-center justify-center"
              style={{ backgroundColor: enabled ? `${successColor}22` : `${dangerColor}18` }}
            >
              <Ionicons
                name={enabled ? "shield-checkmark-outline" : "shield-outline"}
                size={24}
                color={enabled ? successColor : semantic.textMuted}
              />
            </View>
            <View className="flex-1">
              <Text className="font-semibold text-base">
                {enabled ? "2FA is enabled" : "2FA is disabled"}
              </Text>
              <Text className="text-text-muted-light dark:text-text-muted-dark text-sm">
                Use an Authenticator app to protect future sign-ins.
              </Text>
            </View>
          </View>

          {!enabled ? (
            <View className="gap-4">
              {!setup ? (
                <Button loading={loadingSetup} onPress={handleSetup} size="lg">
                  Set Up Authenticator
                </Button>
              ) : (
                <>
                  {qrUri ? (
                    <View className="items-center">
                      <Image
                        source={{ uri: qrUri }}
                        resizeMode="contain"
                        style={{ width: 220, height: 220, borderRadius: 8 }}
                      />
                    </View>
                  ) : null}

                  <View
                    className="p-3 rounded-md"
                    style={{ backgroundColor: semantic.surface }}
                  >
                    <Text className="text-text-muted-light dark:text-text-muted-dark text-xs mb-1">
                      Secret key
                    </Text>
                    <Text selectable className="font-semibold">
                      {setup.secret}
                    </Text>
                  </View>

                  <ActionInput
                    variant="auth"
                    label="Authenticator Code"
                    isRequired
                    placeholder="6 digits"
                    value={enableForm.code}
                    onChangeText={(text) => {
                      setEnableForm({ code: text });
                      setEnableErrors({});
                    }}
                    keyboardType="number-pad"
                    maxLength={6}
                    error={enableErrors.code}
                  />

                  <Button loading={saving} onPress={handleEnable} size="lg">
                    Enable 2FA
                  </Button>
                </>
              )}
            </View>
          ) : (
            <View className="gap-4">
              <ActionInput
                variant="auth"
                label="Password"
                isRequired
                placeholder="Enter current password"
                value={disableForm.password}
                onChangeText={(text) => {
                  setDisableForm((prev) => ({ ...prev, password: text }));
                  setDisableErrors((prev) => ({ ...prev, password: undefined }));
                }}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                error={disableErrors.password}
                rightIcon={
                  <TouchableOpacity
                    onPress={() => setShowPassword((prev) => !prev)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={showPassword ? "eye-off-outline" : "eye-outline"}
                      size={18}
                      color={semantic.placeholder}
                    />
                  </TouchableOpacity>
                }
              />

              <ActionInput
                variant="auth"
                label="Authenticator Code"
                isRequired
                placeholder="6 digits"
                value={disableForm.code}
                onChangeText={(text) => {
                  setDisableForm((prev) => ({ ...prev, code: text }));
                  setDisableErrors((prev) => ({ ...prev, code: undefined }));
                }}
                keyboardType="number-pad"
                maxLength={6}
                error={disableErrors.code}
              />

              <Button
                variant="danger"
                loading={saving}
                onPress={handleDisable}
                size="lg"
              >
                Disable 2FA
              </Button>
            </View>
          )}
        </ScrollView>
      </SafeScreenView>
    </Modal>
  );
}
