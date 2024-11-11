import { useEffect, useState } from "react";
import { Text } from "react-native";
import { Redirect, useRouter } from "expo-router";

const authServer = "http://localhost:4000";
const redirectUri = "http://localhost:8081/bff/continue";
const authLoginPage = `${authServer}/login?redirect_uri=${redirectUri}&client_id=client123`;

export default function RootLayout() {
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetch("bff/me", { credentials: "include" }).then((response) => {
      if (response.ok) {
        response.json().then(() => {
          setLoggedIn(true);
        });
      } else {
        setLoggedIn(false);
      }
    });
  }, []);

  if (loggedIn === null) {
    return <Text>Loading...</Text>;
  } else if (loggedIn === true) {
    return <Redirect href={"/users"} />;
  } else if (loggedIn === false) {
    router.push(authLoginPage);
  } else {
    return <Text>Unauthorized</Text>;
  }
}
