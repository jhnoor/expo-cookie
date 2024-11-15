// Contrary to the web client, native clients can securely exchange codes for both access and refresh tokens, and store them securely on the device.
// This is because native clients can use the platform's secure storage mechanisms, such as Keychain on iOS or Keystore on Android.
// This is why the native client redirects to the app's own continue page, rather than the server-side BFF.
// The server-side BFF is only used for web clients, which cannot securely store tokens on the device.

import { Text } from "react-native";
import * as WebBrowser from "expo-web-browser";
import {
  AUTH_SERVER,
  BASE_URL,
  IS_WEB,
  NATIVE_CLIENT_ID,
  WEB_CLIENT_ID,
} from "@/lib/constants";
import { useRouter } from "expo-router";
import { AuthResponse } from "@/servers/models";
import * as SecureStore from "expo-secure-store";
import { useEffect } from "react";
import apiClient from "@/lib/api-client";

const redirectUri = IS_WEB
  ? `${BASE_URL}/bff/continue`
  : "expocookie://continue";
const clientId = IS_WEB ? WEB_CLIENT_ID : NATIVE_CLIENT_ID;
const authLoginPage = `${AUTH_SERVER}/login?redirect_uri=${redirectUri}&client_id=${clientId}`;

export default function Continue() {
  const router = useRouter();

  useEffect(() => {
    if (IS_WEB) {
      // open url but not in new tab
      // TODO would it be smoother for users to open in new tab?
      window.location.href = authLoginPage;
    } else {
      const login = async () => {
        const result = await WebBrowser.openAuthSessionAsync(authLoginPage);

        if (result.type === "cancel") {
          console.error("User cancelled the login flow");
          router.back();
        }

        if (result.type === "success" && result.url) {
          // get the code from the URL
          const code = new URL(result.url).searchParams.get("code");
          if (!code) {
            console.error("No code found in the URL: " + result.url);
            return;
          }

          // exchange the code for an access token
          try {
            const response = await apiClient.post<AuthResponse>(
              `${AUTH_SERVER}/token`,
              {
                code,
                grant_type: "authorization_code",
                client_id: clientId,
              }
            );

            console.log(
              "Successfully exchanged code for tokens",
              response.data
            );
            SecureStore.setItemAsync(
              "access_token",
              response.data.access_token.token
            );
            SecureStore.setItemAsync(
              "refresh_token",
              response.data.refresh_token!.token
            );
            // set a datetime for when the token expires
            SecureStore.setItemAsync(
              "expires_at",
              (Date.now() + response.data.access_token.expires_in).toString()
            );
          } catch (error) {
            console.error("Failed to exchange code for token: " + error);
            return;
          }

          // redirect to /
          if (router.canGoBack()) {
            router.back();
          } else {
            router.push("/");
          }
        }
      };

      login();
    }
  });

  return <Text>Continue</Text>;
}
