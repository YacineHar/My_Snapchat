import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import axios from "axios";
import * as SecureStore from "expo-secure-store";

const UserRecup = () => {
  const [username, setUsername] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = await SecureStore.getItemAsync("token");
        const response = await axios.get("https://snapchat.epidoc.eu/user", {
          headers: {
            "X-API-Key":
              "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im1hdGhpZXUuZ2F1ZHJvbkBlcGl0ZWNoLmV1IiwiaWF0IjoxNzE3NzYyNjk3fQ.8vMA0b4Qi4M85ikQbW3TLT-1oOpzNlzBIIy-vf7MfDU",
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.status === 200) {
          setUsername(response.data.data);
        } else {
          console.error("Erreur recup user", response.statusText);
        }
      } catch (error) {
        console.error("Erreur catch recup user", error);
      }
    };

    fetchUsers();
  }, []);

  if (username.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={{ color: "white" }}>Loading</Text>
      </View>
    );
  }

  return (
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
    <View style={styles.container}>
      <Text style={styles.title}>Liste des utilisateurs</Text>
        {username.map((user) => (
          <View key={user._id} style={styles.userContainer}>
            <Text style={styles.userId}>ID: {user._id}</Text>
            <Text style={styles.username}>Pseudo: {user.username}</Text>
          </View>
        ))}
    </View>
      </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f0f0f0",
  },
  title: {
    fontSize: 25,
    marginBottom: 20,
  },
  scrollViewContent: {
    alignItems: "center",
  },
  userContainer: {
    marginBottom: 10,
    backgroundColor: "white",
    padding: 10,
    borderRadius: 5,
    width: "90%",
    alignItems: "center",
  },
  userId: {
    fontWeight: "bold",
  },
  username: {
    fontStyle: "italic",
  },
});

export default UserRecup;
