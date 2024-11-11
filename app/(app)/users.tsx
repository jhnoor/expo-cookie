import { useEffect, useState } from "react";
import { Text } from "react-native";
import { useRouter } from "expo-router";

interface User {
  id: number;
  name: string;
}

export default function Users() {
  const [users, setUsers] = useState<User[] | null>(null);
  const [error, setError] = useState<{ error: string; status: number } | null>(
    null
  );

  const router = useRouter();

  useEffect(() => {
    fetch("api/users", { credentials: "include" }).then((response) => {
      if (response.ok) {
        response.json().then((users: User[]) => {
          setUsers(users);
        });
      } else {
        response.json().then((error) => {
          setError({ error, status: response.status });
          setUsers([]);
        });
      }
    });
  }, []);

  useEffect(() => {
    if (error?.status === 401) {
      // redirect to login
      router.push("/");
    }
  }, [error]);

  if (error) {
    return (
      <>
        <Text>Error</Text>
        {error && <p>{JSON.stringify(error.error)}</p>}
      </>
    );
  }

  if (users === null) {
    return <Text>Loading...</Text>;
  }

  return (
    <>
      <Text style={{ marginBottom: 10 }}>Users</Text>

      {users.map((user) => (
        <Text key={user.id}>{user.name}</Text>
      ))}
    </>
  );
}
