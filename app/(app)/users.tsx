import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { API_URL } from "@/lib/constants";
import apiClient from "@/lib/api-client";

type User = {
  id: number;
  name: string;
};

export default function Users() {
  const [users, setUsers] = useState<User[] | null>(null);
  const [error, setError] = useState<{ error: string; status: number } | null>(
    null
  );
  const [newUserName, setNewUserName] = useState("");
  const router = useRouter();

  useEffect(() => {
    // 5.1 Client makes a request via the AuthBFF, ensuring that cookies are sent
    apiClient
      .get<User[]>(`${API_URL}/users`)
      .then((response) => {
        if (response.data) {
          setUsers(response.data);
        }
      })
      .catch((error) => {
        setError({ error: error.message, status: 500 });
      });
  }, []);

  useEffect(() => {
    if (error?.status === 401) {
      // redirect to login
      router.push("/");
    }
  }, [error]);

  const addUser = () => {
    apiClient
      .post<User>(`${API_URL}/users`, { name: newUserName })
      .then((response) => {
        setUsers((prevUsers) => [...(prevUsers || []), response.data]);
        setNewUserName("");
      })
      .catch((error) => {
        console.error("Failed to add user", error);
        setError({ error: error.message, status: error.response?.status });
      });
  };

  const deleteUser = (id: number) => {
    apiClient
      .delete(`${API_URL}/users/${id}`)
      .then(() => {
        setUsers((prevUsers) =>
          prevUsers ? prevUsers.filter((user) => user.id !== id) : null
        );
      })
      .catch((error) => {
        console.error("Failed to delete user", error);
        router.push("/");
      });
  };

  // TODO handle 401
  // first of all it shouldn't happen for web, the BFF should refresh the token
  // but let's say refresh token has also expired
  // in that case, we should redirect to login
  // whereas for app, it should handle the refresh of the token, and we should do this in the axios interceptor
  if (error) {
    setTimeout(() => {
      router.push("/");
    }, 2000);
    return (
      <>
        <Text>Error, redirecting to home</Text>
        <Text>{JSON.stringify(error.error)}</Text>
      </>
    );
  }

  if (users === null) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Users</Text>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Enter new user name"
          value={newUserName}
          onChangeText={setNewUserName}
        />
        <Button title="Add User" onPress={addUser} />
      </View>

      <FlatList
        data={users}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.userItem}>
            <Text style={styles.userName}>{item.name}</Text>
            <Button
              title="Delete"
              color="#f22"
              onPress={() => deleteUser(item.id)}
            />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: "center",
  },
  form: {
    flexDirection: "row",
    marginBottom: 20,
  },
  input: {
    flex: 1,
    borderColor: "#ccc",
    borderWidth: 1,
    marginRight: 10,
    paddingHorizontal: 10,
    height: 40,
    fontSize: 16,
  },
  userItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  userName: {
    flex: 1,
    fontSize: 18,
  },
});
