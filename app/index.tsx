import { useEffect, useState } from "react";
import { Text } from "react-native";
import { useRouter } from "expo-router";
import apiClient from "@/lib/api-client";
import { API_URL } from "@/lib/constants";

export default function RootLayout() {
  const [state, setState] = useState<states>(states.INIT);
  const router = useRouter();

  useEffect(() => {
    const getLoginState = async () => {
      try {
        await apiClient.get(`${API_URL}/me`);
        setState(states.IS_LOGGED_IN);
      } catch (error) {
        console.log(error);
        setState(states.IS_NOT_LOGGED_IN);
      }
    };

    getLoginState();
  }, []);

  switch (state) {
    case states.INIT:
      return <Text>Loading...</Text>;
    case states.IS_LOGGED_IN:
      setTimeout(() => {
        router.push("/users");
      }, 2000);
      return <Text>You are already logged in. Redirecting to /users...</Text>;
    case states.IS_NOT_LOGGED_IN:
      setTimeout(() => {
        router.push("/continue");
      }, 2000);

      return (
        <Text>
          You aren't logged in, redirecting to http://localhost:4000/login
        </Text>
      );
  }
}

enum states {
  INIT,
  IS_LOGGED_IN,
  IS_NOT_LOGGED_IN,
}
