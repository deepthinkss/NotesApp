// authScreen.js
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Dimensions,
  Alert,
  ImageBackground,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";


const { width, height } = Dimensions.get("window");

// Auth Screen Component
function AuthScreen({ setUser, setDarkMode, darkMode }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleAuth = () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (!isLogin && password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    // Simulate successful authentication
    setUser({ email, name: email.split('@')[0] });
  };

  const appStyles = darkMode ? authStyles.dark : authStyles.light;

  return (
    
    <ImageBackground
      source={require('./assets/auth.jpg')}
      style={authStyles.background}
      blurRadius={darkMode ? 10 : 5}
    >
      <SafeAreaView style={[authStyles.container, appStyles.container]}>
        {/* Header */}
        <View style={authStyles.header}>
          <Text style={[authStyles.heading, appStyles.heading]}>
            {isLogin ? '𝗪𝗲𝗹𝗰𝗼𝗺𝗲 𝗕𝗮𝗰𝗸' : '𝗖𝗿𝗲𝗮𝘁𝗲 𝗔𝗰𝗰𝗼𝘂𝗻𝘁'}
          </Text>
          
          <View style={authStyles.headerRight}>
            <Switch
              value={darkMode}
              onValueChange={() => setDarkMode(!darkMode)}
              thumbColor={darkMode ? "#f57c00" : "#aaa"}
              trackColor={{ true: "#444", false: "#ddd" }}
            />
          </View>
        </View>

        {/* Auth Form */}
        <View style={[authStyles.formContainer, appStyles.formContainer]}>
          <View style={[authStyles.inputContainer, appStyles.inputContainer]}>
            <Ionicons 
              name="mail-outline" 
              size={20} 
              color={darkMode ? "#aaa" : "#555"} 
              style={authStyles.inputIcon}
            />
            <TextInput
              style={[authStyles.input, appStyles.input]}
              placeholder="Email"
              placeholderTextColor={darkMode ? "#aaa" : "#555"}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={[authStyles.inputContainer, appStyles.inputContainer]}>
            <Ionicons 
              name="lock-closed-outline" 
              size={20} 
              color={darkMode ? "#aaa" : "#555"} 
              style={authStyles.inputIcon}
            />
            <TextInput
              style={[authStyles.input, appStyles.input]}
              placeholder="Password"
              placeholderTextColor={darkMode ? "#aaa" : "#555"}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          {!isLogin && (
            <View style={[authStyles.inputContainer, appStyles.inputContainer]}>
              <Ionicons 
                name="lock-closed-outline" 
                size={20} 
                color={darkMode ? "#aaa" : "#555"} 
                style={authStyles.inputIcon}
              />
              <TextInput
                style={[authStyles.input, appStyles.input]}
                placeholder="Confirm Password"
                placeholderTextColor={darkMode ? "#aaa" : "#555"}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />
            </View>
          )}

          <TouchableOpacity
            style={[authStyles.authButton, appStyles.authButton]}
            onPress={handleAuth}
          >
            <Text style={authStyles.authButtonText}>
              {isLogin ? 'Login' : 'Sign Up'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={authStyles.switchAuth}
            onPress={() => setIsLogin(!isLogin)}
          >
            <Text style={[authStyles.switchAuthText, appStyles.switchAuthText]}>
              {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Login"}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </ImageBackground>
    
  );
}

// Auth Screen Styles
const authStyles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 40,
    paddingTop: 20,
    backgroundColor: "transparent",
    borderRadius: 20,
    padding: 10,
  },
  heading: {
    fontSize: 34,
    fontWeight: 900,
    marginLeft: 18,
    textAlign: "center",
    marginBottom: 10,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  formContainer: {
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 25,
    marginTop: 20,
    borderColor: "orange",
    borderWidth: 1,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    borderRadius: 15,
    paddingHorizontal: 15,
    height: 50,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    padding: 12,
    fontSize: 16,
  },
  authButton: {
    padding: 15,
    borderRadius: 15,
    alignItems: "center",
    marginTop: 20,
  },
  authButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  switchAuth: {
    marginTop: 20,
    alignItems: "center",
  },
  switchAuthText: {
    fontSize: 14,
    fontWeight: '500',
  },
  light: {
    container: { backgroundColor: "transparent" },
    heading: { color: "white", textShadowColor: 'rgba(0, 0, 0, 0.5)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 3 },
    formContainer: { backgroundColor: "rgba(255, 255, 255, 0.85)" },
    inputContainer: { backgroundColor: "rgba(255, 255, 255, 0.9)" },
    input: { color: "black" },
    authButton: { backgroundColor: "#f57c00" },
    switchAuthText: { color: "white", textShadowColor: 'rgba(0, 0, 0, 0.5)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 2 },
  },
  dark: {
    container: { backgroundColor: "transparent" },
    heading: { color: "white", textShadowColor: 'rgba(0, 0, 0, 0.7)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 3 },
    formContainer: { backgroundColor: "rgba(0, 0, 0, 0.4)" },
    inputContainer: { backgroundColor: "rgba(255, 255, 255, 0.1)" },
    input: { color: "white" },
    authButton: { backgroundColor: "#f57c00" },
    switchAuthText: { color: "white", textShadowColor: 'rgba(0, 0, 0, 0.7)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 2 },
  },
});

export default AuthScreen; // Make sure to export as default