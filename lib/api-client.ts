import axios from "axios";
import {
  API_URL,
  AUTH_SERVER,
  IS_WEB,
  NATIVE_CLIENT_ID,
  SECURE_STORE_KEYS,
} from "./constants";
import * as SecureStore from "expo-secure-store";
import { AuthResponse } from "@/servers/models";

const apiClient = axios.create({
  baseURL: API_URL,
});

const memory = {
  accessToken: null as string | null,
  refreshToken: null as string | null,
  expiresAt: null as Date | null,
};

async function loadFromSecureStore(): Promise<void> {
  if (!memory.refreshToken) {
    memory.refreshToken = await SecureStore.getItemAsync(
      SECURE_STORE_KEYS.REFRESH_TOKEN
    );
  }
  if (!memory.accessToken) {
    memory.accessToken = await SecureStore.getItemAsync(
      SECURE_STORE_KEYS.ACCESS_TOKEN
    );
  }
  if (!memory.expiresAt) {
    const expiresAt = await SecureStore.getItemAsync(
      SECURE_STORE_KEYS.EXPIRES_AT
    );
    if (expiresAt) {
      memory.expiresAt = new Date(parseInt(expiresAt, 10));
    }
  }
}

async function refreshAccessToken(): Promise<void> {
  console.log("Access token expired. Refreshing...");

  try {
    const response = await apiClient.post<AuthResponse>(
      `${AUTH_SERVER}/token`,
      {
        grant_type: "refresh_token",
        refresh_token: memory.refreshToken,
        client_id: NATIVE_CLIENT_ID,
      }
    );

    console.log("Successfully refreshed access token", response.data);
    memory.accessToken = response.data.access_token.token;
    memory.expiresAt = new Date(
      response.data.access_token.expires_in * 1000 + Date.now()
    );

    await SecureStore.setItemAsync(
      SECURE_STORE_KEYS.ACCESS_TOKEN,
      memory.accessToken
    );
    await SecureStore.setItemAsync(
      SECURE_STORE_KEYS.EXPIRES_AT,
      memory.expiresAt.toString()
    );
  } catch (error) {
    console.error("Failed to refresh access token: " + error);
    throw error;
  }
}

function isTokenExpired(): boolean {
  return memory.expiresAt !== null && memory.expiresAt < new Date();
}

function handleMissingTokens(): void {
  if (!memory.accessToken || !memory.refreshToken || !memory.expiresAt) {
    throw new Error(
      "Missing access token, refresh token, or expiresAt. User needs to log in."
    );
  }
}

apiClient.interceptors.request.use(
  async (config) => {
    config.withCredentials = true;

    // ignore auth server token requests
    if (config.url === `${AUTH_SERVER}/token`) {
      return config;
    }

    // tokens are locally stored only in app
    if (!IS_WEB) {
      try {
        // load tokens from secure store into memory
        await loadFromSecureStore();
        // check if tokens are missing
        handleMissingTokens();

        // refresh access token if it's expired
        if (isTokenExpired()) {
          await refreshAccessToken();
        }
      } catch (error) {
        console.warn(error);
        // TODO silently failing, take another look at this later
      }
      config.headers.Authorization = `Bearer ${memory.accessToken}`;
    }

    return config;
  },
  (error: Error) => {
    console.error(error);
    return Promise.reject(error);
  }
);

export default apiClient;
