import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Modal } from "react-native";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { colors } from "@/styles/colors";
import {
  LocationPinIcon,
  JobIcon,
  DobIcon,
  GenderFemaleIcon,
  GenderMaleIcon,
  EmailIcon,
  CalendarIcon,
  PenIcon,
  LikeIcon,
  HobbyIcon,
} from "@/components/shared/icons/Icons";
import UpdateInformation from "../../forms/setting/UpdateInformation";

const DetailRow = ({
  icon: Icon,
  value,
  color,
}: {
  icon: React.FC<{ size?: number; color?: string }>;
  value: string;
  color: string;
}) => (
  <View className="flex-row items-center space-x-3 mb-4">
    <Icon size={24} color={color} />
    <Text className="text-[16px] font-mregular" style={{ color }}>
      {value}
    </Text>
  </View>
);

const DetailInformation = ({ profileUser, setProfileUser }: any) => {
  const [showEdit, setShowEdit] = useState(false);
  const [isMe, setIsMe] = useState(false);
  const { profile } = useAuth();
  const { colorScheme } = useTheme();
  const iconColor =
    colorScheme === "dark" ? colors.dark[100] : colors.light[100];

  useEffect(() => {
    if (profile?._id && profile?._id === profileUser?._id) {
      setIsMe(true);
    }
  }, [profileUser?._id]);

  const textColor =
    colorScheme === "dark" ? colors.dark[100] : colors.light[100];

  const formattedDate = (date: string) => {
    try {
      return new Date(date).toLocaleDateString("en-GB"); // dd/mm/yyyy
    } catch {
      return date;
    }
  };

  return (
    <View>
      <Text
        className="mb-3 text-[16px] font-msemibold"
        style={{ color: textColor }}
      >
        Information
      </Text>
      <View
        className=" rounded-[10px] px-5 py-5"
        style={{
          backgroundColor:
            colorScheme === "dark" ? colors.dark[200] : colors.light[200],
        }}
      >
        {profileUser?.address && (
          <DetailRow
            icon={LocationPinIcon}
            value={profileUser.address}
            color={iconColor}
          />
        )}
        {profileUser?.job && (
          <DetailRow icon={JobIcon} value={profileUser.job} color={textColor} />
        )}
        {profileUser?.relationShip && (
          <DetailRow
            icon={LikeIcon}
            value={profileUser.relationShip}
            color={textColor}
          />
        )}
        {profileUser?.birthDay && (
          <DetailRow
            icon={DobIcon}
            value={formattedDate(profileUser.birthDay)}
            color={textColor}
          />
        )}
        {profileUser?.gender !== undefined && (
          <DetailRow
            icon={profileUser.gender ? GenderMaleIcon : GenderFemaleIcon}
            value={profileUser.gender ? "Male" : "Female"}
            color={textColor}
          />
        )}
        {profileUser?.email && (
          <DetailRow
            icon={EmailIcon}
            value={profileUser.email}
            color={textColor}
          />
        )}
        {profileUser?.attendDate && (
          <DetailRow
            icon={CalendarIcon}
            value={formattedDate(profileUser.attendDate)}
            color={textColor}
          />
        )}

        {profileUser?.hobbies?.length > 0 && (
          <View className="mt-6 flex flex-row space-x-2">
            <HobbyIcon size={24} color={iconColor} />
            <View className="flex-row flex-wrap  gap-2">
              {profileUser.hobbies.map((hobby: string, index: number) => (
                <View
                  key={index}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    borderRadius: 999,
                    backgroundColor:
                      colorScheme === "dark"
                        ? colors.dark[400]
                        : colors.light[400],
                    alignItems: "center",
                    justifyContent: "center",
                    alignSelf: "flex-start",
                  }}
                >
                  <Text
                    style={{
                      color:
                        colorScheme === "dark"
                          ? colors.dark[100]
                          : colors.light[100],
                    }}
                    className="font-mmedium text-4"
                  >
                    {hobby}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View className="flex-row items-center justify-between mt-5">
          {isMe && (
            <TouchableOpacity
              style={{
                backgroundColor:
                  colorScheme === "dark" ? colors.dark[400] : colors.light[400],
              }}
              className="ml-auto py-3 px-3 rounded-full"
              onPress={() => setShowEdit(true)}
            >
              <PenIcon size={18} color={colors.primary[100]} />
            </TouchableOpacity>
          )}
        </View>

        <Modal
          animationType="slide"
          transparent={true}
          visible={showEdit}
          onRequestClose={() => setShowEdit(false)}
        >
          <View
            style={{
              backgroundColor:
                colorScheme === "dark" ? colors.dark[500] : colors.light[500],
              flex: 1,
            }}
          >
            <UpdateInformation
              profileUser={profileUser}
              setProfileUser={setProfileUser}
              onClose={() => setShowEdit(false)}
            />
          </View>
        </Modal>
      </View>
    </View>
  );
};

export default DetailInformation;
