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
import { BASE_URL } from "@/constants/paths";

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
    fetch(`${BASE_URL}/api/users`, { credentials: "include" })
      .then((response) => {
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
    fetch(`${BASE_URL}/api/users`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: newUserName }),
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else if (response.status === 401) {
          router.push("/");
          return null;
        } else {
          return response.json().then((error) => {
            setError({ error, status: response.status });
          });
        }
      })
      .then((user) => {
        if (user) {
          setUsers((prevUsers) => [...(prevUsers || []), user]);
          setNewUserName("");
        }
      });
  };

  const deleteUser = (id: number) => {
    fetch(`api/users/${id}`, {
      method: "DELETE",
      credentials: "include",
    }).then((response) => {
      if (response.ok) {
        // Remove user from state
        setUsers((prevUsers) =>
          prevUsers ? prevUsers.filter((user) => user.id !== id) : null
        );
      } else if (response.status === 401) {
        router.push("/");
      } else {
        return response.json().then((error) => {
          throw new Error(error.message || "Failed to delete user");
        });
      }
    });
  };

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
