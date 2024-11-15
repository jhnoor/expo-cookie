import axios from "axios";
import { API_URL, AUTH_SERVER, IS_WEB, NATIVE_CLIENT_ID } from "./constants";
import { AuthResponse } from "@/servers/models";
import { TokenStore } from "./token-store";

const apiClient = axios.create({
  baseURL: API_URL,
});

const tokenStore = TokenStore.getInstance();

async function refreshAccessToken(): Promise<void> {
  if (!tokenStore.refreshToken) {
    throw new Error("Refresh token is missing. Cannot refresh access token.");
  }

  console.log("Access token expired. Refreshing...");

  try {
    const response = await apiClient.post<AuthResponse>(
      `${AUTH_SERVER}/token`,
      {
        grant_type: "refresh_token",
        refresh_token: tokenStore.refreshToken,
        client_id: NATIVE_CLIENT_ID,
      }
    );

    console.log("Successfully refreshed access token", response.data);
    await tokenStore.setAccessToken(
      response.data.access_token.token,
      new Date(response.data.access_token.expires_in * 1000 + Date.now())
    );
  } catch (error) {
    console.error("Failed to refresh access token: " + error);
    throw error;
  }
}

function handleMissingTokens(): void {
  if (
    !tokenStore.accessToken ||
    !tokenStore.refreshToken ||
    !tokenStore.expiresAt
  ) {
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
        await tokenStore.load();
        // check if tokens are missing
        handleMissingTokens();

        // refresh access token if it's expired
        if (tokenStore.isTokenExpired()) {
          await refreshAccessToken();
        }
      } catch (error) {
        console.warn(error);
        // TODO silently failing, take another look at this later
      }
      config.headers.Authorization = `Bearer ${tokenStore.accessToken}`;
    }

    return config;
  },
  (error: Error) => {
    console.error(error);
    return Promise.reject(error);
  }
);

export default apiClient;
