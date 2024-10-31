import { useEffect, useState } from "react";
import { Text } from "react-native";

export default function RootLayout() {
  const [text, setText] = useState("Loading...");

  useEffect(() => {
    fetch("hello").then((response) => {
      if (response.ok) {
        response.json().then((json) => {
          setText(json.message);
        });
      } else {
        setText("Error: " + response.status);
      }
    });
  }, []);

  return <Text>{text}</Text>;
}
