import axios from "axios";
import { API_URL, AUTH_SERVER, IS_WEB, NATIVE_CLIENT_ID } from "./constants";
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

apiClient.interceptors.request.use(
  async (config) => {
    config.withCredentials = true;

    // if the request is for a token, don't add the Authorization header
    if (config.url === `${AUTH_SERVER}/token`) {
      return config;
    }

    if (!IS_WEB) {
      // if there is no refresh_token in memory, check SecureStore
      if (memory.refreshToken === null) {
        memory.refreshToken = await SecureStore.getItemAsync("refresh_token");
      }

      // if there is no access_token in memory, check SecureStore
      if (memory.accessToken === null) {
        memory.accessToken = await SecureStore.getItemAsync("access_token");
      }

      // if there is no expiresAt in memory, check SecureStore
      if (memory.expiresAt === null) {
        const expiresAt = await SecureStore.getItemAsync("expires_at");
        if (expiresAt) {
          memory.expiresAt = new Date(parseInt(expiresAt));
        }
      }

      // if accessToken, refreshToken, or expiresAt is missing at this point, we need to login
      if (
        memory.accessToken === null ||
        memory.refreshToken === null ||
        memory.expiresAt === null
      ) {
        // TODO redirect to login page
        console.log(
          "Missing access token, refresh token, or expiresAt. You're on your own."
        );
        return config;
      }

      // if the access token is expired, refresh it
      if (memory.expiresAt < new Date()) {
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

          await SecureStore.setItemAsync("access_token", memory.accessToken);
          await SecureStore.setItemAsync(
            "expires_at",
            memory.expiresAt.toString()
          );
        } catch (error) {
          console.error("Failed to refresh access token: " + error);
        }
      }

      // set the Authorization header
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
