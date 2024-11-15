import { Platform } from "react-native";

export const IS_WEB = Platform.OS === "web";

export const AUTH_SERVER = "http://localhost:4000";
export const API_SERVER = "http://localhost:3000";

export const BASE_URL = "http://localhost:8081";

const APP_API_URL = "http://localhost:3000/api";
const WEB_API_URL = "http://localhost:8081/api";
export const API_URL = IS_WEB ? WEB_API_URL : APP_API_URL;

export const WEB_CLIENT_ID = "myWebClient";
export const NATIVE_CLIENT_ID = "myNativeClient";

export const SECURE_STORE_KEYS = {
  ACCESS_TOKEN: "access_token",
  REFRESH_TOKEN: "refresh_token",
  EXPIRES_AT: "expires_at",
};
