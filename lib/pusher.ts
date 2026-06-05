import AsyncStorage from "@react-native-async-storage/async-storage";
import PusherModule from "pusher-js";

// DEBUG
console.log("module =", PusherModule);
console.log("module.Pusher =", (PusherModule as any)?.Pusher);
console.log("typeof module.Pusher =", typeof (PusherModule as any)?.Pusher);

// Lấy constructor thực tế
const PusherConstructor = (PusherModule as any)?.Pusher ?? PusherModule;

let _client: any = null;

const PUSHER_APP_KEY =
  process.env.EXPO_PUBLIC_PUSHER_APP_KEY || "81a84e112f8b281ca09d";

const PUSHER_CLUSTER = process.env.EXPO_PUBLIC_PUSHER_CLUSTER || "ap1";

const PUSHER_AUTH_ENDPOINT =
  `${process.env.EXPO_PUBLIC_API_URL}/pusher/auth` ||
  "http://192.168.1.7:3000/api/pusher/auth";

let dynamicToken: string | null = null;

async function bootstrapToken() {
  if (!dynamicToken) {
    dynamicToken = await AsyncStorage.getItem("accessToken");
  }
}

bootstrapToken();

function getPusherClient() {
  if (_client) return _client;

  console.log("PusherConstructor =", PusherConstructor);
  console.log("typeof PusherConstructor =", typeof PusherConstructor);

  _client = new PusherConstructor(PUSHER_APP_KEY, {
    cluster: PUSHER_CLUSTER,
    authEndpoint: PUSHER_AUTH_ENDPOINT,
    auth: {
      headers: {
        get Authorization() {
          const token = dynamicToken || (global as any)?.accessToken;

          return token ? `Bearer ${token}` : "";
        },
      },
    },
  });

  return _client;
}

export const pusherClient = {
  get client() {
    return getPusherClient();
  },

  subscribe(channel: string) {
    return getPusherClient().subscribe(channel);
  },

  unsubscribe(channel: string) {
    return getPusherClient().unsubscribe(channel);
  },

  bind(event: string, callback: (...args: any[]) => void) {
    return getPusherClient().bind(event, callback);
  },

  unbind(event: string, callback?: (...args: any[]) => void) {
    return getPusherClient().unbind(event, callback);
  },
};

export async function setPusherAuthToken(newToken?: string) {
  const token = newToken || (await AsyncStorage.getItem("accessToken"));

  if (!token) return;

  dynamicToken = token;

  const client = getPusherClient();

  if (client?.config) {
    client.config.auth = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  }
}
