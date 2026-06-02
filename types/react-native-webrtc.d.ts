declare module "react-native-webrtc" {
  import type { ComponentType } from "react";
  import type { StyleProp, ViewStyle } from "react-native";

  export interface MediaStream {
    toURL(): string;
  }

  export interface RTCViewProps {
    streamURL: string;
    style?: StyleProp<ViewStyle>;
    mirror?: boolean;
    objectFit?: "contain" | "cover";
  }

  export const RTCView: ComponentType<RTCViewProps>;
}
