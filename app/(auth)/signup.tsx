import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ActionInput, Button, Text } from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import { RegisterRequestDto } from "@/dtos";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useOtpCooldown } from "@/hooks/use-otp-cooldown";
import { authService } from "@/services/auth.service";
import {
  DEFAULT_REGISTER_VERIFICATION_CHANNEL,
  RegisterVerificationChannel,
  getAlternateRegisterVerificationChannel,
} from "@/services/auth-register-verification";
import { paletteIcon } from "@/styles/colors";
import { validateAuthFields } from "@/utils/authValidation";

const AUTH_BTN = "h-12 min-h-[48px] max-h-[48px] rounded-md py-0";

interface SignUpFormData extends RegisterRequestDto {
  email: string;
  confirmPassword: string;
}

const INITIAL_FORM: SignUpFormData = {
  name: "",
  email: "",
  phoneNumber: "",
  password: "",
  confirmPassword: "",
};

export default function SignUpScreen() {
  const { register } = useAuth();
  const colorScheme = useColorScheme() ?? "dark";
  const iconMuted = paletteIcon[colorScheme === "dark" ? "dark" : "light"];
  const otpCooldown = useOtpCooldown(60);

  const [formData, setFormData] = useState<SignUpFormData>(INITIAL_FORM);
  const [pendingRegisterData, setPendingRegisterData] =
    useState<RegisterRequestDto | null>(null);
  const [verificationChannel, setVerificationChannel] =
    useState<RegisterVerificationChannel>(
      DEFAULT_REGISTER_VERIFICATION_CHANNEL
    );
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"form" | "otp">("form");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    phoneNumber?: string;
    password?: string;
    confirmPassword?: string;
    code?: string;
  }>({});

  const validateForm = (): boolean => {
    const newErrors = validateAuthFields(formData, {
      name: {
        label: "full name",
        rules: ["required"],
      },
      email: {
        label: "email",
        rules: ["required", "email"],
      },
      phoneNumber: {
        label: "phone number",
        rules: ["required", "phone"],
      },
      password: {
        label: "password",
        rules: ["required", "password"],
      },
      confirmPassword: {
        label: "confirm password",
        rules: [
          "required",
          { type: "confirmPassword", matchesField: "password" },
        ],
      },
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateCode = (): boolean => {
    const newErrors = validateAuthFields(
      { code },
      {
        code: {
          label: verificationChannel === "phone" ? "SMS code" : "email code",
          rules: ["required", "otp"],
        },
      }
    );

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const sendRegisterOtp = async (
    registerData: RegisterRequestDto,
    channel: RegisterVerificationChannel
  ) => {
    if (channel === "phone") {
      await authService.sendRegisterPhoneOtp({
        phoneNumber: registerData.phoneNumber,
      });
      return;
    }

    await authService.sendRegisterEmailOtp({ email: registerData.email ?? "" });
  };

  const verifyRegisterOtp = async (
    registerData: RegisterRequestDto,
    channel: RegisterVerificationChannel
  ) => {
    if (channel === "phone") {
      await authService.verifyRegisterPhoneOtp({
        phoneNumber: registerData.phoneNumber,
        code,
      });
      return;
    }

    await authService.verifyRegisterEmailOtp({
      email: registerData.email ?? "",
      code,
    });
  };
  const handleSendOtp = async () => {
    if (!validateForm()) return;

    const { confirmPassword, ...registerData } = {
      ...formData,
      email: formData.email.trim(),
      phoneNumber: formData.phoneNumber.trim(),
      name: formData.name?.trim(),
      password: formData.password.trim(),
    };

    setLoading(true);
    try {
      await sendRegisterOtp(registerData, DEFAULT_REGISTER_VERIFICATION_CHANNEL);
      setVerificationChannel(DEFAULT_REGISTER_VERIFICATION_CHANNEL);
      setPendingRegisterData(registerData);
      setCode("");
      setStep("otp");
      otpCooldown.startCooldown();
      Alert.alert(
        "Code sent",
        "Please check your SMS for the verification code."
      );
    } catch (error: unknown) {
      const msg =
        error instanceof Error ? error.message : "Could not send verification code";
      Alert.alert("Error", msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!pendingRegisterData || otpCooldown.isCoolingDown) return;

    setResending(true);
    try {
      await sendRegisterOtp(pendingRegisterData, verificationChannel);
      otpCooldown.startCooldown();
      Alert.alert(
        "Code resent",
        verificationChannel === "phone"
          ? "Please check your SMS."
          : "Please check your email inbox."
      );
    } catch (error: unknown) {
      const msg =
        error instanceof Error ? error.message : "Could not resend code";
      Alert.alert("Error", msg);
    } finally {
      setResending(false);
    }
  };

  const handleSwitchVerificationChannel = async () => {
    if (!pendingRegisterData || resending || loading) return;

    const nextChannel =
      getAlternateRegisterVerificationChannel(verificationChannel);
    setResending(true);
    try {
      await sendRegisterOtp(pendingRegisterData, nextChannel);
      setVerificationChannel(nextChannel);
      setCode("");
      setErrors({});
      otpCooldown.startCooldown();
      Alert.alert(
        "Code sent",
        nextChannel === "phone"
          ? "Please check your SMS."
          : "Please check your email inbox."
      );
    } catch (error: unknown) {
      const msg =
        error instanceof Error ? error.message : "Could not send verification code";
      Alert.alert("Error", msg);
    } finally {
      setResending(false);
    }
  };

  const handleVerifyAndSignUp = async () => {
    if (!pendingRegisterData || !validateCode()) return;

    setLoading(true);
    try {
      await verifyRegisterOtp(pendingRegisterData, verificationChannel);
      await register(pendingRegisterData);
    } catch (error: unknown) {
      const msg =
        error instanceof Error ? error.message : "Registration or verification failed";
      Alert.alert("Error", msg);
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: keyof SignUpFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const updateCode = (value: string) => {
    setCode(value);
    if (errors.code) {
      setErrors((prev) => ({ ...prev, code: undefined }));
    }
  };

  const passwordToggle = (visible: boolean, onToggle: () => void) => (
    <Pressable
      onPress={onToggle}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={visible ? "Hide password" : "Show password"}
    >
      <Ionicons
        name={visible ? "eye-off-outline" : "eye-outline"}
        size={20}
        color={iconMuted}
      />
    </Pressable>
  );

  const renderFormStep = () => (
    <>
      <Text
        className="text-center text-title-light dark:text-title-dark mb-2 text-[30px] leading-[44px] font-bold py-0.5"
        style={{ fontFamily: "Montserrat-Bold" }}
      >
        Sign up
      </Text>
      <Text
        variant="muted"
        className="text-center text-text-muted-light dark:text-text-muted-dark mb-10"
      >
        Verify your phone number or email before creating your account
      </Text>

      <View className="gap-5">
        <ActionInput
          label="Full Name"
          isRequired
          variant="auth"
          placeholder="Enter your full name"
          value={formData.name}
          onChangeText={(text) => updateField("name", text)}
          autoCapitalize="words"
          error={errors.name}
        />

        <ActionInput
          label="Email"
          isRequired
          variant="auth"
          placeholder="email@example.com"
          value={formData.email}
          onChangeText={(text) => updateField("email", text)}
          keyboardType="email-address"
          autoCapitalize="none"
          error={errors.email}
        />

        <ActionInput
          label="Phone Number"
          isRequired
          variant="auth"
          placeholder="Enter your phone number"
          value={formData.phoneNumber}
          onChangeText={(text) => updateField("phoneNumber", text)}
          keyboardType="phone-pad"
          error={errors.phoneNumber}
        />

        <ActionInput
          label="Password"
          isRequired
          variant="auth"
          placeholder="Enter your password"
          value={formData.password}
          onChangeText={(text) => updateField("password", text)}
          secureTextEntry={!showPassword}
          error={errors.password}
          rightIcon={passwordToggle(showPassword, () =>
            setShowPassword((v) => !v)
          )}
        />

        <ActionInput
          label="Confirm Password"
          isRequired
          variant="auth"
          placeholder="Confirm your password"
          value={formData.confirmPassword}
          onChangeText={(text) => updateField("confirmPassword", text)}
          secureTextEntry={!showConfirmPassword}
          error={errors.confirmPassword}
          rightIcon={passwordToggle(showConfirmPassword, () =>
            setShowConfirmPassword((v) => !v)
          )}
        />

        <Button
          onPress={handleSendOtp}
          loading={loading}
          size="lg"
          className={`${AUTH_BTN} mt-1`}
        >
          Send Verification Code
        </Button>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() =>
            Alert.alert("Notice", "Google sign-up will be supported later.")
          }
          className={`${AUTH_BTN} border border-border-light dark:border-border-dark flex-row items-center justify-center gap-2 px-6`}
        >
          <Ionicons name="logo-google" size={18} color={iconMuted} />
          <Text
            className="text-base font-medium text-text-light dark:text-text-dark text-center leading-5"
            style={{ lineHeight: 20 }}
          >
            Sign Up with Google
          </Text>
        </TouchableOpacity>
      </View>

      <View className="flex-row justify-center mt-10">
        <Text variant="muted" className="text-sm">
          Already have an account?{" "}
        </Text>
        <Link href="/(auth)/signin" asChild>
          <TouchableOpacity>
            <Text className="text-sm font-semibold text-text-light dark:text-text-dark">
              Sign in
            </Text>
          </TouchableOpacity>
        </Link>
      </View>
    </>
  );

  const renderOtpStep = () => (
    <>
      <Text
        className="text-center text-title-light dark:text-title-dark mb-2 text-[30px] leading-[44px] font-bold py-0.5"
        style={{ fontFamily: "Montserrat-Bold" }}
      >
        Verify account
      </Text>
      <Text
        variant="muted"
        className="text-center text-text-muted-light dark:text-text-muted-dark mb-10"
      >
        {verificationChannel === "phone"
          ? "Enter the 6-digit code sent to your phone."
          : "Enter the 6-digit code sent to your email."}
      </Text>

      <View className="gap-5">
        <ActionInput
          label={verificationChannel === "phone" ? "SMS Code" : "Email Code"}
          isRequired
          variant="auth"
          placeholder="6 digits"
          value={code}
          onChangeText={updateCode}
          keyboardType="number-pad"
          maxLength={6}
          error={errors.code}
        />

        <Button
          variant="ghost"
          onPress={handleSwitchVerificationChannel}
          loading={resending}
          disabled={loading}
          size="lg"
          className={AUTH_BTN}
        >
          {verificationChannel === "phone"
            ? "Use Email Instead"
            : "Use Phone Instead"}
        </Button>

        <Button
          onPress={handleVerifyAndSignUp}
          loading={loading}
          size="lg"
          className={`${AUTH_BTN} mt-1`}
        >
          Verify and Sign Up
        </Button>

        <Button
          variant="outline"
          onPress={handleResendOtp}
          loading={resending}
          disabled={otpCooldown.isCoolingDown}
          size="lg"
          className={AUTH_BTN}
        >
          {otpCooldown.label}
        </Button>

        <Button
          variant="ghost"
          onPress={() => {
            setStep("form");
            setPendingRegisterData(null);
            setCode("");
            setVerificationChannel(DEFAULT_REGISTER_VERIFICATION_CHANNEL);
            setErrors({});
          }}
          size="lg"
          className={AUTH_BTN}
        >
          Edit Information
        </Button>
      </View>
    </>
  );

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            paddingHorizontal: 24,
            paddingVertical: 32,
          }}
          keyboardShouldPersistTaps="handled"
        >
          {step === "form" ? renderFormStep() : renderOtpStep()}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
