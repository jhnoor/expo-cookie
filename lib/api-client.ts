import axios from "axios";
import { API_URL, IS_WEB } from "./constants";
import * as SecureStore from "expo-secure-store";
import { AuthResponse } from "@/servers/models";

const apiClient = axios.create({
  baseURL: API_URL,
});

apiClient.interceptors.request.use(
  async (config) => {
    config.withCredentials = true;

    if (!IS_WEB) {
      // TODO cache
      const authJson = await SecureStore.getItemAsync("auth");

      if (authJson) {
        const auth: AuthResponse = JSON.parse(authJson);
        config.headers.Authorization = `Bearer ${auth.access_token.token}`;
      } else {
        // TODO redirect to login
      }
    }

    return config;
  },
  (error: Error) => {
    console.error(error);
    return Promise.reject(error);
  }
);

export default apiClient;
