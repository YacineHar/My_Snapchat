import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Modal, Dimensions } from "react-native";
import axios from "axios";
import * as SecureStore from "expo-secure-store";

const Recus = () => {
  const [snaps, setSnaps] = useState([]);
  const [snapTouch, setSnapTouch] = useState(null);
  const [modal, setModal] = useState(false);

  useEffect(() => {
    const fetchSnaps = async () => {
      try {
        const token = await SecureStore.getItemAsync("token");
        const response = await axios.get("https://snapchat.epidoc.eu/snap", {
          headers: {
            "X-API-Key":
              "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im1hdGhpZXUuZ2F1ZHJvbkBlcGl0ZWNoLmV1IiwiaWF0IjoxNzE3NzYyNjk3fQ.8vMA0b4Qi4M85ikQbW3TLT-1oOpzNlzBIIy-vf7MfDU",
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            "accept": "application/json",
          },
        });

        console.log(response.data)
        if (response.status === 200) {
          const snapsData = response.data.data;
          const updatedSnaps = await Promise.all( 
            snapsData.map(async (snap) => {
              const username = await fetchUsername(snap.from, token);
              const snapContent = await fetchSnapContent(snap._id, token);
              return { ...snap, fromUsername: username, content: snapContent };
            })
          );
          setSnaps(updatedSnaps);
        } else {
          console.error("Erreur recup snaps", response.statusText);
        }
      } catch (error) {
        console.error("Erreur catch recup snaps", error);
      }
    };

    const fetchUsername = async (userId, token) => {
      try {
        const response = await axios.get(`https://snapchat.epidoc.eu/user/${userId}`, {
          headers: {
            "X-API-Key":
              "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im1hdGhpZXUuZ2F1ZHJvbkBlcGl0ZWNoLmV1IiwiaWF0IjoxNzE3NzYyNjk3fQ.8vMA0b4Qi4M85ikQbW3TLT-1oOpzNlzBIIy-vf7MfDU",
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            "accept": "application/json",
          },
        });

        if (response.status === 200) {
          return response.data.data.username;
        } else {
          console.error("Erreur recup username", response.statusText);
          return userId;
        }
      } catch (error) {
        console.error("Erreur catch recup username", error);
        return userId;
      }
    };

    const fetchSnapContent = async (snapId, token) => {
      try {
        const response = await axios.get(`https://snapchat.epidoc.eu/snap/${snapId}`, {
          headers: {
            "X-API-Key":
              "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im1hdGhpZXUuZ2F1ZHJvbkBlcGl0ZWNoLmV1IiwiaWF0IjoxNzE3NzYyNjk3fQ.8vMA0b4Qi4M85ikQbW3TLT-1oOpzNlzBIIy-vf7MfDU",
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 200) {
          return response.data.data;
        } else {
          console.error("Erreur recup contenu snap", response.statusText);
          return null;
        }
      } catch (error) {
        console.error("Erreur catch recup contenu snap", error);
        return null;
      }
    };

    fetchSnaps();
  }, []);

  const snapVue = async () => {
    const token = await SecureStore.getItemAsync("token");
    const response = await axios.put(`https://snapchat.epidoc.eu/snap/seen/${snapTouch._id}`,
      {"success": true},
      {
        headers: {
          "X-API-Key":
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im1hdGhpZXUuZ2F1ZHJvbkBlcGl0ZWNoLmV1IiwiaWF0IjoxNzE3NzYyNjk3fQ.8vMA0b4Qi4M85ikQbW3TLT-1oOpzNlzBIIy-vf7MfDU",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.status === 200) {
      setSnaps((prevSnaps) => prevSnaps.filter((snap) => snap._id !== snapTouch._id));
      setModal(false);
    } else {
      console.error("Erreur lors de la mise à jour du snap vu:", response.status, response.data);
    }
  };

  const touchSnap = (snap) => {
    setSnapTouch(snap);
    setModal(true);
  };

  const renderItem = ({ item }) => (
    <View style={styles.snapContainer}>
      <TouchableOpacity onPress={() => touchSnap(item)}>
        <Text style={styles.sender}>De: {item.fromUsername || item.from}</Text>
      </TouchableOpacity>
      <Text style={styles.date}>Date: {new Date(item.date).toLocaleString()}</Text>
    </View>
  );

  const dimensions = Dimensions.get("window");
  const imageWidth = dimensions.width * 0.9;
  const imageHeight = dimensions.height * 0.9;

  return (
    <View style={styles.container}>
      <FlatList
        data={snaps}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.flatListContent}
        style={styles.flatList}
      />
      {snapTouch && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={modal}
          onRequestClose={snapVue}
        >
          <View style={styles.modalContainer}>
            {snapTouch.content.image && (
              <Image
                source={{ uri: snapTouch.content.image }}
                style={{ width: imageWidth, height: imageHeight }}
                resizeMode="contain"
              />
            )}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={snapVue}
            >
              <Text style={styles.closeButtonText}>X</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#16013b",
  },
  flatListContent: {
    paddingTop: 60,
    paddingBottom: 20,
  },
  flatList: {
    width: "100%",
  },
  snapContainer: {
    marginBottom: 10,
    borderWidth:1,
    borderColor:'#860ffc',
    backgroundColor: "#010003",
    padding: 10,
    borderRadius: 15,
    width: "90%",
    alignSelf: 'center',
  },
  sender: {
    fontWeight: "bold",
    color: "#d5fc0f",
  },
  date: {
    color: "#07f59a",
    marginBottom: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  closeButton: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 50,
    position: 'absolute',
    top: 20,
    left: 20,
  },
  closeButtonText: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 20,
  },
});

export default Recus;