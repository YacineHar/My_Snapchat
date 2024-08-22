import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import { router } from 'expo-router';

const SignUpScreen = () => {
   const [email, setEmail] = useState('');
   const [username, setUsername] = useState('');
   const [password, setPassword] = useState('');

   const handleSignUp = async () => {
      if (!email || !username || !password) {
         Alert.alert('Error', 'All fields are required!');
         return;
      }

      try {
         const response = await axios.post('https://snapchat.epidoc.eu/user', {
            email,
            username,
            password,
         },{
            headers: {
                "X-API-Key": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im1hdGhpZXUuZ2F1ZHJvbkBlcGl0ZWNoLmV1IiwiaWF0IjoxNzE3NzYyNjk3fQ.8vMA0b4Qi4M85ikQbW3TLT-1oOpzNlzBIIy-vf7MfDU"
            }
          });

         if (response.status === 200) {
            Alert.alert('Success', 'Account created successfully!');
            router.replace('/login')
         } else {
            Alert.alert('Error', 'Something went wrong. Please try again.');
         }
      } catch (error) {
         Alert.alert('Error', error.response.data.message);
      }
   };

   return (
      <View style={styles.container}>
         <Text style={styles.title}>Register</Text>
         <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={'#fff'}
            onChangeText={setEmail}
            value={email}
            keyboardType="email-address"
            autoCapitalize="none"
         />
         <TextInput
            style={styles.input}
            placeholder="Username"
            placeholderTextColor={'#fff'}
            onChangeText={setUsername}
            value={username}
            autoCapitalize="none"
         />
         <TextInput style={styles.input} placeholder="Password" placeholderTextColor={'#fff'} secureTextEntry={true}  onChangeText={setPassword}
            value={password}
         />
         <TouchableOpacity style={styles.button} onPress={handleSignUp}>
            <Text style={styles.buttonText}>Sign Up</Text>
         </TouchableOpacity>
      </View>
   );
};

const styles = StyleSheet.create({
   container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
  },
  title: {
      fontSize: 28,
      marginBottom: 20,
      color: '#00FF00',
      fontWeight: 'bold',
      textShadowColor: '#6545e0',
      textShadowOffset: { width: 4, height: 3 },
      textShadowRadius: 5,
      shadowColor: '#00FF00',
      shadowOffset: { width: 8, height: 8 },
      shadowOpacity: 0.5,
      shadowRadius: 19,
      elevation: 10, 
  },
  input: {
      backgroundColor: '#333',
      width: 250,
      height: 45,
      borderWidth: 1,
      borderColor: '#6529e0',
      borderRadius: 8,
      marginBottom: 15,
      paddingHorizontal: 18,
      color: '#00FF00',
      shadowColor: '#00FF00',
      shadowOffset: { width: 8, height: 8 },
      shadowOpacity: 0.5,
      shadowRadius: 19,
      elevation: 30, 
  },
  button: {
      top: 30,
      backgroundColor: '#14062e',
      paddingVertical: 13,
      paddingHorizontal: 16,
      borderWidth: 1,
      borderColor: '#05f77a',
      borderRadius: 15,
      shadowColor: '#0ff5c7',
      shadowOffset: { width: 9, height: 9 },
      shadowOpacity: 0.5,
      shadowRadius: 15,
      elevation: 35, 
  },
  buttonText: {
      color: '#05f7cf',
      fontWeight: 'bold',
  },
});

export default SignUpScreen;