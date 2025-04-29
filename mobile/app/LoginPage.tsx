import React from 'react'
import { useState } from 'react'
import { BlurView } from 'expo-blur'
import { View, Image, Text, StyleSheet, Pressable } from 'react-native'
import { Video, ResizeMode } from 'expo-av'
import { LinearGradient } from 'expo-linear-gradient'
import { Button, HelperText, Modal, Portal, TextInput } from 'react-native-paper'
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated'
import axios from 'axios'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import { RootStackParamList } from '../types'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Constants from 'expo-constants';


const API_URL = process.env.EXPO_PUBLIC_API_URL;
console.log("API URL >>>", API_URL);



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0000',
  },
  video: {
    width: '100%',
    height: '100%',
    marginTop: -112,
  },
  gradient: {
    position: 'absolute',
    width: '100%',
    height: '104%',
    marginTop: -112,
  },
  bottomBackground: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000609',
  },
  logo: {
    position: 'absolute',
    top: '8%',
    alignSelf: 'center',
    width: 144,
    height: 48,
    resizeMode: 'contain',
    zIndex: 10,
    marginLeft: -16,
  },
  containerForm: {
    position: 'absolute',
    top: '40%',
    width: '100%',
    alignItems: 'flex-start',
    paddingHorizontal: 50,
  },

  jargonLine1: {
    fontSize: 32,
    color: '#E2E4D7',
    fontFamily: 'UbuntuMedium',
    letterSpacing: 2,
    textShadowOffset: { width: 0, height: 2 },
    textShadowColor: '#000',
    textShadowRadius: 5,
  },

  jargonLine2: {
    fontSize: 32,
    color: '#E2E4D7',
    fontFamily: 'UbuntuMedium',
    marginTop: 4,
    letterSpacing: 2,
    textShadowOffset: { width: 0, height: 2 },
    textShadowColor: '#000',
    textShadowRadius: 5,
  },

  jargonAccent: {
    color: '#2BA787',
  },

  formContainer: {
    position: 'absolute',
    width: '100%',
    alignItems: 'flex-start',
    paddingHorizontal: 50,
  },

  instructionText: {
    color: 'rgba(226, 228, 215, 0.89)',
    fontFamily: 'UbuntuLight',
    fontSize: 16,
    letterSpacing: 2,
    textShadowOffset: { width: 0, height: 2 },
    textShadowColor: '#000',
    textShadowRadius: 5,
    marginTop: 48,
  },

  formInput: {
    width: '100%',
    fontFamily: 'UbuntuLight',
    borderBottomWidth: 1,
    marginBottom: 8,
    fontSize: 18,
  }, 

  buttonLogin: {
    width: '100%',
    backgroundColor: '#2BA787',
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 32,
    borderRadius: 32,
  },

  buttonLoginText: {
    color: '#000609',
    fontFamily: 'UbuntuBold',
    fontSize: 24,
    letterSpacing: 1,
  },

})

  const LoginPage: React.FC = () => {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [modalVisible, setModalVisible] = useState(false)
    const [otpEmail, setOtpEmail] = useState('')
    const [errorMessage, setErrorMessage] = useState('')
    const [otpMessage, setOtpMessage] = useState('')
    const [otpMessageType, setOtpMessageType] = useState<'error' | 'info'>('info')
    const [otpLoading, setOtpLoading] = useState(false)

    const scale = useSharedValue(1)
    const opacity = useSharedValue(1)

    const animatedStyle = useAnimatedStyle(() => {
      return {
        transform: [{ scale: scale.value }],
        opacity: opacity.value,
      }
    })

    const handleLogin = async () => {
      if (email.trim() === '' || password.trim() === '') {
        setErrorMessage('Please fill in all fields')
        return
      }

      try {
        const response = await axios.post(`${API_URL}/login`, {
          email,
          password,
        })

        console.log("Login response GILAAAA:", response.data)

        const { access_token } = response.data

        if (access_token) {
          await AsyncStorage.setItem("authToken", access_token)
          console.log("Login Success: Token saved")

          navigation.reset({
            index: 0,
            routes: [{ name: "Home" }],
          })
        } else {
          console.log("LOGIN GAGAL NO TOKEN BROOOO")
          setErrorMessage('Something wrong')
        }
      } catch (error) {
        console.log("LOGIN ERROR BROO >>>>", error)
        setErrorMessage('Wrong email or password')
      }
    }

    const handleForgotPassword = async () => {
      if (otpEmail.trim() === '') {
        setOtpMessageType('error')
        setOtpMessage('Invalid email address')
        return
      }
      setOtpLoading(true)

      try {
        const response = await axios.post(`${API_URL}/forgot-password`, {
          email: otpEmail,
        })
        console.log("FORGOT PASSWORD SUCCESS >>>>", response.data)

        setOtpMessageType('info') 
        setOtpMessage('OTP sent! Check your email')
      } catch (error) {
        console.log("FORGOT PASSWORD ERROR ANJAY >>>>", error)

        setOtpMessageType('error')
        if (axios.isAxiosError(error) && error.response && error.response.data && error.response.data.message) {
          setOtpMessage('User Not Found')
        } else {
          setOtpMessage('Invalid Input')
        }
      } finally {
        setOtpLoading(false)
      }
    }


  return (
    <View style={styles.container}>

      <Video
        source={require('../assets/Video.mp4')}
        rate={1.0}
        isMuted={true}
        resizeMode={ResizeMode.COVER}
        shouldPlay
        isLooping
        style={styles.video}
      />
      <LinearGradient
        colors={['#000609', 'rgba(0, 0, 0, 0)']}
        start={{ x: 0.5, y: 1 }}
        end={{ x: 0.5, y: 0 }}
        style={styles.gradient}
      />
      <View style={styles.bottomBackground} />
      <Image
        source={require('../assets/image/LogoHorizontal.png')}
        style={styles.logo}
      />

      {/* JARGON */}
      {/* JARGON */}
      <View style={styles.containerForm}>
        <Text style={styles.jargonLine1}>The
          <Text style={styles.jargonAccent}> future</Text></Text>
        <Text style={styles.jargonLine2}>of financial
          <Text style={styles.jargonAccent}> clarity</Text></Text>
        <Text style={styles.instructionText}>
          Log in to your account
        </Text>


        {/* FORM */}
        {/* FORM */}
        <HelperText
          type="error"
          visible={errorMessage.length > 0}
          style={{ color: '#FF6B6B', fontSize: 14, fontFamily: 'UbuntuLight', marginTop: 8, paddingLeft: 0 }}
        >
          {errorMessage}
        </HelperText>
        <TextInput
          autoCapitalize="none" 
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          mode="flat"
          underlineColor="#E2E4D7"
          placeholderTextColor="rgba(226, 228, 215, 0.58)"
          activeUnderlineColor="#2BA787"
          textColor="#E2E4D7"
          style={[
            styles.formInput,
            { backgroundColor: 'transparent', fontFamily: 'UbuntuLightItalic', }
          ]}
          contentStyle={{ fontFamily: email.length > 0 ? 'UbuntuRegular' : 'UbuntuLightItalic', paddingLeft: 0 }}
        />
        
        {/* PASS FORM */}
        <TextInput
          autoCapitalize="none" 
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          mode="flat"
          underlineColor="#E2E4D7"
          activeUnderlineColor="#2BA787"
          placeholderTextColor="rgba(226, 228, 215, 0.58)"
          secureTextEntry={!showPassword}
          textColor="#E2E4D7"
          style={[
            styles.formInput,
            { backgroundColor: 'transparent' }
          ]}
          contentStyle={{ fontFamily: password.length > 0 ? 'UbuntuRegular' : 'UbuntuLightItalic', paddingLeft: 0 }}
          right={
            <TextInput.Icon
              icon={showPassword ? 'eye-off' : 'eye'}
              color="rgba(226, 228, 215, 0.58)"
              onPress={() => setShowPassword(!showPassword)}
            />
          }
        />


      {/* FORGOT PASSWORD */}
      {/* FORGOT PASSWORD */}
        <Text
          onPress={() => {
            setOtpEmail(email)
            setModalVisible(true)
          }}
          style={{
            color: '#2BA787',
            marginTop: 12,
            fontFamily: 'UbuntuRegular',
            fontSize: 14,
          }}
        >
          Forgot Password?
        </Text>


        {/* SIGN IN BUTTON */}
        {/* SIGN IN BUTTON */}
        <Pressable
          style={{ width: '100%', alignItems: 'center' }}
          onPressIn={() => {
            scale.value = withTiming(0.95, { duration: 100 })
            opacity.value = withTiming(0.8, { duration: 100 })
          }}
          onPressOut={() => {
            scale.value = withTiming(1, { duration: 100 })
            opacity.value = withTiming(1, { duration: 100 })
          }}
          onPress={() => {
            handleLogin() 
          }}
        >
          <Animated.View style={[styles.buttonLogin, animatedStyle]}>
            <Text style={styles.buttonLoginText}>
              SIGN IN
            </Text>
          </Animated.View>
        </Pressable>

      </View>


      {/* MODAL */}
      {/* MODAL */}
      {modalVisible && (
        <>
          {/* Blur layar penuh */}
          <BlurView
            intensity={30}
            tint="dark"
            experimentalBlurMethod="dimezisBlurView"
            style={{
              ...StyleSheet.absoluteFillObject,
              zIndex: 10,
            }}
          />

          <View style={{
            ...StyleSheet.absoluteFillObject,
            backgroundColor: 'rgba(1,20,20,0.3)',
            zIndex: 11,
          }} />
        </>
      )}
  

      {/* MODAL */}
      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={{
            backgroundColor: '#042622',
            padding: 24,
            marginHorizontal: 24,
            borderRadius: 12,
            zIndex: 20,
          }}
        >

          {/* MODAL FORM */}
          {/* MODAL FORM */}

          {/* TITLE */}
          <Text style={{
            color: '#E2E4D7',
            fontFamily: 'UbuntuMedium',
            fontSize: 18,
            marginBottom: 16,
            textAlign: 'center',
          }}>
            Send OTP
          </Text>

          {/* FORM EMAIL */}
          <TextInput
            autoCapitalize="none" 
            value={otpEmail}
            onChangeText={setOtpEmail}
            placeholder="Enter your email"
            mode="flat"
            underlineColor="#E2E4D7"
            activeUnderlineColor="#2BA787"
            placeholderTextColor="#E2E4D7"
            textColor="#E2E4D7"
            style={{
              backgroundColor: 'transparent',
         
            }}
            contentStyle={{
              fontFamily: 'UbuntuLight',
              fontSize: 16,
              color: '#E2E4D7',
              paddingLeft: 0,
            }}
          />
          
          {/* HELPER OTP */}
          <HelperText
            type={otpMessageType}
            visible={otpMessage.length > 0}
            style={{
              color: otpMessageType === 'error' ? '#FF6B6B' : '#2BA787',
              fontSize: 14,
              fontFamily: 'UbuntuLight',
              paddingLeft: 0,
              marginBottom: 16,
            }}
          >
            {otpMessage}
          </HelperText>

          {/* CANCEL BUTTON */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Button
              mode="outlined"
              textColor="#2BA787"
              onPress={() => setModalVisible(false)}
              style={{
                flex: 1,
                marginRight: 8,
                borderColor: '#2BA787',
              }}
              labelStyle={{
                fontFamily: 'UbuntuMedium',
                fontSize: 16,
              }}
            >
              Cancel
            </Button>

            {/* SEND OTP BUTTON */}
            <Button
              mode="contained"
              buttonColor="#2BA787"
              textColor="#000609"
              onPress={handleForgotPassword}
              style={{
                flex: 1,
                marginLeft: 8,
              }}
              labelStyle={{
                fontFamily: 'UbuntuMedium',
                fontSize: 16,
              }}
            >
            
              Send OTP
            </Button>
          </View>
        </Modal>
        </Portal>


    </View>
  )
}



export default LoginPage