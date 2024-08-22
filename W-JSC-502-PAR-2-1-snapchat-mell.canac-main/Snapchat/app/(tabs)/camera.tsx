import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { useRef, useState, useEffect } from "react";
import * as ImageManipulator from 'expo-image-manipulator';
import {
  Button,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  ScrollView,
  Alert,
  Modal,
} from "react-native";
import axios from "axios";
import * as SecureStore from "expo-secure-store";

export default function App() {
  const [facing, setFacing] = useState("back");
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef(null);
  const [camera, setCamera] = useState(null);
  const [image, setImage] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

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
          setUsers(response.data.data);
        } else {
          console.error("Erreur recup user", response.statusText);
        }
      } catch (error) {
        console.error("Erreur catch recup user", error);
      }
    };

    fetchUsers();
  }, []);

  if (!permission) {
    return <View />;
  }

  const takePicture = async () => {
    console.log("PRISE DE PHOTO");
    const data = await cameraRef?.current?.takePictureAsync(null);
    await compressImage(data.uri); 
    setIsModalVisible(true); 
  };

  const compressImage = async (uri) => {
    const manipResult = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 400, height:400 } }], 
      { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
    );
    setImage(manipResult.uri);
  };

  const pickImageFromGallery = async () => {
    console.log("PRISE DANS LA GALERIE");
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.canceled) {
      await compressImage(result.assets[0].uri);
    }
  };
  const toggleCameraFacing = () => {
    setFacing((current) => (current === "back" ? "front" : "back"));
  };

  const deletePicture = () => {
    setImage(null);
  };
  const getBase64 = async (uri) => {
    const response = await fetch(uri);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result.split(',')[1]);
      };
      reader.onerror = (error) => {
        reject(error);
      };
      reader.readAsDataURL(blob);
    });
  };
  const sendPicture = async () => {
    if (image && selectedUser) {
      try {
        const token = await SecureStore.getItemAsync("token");  
        let base64Img = await getBase64(image);
  
        const requestBody = {
          to: selectedUser,
          image: `data:image/jpeg;base64,${base64Img}`,
          duration: 5 
        };
  
        console.log("Request Body: ", requestBody); 
  
        const response = await fetch('https://snapchat.epidoc.eu/snap', {
          method: 'POST',
          headers: {
            "X-API-Key": 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im1hdGhpZXUuZ2F1ZHJvbkBlcGl0ZWNoLmV1IiwiaWF0IjoxNzE3NzYyNjk3fQ.8vMA0b4Qi4M85ikQbW3TLT-1oOpzNlzBIIy-vf7MfDU',
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json', 
          },
          body: JSON.stringify(requestBody) 
        });
  
        console.log("Response Status: ", response.status); 
        console.log("Response Data: ", await response.text()); 
  
        if (response.status === 200) {
          Alert.alert('Success', 'Image sent successfully');
          setImage(null);
          setSelectedUser(null); 
        } else {
          Alert.alert('Error', 'Failed to send image');
        }
  
      } catch (error) {
        console.error("Error sending image: ", error); 
        Alert.alert('Error', 'Failed to send image');
      }
    } else {
      Alert.alert('Warning', 'Please take a picture and select a user first');
    }
  };
  

  const handleUserSelection = (userId) => {
    setSelectedUser(userId);
    setIsModalVisible(false);
    sendPicture(); 
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing={facing}
        ref={cameraRef}
      ></CameraView>
      <View style={styles.flipButtonContainer}>
        <TouchableOpacity
          style={styles.flipButton}
          onPress={toggleCameraFacing}
        >
          <Text style={styles.text}>Flip</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.bottomButtonContainer}>
        <TouchableOpacity style={styles.captureButton} onPress={takePicture} />
      </View>
      {image && <Image source={{ uri: image }} style={styles.preview} />}
      <View style={styles.imageContainer}></View>
      {image && <Image source={{ uri: image }} style={styles.image} />}
      <TouchableOpacity style={styles.deleteButton} onPress={deletePicture}>
        <Text style={styles.buttonText}>X</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.galleryButton}
        onPress={pickImageFromGallery}
      >
        <Text style={styles.text}>Galerie</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.sendButton} onPress={() => setIsModalVisible(true)}>
        <Text style={styles.buttonText}>Envoyer</Text>
      </TouchableOpacity>

      <Modal
  animationType="slide"
  transparent={true}
  visible={isModalVisible}
  onRequestClose={() => setIsModalVisible(false)}
>
  <View style={styles.modalView}>
    <TouchableOpacity
      style={styles.closeModalButton}
      onPress={() => setIsModalVisible(false)}
    >
      <Text style={styles.closeModalButtonText}>X</Text>
    </TouchableOpacity>

    <Text style={styles.modalText}>Sélectionner un utilisateur</Text>
    <ScrollView contentContainerStyle={styles.scrollViewContent}>
      {users.map((user) => (
        <TouchableOpacity
          key={user._id}
          style={[
            styles.userContainer,
            user._id === selectedUser ? styles.selectedUser : null
          ]}
          onPress={() => handleUserSelection(user._id)}
        >
          <Text style={styles.username}>{user.username}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  </View>
</Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  camera: {
    flex: 1,
  },
  flipButtonContainer: {
    position: "absolute",
    top: 30,
    right: 30,
    zIndex: 2,
  },
  flipButton: {
    width: 50,
    height: 50,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
  },
  bottomButtonContainer: {
    position: "absolute",
    bottom: 30,
    left: "50%",
    marginLeft: -35,
    zIndex: 2,
  },
  captureButton: {
    width: 70,
    height: 70,
    backgroundColor: "white",
    borderRadius: 35,
  },
  text: {
    fontSize: 14,
    color: "black",
  },
  preview: {
    flex: 1,
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  galleryButton: {
    width: 70,
    height: 50,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    position: "absolute",
    top: 30,
    left: 100,
  },
  deleteButton: {
    position: "absolute",
    top: 30,
    left: 30,
    width: 50,
    height: 50,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
  },
  sendButton: {
    position: 'absolute',
    top: 30,
    left: 200,
    width: 70,
    height: 50,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
 
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  userContainer: {
    padding: 10,
    marginBottom: 10,
    backgroundColor: "lightgray",
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
  },
  selectedUser: {
    backgroundColor: "gray",
  },
  username: {
    fontSize: 16,
  },
  closeButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "lightgray",
    borderRadius: 10,
  },
  scrollViewContent: {
    alignItems: "center",
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
  },
});
