import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

const Profil = () => {
    const router = useRouter();

    async function save(key) {
        await SecureStore.deleteItemAsync(key);
    }

    const handleLogout = async () => {
        save('token');
        alert('Déconnexion réussie');
        router.replace('/login');
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Profil</Text>
            <TouchableOpacity style={styles.button} onPress={handleLogout}>
                <Text style={styles.buttonText}>Logout</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#121212', 
        padding: 20,
    },
    title: {
        fontSize: 36,
        marginBottom: 40,
        color: '#00FF00',
        fontFamily: 'Roboto',
        textShadowColor: '#8A2BE2', 
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 10,
        textAlign: 'center',
        textTransform: 'uppercase',
        letterSpacing: 2,
    },
    button: {
        backgroundColor: 'linear-gradient(45deg, #00FF00, #8A2BE2)', 
        paddingVertical: 12,
        paddingHorizontal: 25,
        borderRadius: 8,
        shadowColor: '#8A2BE2', 
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.8,
        shadowRadius: 10,
        elevation: 5,
    },
    buttonText: {
        color: '#8A2BE2', 
        fontSize: 18,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
});

export default Profil;
