import { useEffect, useState } from "react";
import { Text } from "react-native";
import { useRouter } from "expo-router";
import { BASE_URL } from "@/constants/paths";

const authServer = "http://localhost:4000";
const redirectUri = `${BASE_URL}/bff/continue`;
const authLoginPage = `${authServer}/login?redirect_uri=${redirectUri}&client_id=client123`;

export default function RootLayout() {
  const [state, setState] = useState<states>(states.INIT);
  const router = useRouter();

  useEffect(() => {
    fetch(`${BASE_URL}/api/me`, { credentials: "include" }).then((response) => {
      if (response.ok) {
        response.json().then(() => {
          setState(states.IS_LOGGED_IN);
        });
      } else {
        setState(states.IS_NOT_LOGGED_IN);
      }
    });
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
        router.push(authLoginPage);
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
