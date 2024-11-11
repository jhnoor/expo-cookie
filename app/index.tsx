import { useEffect, useState } from "react";
import { Text } from "react-native";
import { Redirect } from "expo-router";

export default function RootLayout() {
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("api/login").then((response) => {
      if (response.ok) {
        response.json().then(() => {
          setTimeout(() => {
            setLoggedIn(true);
          }, 1000); // simulate loading
        });
      } else {
        setLoggedIn(false);
      }
    });
  }, []);

  if (loggedIn === null) {
    return <Text>Loading...</Text>;
  } else if (loggedIn) {
    return <Redirect href={"/users"} />;
  } else {
    return <Text>Unauthorized</Text>;
  }
}
