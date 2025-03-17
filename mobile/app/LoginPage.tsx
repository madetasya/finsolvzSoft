import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Modal,
} from "react-native";
import ChartLogin from "../components/ChartLogin";
import Grid from "../components/GridDecor";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { RootStackParamList } from "../types";

const API_URL = "http://159.89.194.251";

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Email and password are required!");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/login`, {
        email,
        password,
      });

      const { access_token } = response.data;
      await AsyncStorage.setItem("authToken", access_token);

      console.log("Login Success:", response.data);
      navigation.reset({
        index: 0,
        routes: [{ name: "Home" }],
      });
    } catch (error) {
      console.error("Login Error:", error);
      const errorMessage = (error as any).response?.data?.error || "Something went wrong.";
      Alert.alert("Login Failed", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert("Error", "Please enter your email.");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/forgot-password`, { email });

      console.log("Forgot Password Response:", response.data);
      setOtpSent(true);
    } catch (error) {
      console.error("Forgot Password Error:", error);
      const errorMessage = (error as any).response?.data?.error || "Something went wrong.";
      Alert.alert("Request Failed", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#ffff", "#cbe3d5", "#1d7165", "#071C25"]}
        style={styles.background}
      />

      {/* GRID */}
      <View style={styles.grid}>
        <Grid />
      </View>

      {/* LOGO FINSOLVZ */}
      <Image
        source={require("../assets/image/FinsolvzLogo.png")}
        style={styles.logo}
        resizeMode="contain"
      />

      {/* CHART LOGIN */}
      <ChartLogin />

      {/* FORM LOGIN */}
      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="E-Mail"
          placeholderTextColor="#FFFFFF"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#FFFFFF"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        {/* BUTTON LOGIN */}
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>LOGIN</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Text style={styles.forgotPassword}>Forgot Password</Text>
        </TouchableOpacity>
      </View>

      {/* MODAL FORGOT PASSWORD */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
          setOtpSent(false);
          setEmail("");
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Reset Password</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Enter your email"
              placeholderTextColor="#666"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {otpSent ? (
              <Text style={styles.successText}>
                ✅ OTP has been sent to your email!
              </Text>
            ) : (
              <TouchableOpacity style={styles.modalButton} onPress={handleForgotPassword}>
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.modalButtonText}>Send OTP</Text>
                )}
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#071C25",
    paddingTop: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  background: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  grid: {
    width: "100%",
    height: "100%",
    position: "absolute",
    top: 32,
    left: 0,
  },
  logo: {
    marginTop: 24,
    width: 150,
    height: 50,
    marginBottom: 20,
  },
  formContainer: {
    width: "80%",
    alignItems: "center",
    marginBottom: 100,
    marginTop: -90,
  },
  input: {
    width: "100%",
    height: 50,
    backgroundColor: "#071C25",
    borderColor: "#2B5256",
    borderWidth: 2,
    borderRadius: 25,
    paddingHorizontal: 16,
    color: "#FFFFFF",
    fontSize: 16,
    marginBottom: 16,
  },
  button: {
    width: "100%",
    height: 50,
    backgroundColor: "#6fb591",
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  forgotPassword: {
    color: "#6fb591",
    fontSize: 14,
    marginTop: 16,
    textAlign: "center",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: 320,
    padding: 20,
    backgroundColor: "#f4f4f4",
    borderRadius: 10,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalInput: {
    width: "100%",
    height: 45,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  modalButton: {
    width: "100%",
    backgroundColor: "#6fb591",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  modalButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  closeButton: {
    marginTop: 10,
  },
  closeButtonText: {
    color: "#6fb591",
    fontSize: 14,
  },
  successText: {
    color: "green",
    marginTop: 10,
    fontWeight: "bold",
  },
});

export default LoginPage;