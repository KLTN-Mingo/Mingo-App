import React, { useState } from "react";
import { View, Text, TouchableOpacity, Switch, Modal } from "react-native";
import {
  ArrowIcon,
  SaveIcon,
  HistoryIcon,
  PostIcon,
  FriendIcon,
  MediaIcon,
  ProfileIcon,
  KeyIcon,
  LogoutIcon,
} from "../icons/Icons"; // Đảm bảo đường dẫn đúng
import { useTheme } from "../../../context/ThemeContext";
import { colors } from "../../../styles/colors";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "expo-router";
import LikedPosts from "./LikedPosts";
import ChangePassword from "@/components/forms/setting/ChangePassword";
import SavedPosts from "./SavedPosts";

const Setting = ({ setSetting }: any) => {
  const { logout } = useAuth();
  const router = useRouter();
  const { colorScheme, toggleColorScheme } = useTheme();
  const iconColor =
    colorScheme === "dark" ? colors.dark[100] : colors.light[100];
  const [isSavedPostModalVisible, setSavedPostModalVisible] = useState(false);
  const [isLikedPostModalVisible, setLikedPostModalVisible] = useState(false);

  const [isChangePasswordModalVisible, setChangePasswordModalVisible] =
    useState(false);

  const toggleSavedPostModal = () =>
    setSavedPostModalVisible(!isSavedPostModalVisible);

  const toggleLikedPostModal = () =>
    setLikedPostModalVisible(!isLikedPostModalVisible);

  const toggleChangePasswordModal = () =>
    setChangePasswordModalVisible(!isChangePasswordModalVisible);

  const handleLogout = () => {
    try {
      setSetting(false);
      router.push("/signin");
      logout();
    } catch (error) {
      console.error("Error logout:", error);
    }
  };
  return (
    <>
      <View
        className="flex-1 "
        style={{
          backgroundColor:
            colorScheme === "dark" ? colors.dark[200] : colors.light[200], // Sử dụng giá trị màu từ file colors.js
          flex: 1,
        }}
      >
        <View
          className="flex-1 rounded-t-lg p-4"
          style={{
            backgroundColor:
              colorScheme === "dark" ? colors.dark[200] : colors.light[200], // Sử dụng giá trị màu từ file colors.js
            flex: 1,
          }}
        >
          <View
            className="flex flex-row max-h-16"
            style={{
              backgroundColor:
                colorScheme === "dark" ? colors.dark[200] : colors.light[200], // Sử dụng giá trị màu từ file colors.js
              flex: 1,
            }}
          >
            <TouchableOpacity onPress={() => setSetting(false)} className="">
              <ArrowIcon size={28} color={iconColor} />
            </TouchableOpacity>
            <View>
              <Text
                style={{
                  color:
                    colorScheme === "dark"
                      ? colors.dark[100]
                      : colors.light[100],
                }}
                className="font-msemibold text-[18px] ml-1"
              >
                Setting
              </Text>
            </View>
          </View>
          <View className=" pl-2 flex-row justify-between">
            <Text
              className=" font-mbold text-[16px]"
              style={{
                color:
                  colorScheme === "dark" ? colors.dark[100] : colors.light[100],
              }}
            >
              Dark mode
            </Text>
            <Switch
              value={colorScheme === "dark"}
              onValueChange={toggleColorScheme}
            />
          </View>

          <View className="mt-4">
            <TouchableOpacity className="brounded p-2  flex flex-row">
              <Text
                className=" font-mbold text-[16px]"
                style={{
                  color:
                    colorScheme === "dark"
                      ? colors.dark[100]
                      : colors.light[100],
                }}
              >
                Activities
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="rounded p-3 flex flex-row items-center"
              onPress={toggleSavedPostModal}
            >
              <SaveIcon size={28} color={iconColor} />

              <Text
                className=" font-mmedium ml-2"
                style={{
                  color:
                    colorScheme === "dark"
                      ? colors.dark[100]
                      : colors.light[100],
                }}
              >
                Saved post
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="rounded p-3 flex flex-row items-center"
              onPress={toggleLikedPostModal}
            >
              <HistoryIcon size={28} color={iconColor} />

              <Text
                className="font-mmedium ml-2"
                style={{
                  color:
                    colorScheme === "dark"
                      ? colors.dark[100]
                      : colors.light[100],
                }}
              >
                Liked posts
              </Text>
            </TouchableOpacity>

            <TouchableOpacity className="rounded p-2">
              <Text
                className="font-mbold text-[16px]"
                style={{
                  color:
                    colorScheme === "dark"
                      ? colors.dark[100]
                      : colors.light[100],
                }}
              >
                Account
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className=" rounded p-3 flex flex-row items-center"
              onPress={toggleChangePasswordModal}
            >
              <KeyIcon size={28} color={iconColor} />

              <Text
                className=" font-mmedium ml-2"
                style={{
                  color:
                    colorScheme === "dark"
                      ? colors.dark[100]
                      : colors.light[100],
                }}
              >
                Change password
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className=" rounded p-3 flex flex-row items-center"
              onPress={handleLogout}
            >
              <LogoutIcon size={28} color={iconColor} />
              <Text
                className=" font-mmedium ml-2"
                style={{
                  color:
                    colorScheme === "dark"
                      ? colors.dark[100]
                      : colors.light[100],
                }}
              >
                Logout
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <Modal
        visible={isSavedPostModalVisible}
        onRequestClose={toggleSavedPostModal}
        animationType="slide"
      >
        <View
          className="flex-1"
          style={{
            backgroundColor:
              colorScheme === "dark" ? colors.dark[300] : colors.light[500],
          }}
        >
          <View className="flex-row mt-16">
            <Text
              style={{
                color:
                  colorScheme === "dark" ? colors.dark[100] : colors.light[100],
              }}
              className="font-msemibold text-lg ml-3"
            >
              Saved Posts
            </Text>
            <TouchableOpacity
              onPress={toggleSavedPostModal}
              className="ml-auto pr-5"
            >
              <Text
                style={{
                  color: colorScheme === "dark" ? colors.dark[100] : "#D9D9D9",
                }}
                className="font-msemibold mt-2"
              >
                Close
              </Text>
            </TouchableOpacity>
          </View>

          <SavedPosts />
        </View>
      </Modal>

      <Modal
        visible={isLikedPostModalVisible}
        onRequestClose={toggleLikedPostModal}
        animationType="slide"
      >
        <View
          className="flex-1 "
          style={{
            backgroundColor:
              colorScheme === "dark" ? colors.dark[300] : colors.light[500],
          }}
        >
          <View className="flex-row mt-16">
            <Text
              style={{
                color:
                  colorScheme === "dark" ? colors.dark[100] : colors.light[100],
              }}
              className="font-msemibold text-lg ml-3"
            >
              Liked Posts
            </Text>
            <TouchableOpacity
              onPress={toggleLikedPostModal}
              className="ml-auto pr-5"
            >
              <Text
                style={{
                  color: colorScheme === "dark" ? colors.dark[100] : "#D9D9D9",
                }}
                className="font-msemibold mt-2"
              >
                Close
              </Text>
            </TouchableOpacity>
          </View>

          <LikedPosts />
        </View>
      </Modal>

      <Modal
        visible={isChangePasswordModalVisible}
        onRequestClose={toggleChangePasswordModal}
        animationType="slide"
      >
        <View
          className="flex-1"
          style={{
            backgroundColor:
              colorScheme === "dark" ? colors.dark[300] : colors.light[500],
          }}
        >
          <View className="flex-row  mt-16">
            <Text
              style={{
                color:
                  colorScheme === "dark" ? colors.dark[100] : colors.light[100],
              }}
              className="font-msemibold text-lg ml-3"
            >
              Change password
            </Text>
            <TouchableOpacity
              onPress={toggleChangePasswordModal}
              className="ml-auto pr-5"
            >
              <Text
                style={{
                  color: colorScheme === "dark" ? colors.dark[100] : "#D9D9D9",
                }}
                className="font-msemibold mt-2"
              >
                Close
              </Text>
            </TouchableOpacity>
          </View>
          <ChangePassword
            toggleChangePasswordModal={toggleChangePasswordModal}
          />
        </View>
      </Modal>
    </>
  );
};

export default Setting;
