import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import axios from 'axios';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { LinearGradient } from 'expo-linear-gradient';

const SignInScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    async function save(key, value) {
        await SecureStore.setItemAsync(key, value);
    }

    const handleSignIn = async () => {
        if (email && password) {
            try {
                const response = await axios.put('https://snapchat.epidoc.eu/user', {
                    email,
                    password,
                }, {
                    headers: {
                        "X-API-Key": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im1hdGhpZXUuZ2F1ZHJvbkBlcGl0ZWNoLmV1IiwiaWF0IjoxNzE3NzYyNjk3fQ.8vMA0b4Qi4M85ikQbW3TLT-1oOpzNlzBIIy-vf7MfDU"
                    }
                });

                if (response.status === 200) {
                    alert('Connexion réussie');
                    save('token', response.data.data.token);
                    router.replace('/camera');
                }
            } catch (error) {
                alert('Erreur de connexion');
            }
        } else {
            alert('Veuillez entrer un email et un mot de passe');
        }
    };

    return (
        <LinearGradient
            colors={['#000000', '#310a70']}
            style={styles.container}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
        >
            <Text style={styles.title}>Sign In</Text>
            <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor={'white'}
                onChangeText={setEmail}
            />
            <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor={'white'}
                secureTextEntry={true}
                onChangeText={setPassword}
            />
            <TouchableOpacity style={styles.button} onPress={handleSignIn}>
                <Text style={styles.buttonText}>Sign In</Text>
            </TouchableOpacity>
        </LinearGradient>
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
        borderColor: '#00FF00',
        borderRadius: 15,
        shadowColor: '#00FF00',
        shadowOffset: { width: 8, height: 8 },
        shadowOpacity: 0.5,
        shadowRadius: 19,
        elevation: 30, 
    },
    buttonText: {
        color: '#b4f20a',
        fontWeight: 'bold',
    },
});

export default SignInScreen;