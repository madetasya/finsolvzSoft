import i18n from '../src/i18n'
import React, { useEffect } from 'react'
import { useState } from 'react'
import { BlurView } from 'expo-blur'
import { View, Image, Text, StyleSheet, Pressable, KeyboardAvoidingView, Platform, Dimensions, TouchableOpacity, Alert } from 'react-native'
import { Video, ResizeMode } from 'expo-av'
import { LinearGradient } from 'expo-linear-gradient'
import { Button, HelperText, Modal, Portal, TextInput } from 'react-native-paper'
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated'
import axios from 'axios'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import { RootStackParamList } from '../types'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useTranslation } from 'react-i18next'
import { Keyboard } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Constants from 'expo-constants'
import * as FileSystem from 'expo-file-system'
import * as IntentLauncher from 'expo-intent-launcher'


const API_URL = process.env.EXPO_PUBLIC_API_URL;
const screenWidth = Dimensions.get('window').width

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000609',
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
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
    backgroundColor: '#000609',
    zIndex: -2,
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
    bottom: 64,
    width: '100%',
    paddingHorizontal: 24,
    zIndex: 10,
  },


  jargonLine1: {
    fontSize: screenWidth * 0.08 ,
    color: '#E2E4D7',
    fontFamily: 'UbuntuMedium',
    letterSpacing: 2,
    textShadowOffset: { width: 0, height: 2 },
    textShadowColor: '#000',
    textShadowRadius: 5,
  },

  jargonLine2: {
    fontSize: screenWidth * 0.08 ,
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
  const { t } = useTranslation()


  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [otpEmail, setOtpEmail] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [otpMessage, setOtpMessage] = useState('')
  const [otpMessageType, setOtpMessageType] = useState<'error' | 'info'>('info')
  const [otpLoading, setOtpLoading] = useState(false)
  const [language, setLanguage] = useState(i18n.language || 'en')
  const [keyboardOpen, setKeyboardOpen] = useState(false)
  const [showUpdateModal, setShowUpdateModal] = useState(false)
  const [apkUrl, setApkUrl] = useState('')

  useEffect(() => {
    const checkUpdate = async () => {
      try {
        const res = await axios.get(`${API_URL}/latest-version`)
        const serverVersion = (res.data.version || "").trim()

        const currentVersion = (
          Constants.expoConfig?.version ||
          Constants.manifest?.version ||
          "0.0.0"
        ).trim()

        console.log("VERSI APP >>>", JSON.stringify(currentVersion))
        console.log("VERSI SERVER >>>", JSON.stringify(serverVersion))
        console.log("IS VERSI SAMA?", currentVersion === serverVersion)

        if (serverVersion !== currentVersion && !showUpdateModal) {
          setApkUrl(res.data.apkUrl)
          setShowUpdateModal(true)
        }
      } catch (err) {
        console.log("CHECK UPDATE FAILED >>>", err)
      }
    }

    checkUpdate()
  }, [])
  
  const handleUpdate = async () => {
    try {
      const localPath = FileSystem.documentDirectory + 'update.apk'
      const { uri } = await FileSystem.downloadAsync(apkUrl, localPath)
      console.log('APK TERDOWNLOAD >>>>', uri)

      IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
        data: uri,
        flags: 1,
        type: 'application/vnd.android.package-archive'
      })
    } catch (err) {
      console.log('INSTALL GAGAL >>>', err)
      Alert.alert("ERROR", "Failed to install the update. Please try again later.")
    }
  }
  
  

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
      setErrorMessage(t('login.pleaseFillAllFields'))
      return
    }

    try {
      const response = await axios.post(`${API_URL}/login`, { email, password })
      const { access_token } = response.data

      if (access_token) {
        await AsyncStorage.setItem('authToken', access_token)
        const payload = JSON.parse(atob(access_token.split('.')[1]))
        const userRole = payload.role

        if (userRole === 'CLIENT') {
          navigation.reset({
            index: 0,
            routes: [{ name: 'ClientHomePage' }],
          })
        } else {
          navigation.reset({
            index: 0,
            routes: [{ name: 'HomePage' }],
          })
        }
      } else {
        setErrorMessage(t('login.wrongEmailOrPassword'))
      }
    } catch (error) {
      setErrorMessage(t('login.wrongEmailOrPassword'))
    }
  }

  const handleForgotPassword = async () => {
    if (otpEmail.trim() === '') {
      setOtpMessageType('error')
      setOtpMessage(t('login.invalidEmailAddress'))
      return
    }
    setOtpLoading(true)

    try {
      const response = await axios.post(`${API_URL}/forgot-password`, {
        email: otpEmail,
      })
      setOtpMessageType('info')
      setOtpMessage(t('login.newPasswordSent'))
    } catch (error) {
      setOtpMessageType('error')
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        setOtpMessage(t('login.userNotFound'))
      } else {
        setOtpMessage(t('login.invalidInput'))
      }
    } finally {
      setOtpLoading(false)
    }
  }
  React.useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardOpen(true)
    })
    const hideSub = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardOpen(false)
    })

    return () => {
      showSub.remove()
      hideSub.remove()
    }
  }, [])


  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: '#000609' }]}
      edges={['top', 'bottom']}
    >
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
        {showUpdateModal && (
          <View style={{
            position: "absolute",
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 99
          }}>
            <View style={{
              backgroundColor: "#fff",
              padding: 24,
              borderRadius: 12,
              width: "80%",
              alignItems: "center"
            }}>
              <Text style={{
                fontSize: 18,
                fontFamily: "UbuntuBold",
                marginBottom: 8,
                color: "#000"
              }}>
                {t("update_title")}
              </Text>
              <Text style={{
                fontSize: 14,
                fontFamily: "UbuntuRegular",
                textAlign: "center",
                marginBottom: 20,
                color: "#000"
              }}>
                {t("update_desc")}
              </Text>
              <TouchableOpacity
                onPress={handleUpdate}
                style={{
                  backgroundColor: "#15616D",
                  paddingVertical: 10,
                  paddingHorizontal: 24,
                  borderRadius: 8
                }}
              >
                <Text style={{
                  color: "#fff",
                  fontFamily: "UbuntuBold"
                }}>{t("update_now")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

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
        {!keyboardOpen && (
          <>
            <View style={{ position: 'absolute', top: 48, right: 24, zIndex: 20, flexDirection: 'row' }}>
              <Text
                onPress={async () => {
                  i18n.changeLanguage('zh')
                  setLanguage('zh')
                  await AsyncStorage.setItem('selectedLanguage', 'zh')
                }}
                style={{
                  color: language === 'zh' ? '#2BA787' : '#E2E4D7',
                  fontFamily: 'UbuntuBold',
                  fontSize: 14,
                  marginRight: 8,
                }}
              >
                {t('login.language.zh')}
              </Text>
              <Text style={{ color: '#E2E4D7', fontSize: 14, marginHorizontal: 4 }}>|</Text>
              <Text
                onPress={async () => {
                  i18n.changeLanguage('en')
                  setLanguage('en')
                  await AsyncStorage.setItem('selectedLanguage', 'en')
                }}
                style={{
                  color: language === 'en' ? '#2BA787' : '#E2E4D7',
                  fontFamily: 'UbuntuBold',
                  fontSize: 14,
                  marginLeft: 8,
                }}
              >
                {t('login.language.en')}
              </Text>
            </View>

            <Image
              source={require('../assets/image/LogoHorizontal.png')}
              style={styles.logo}
            />
          </>
        )}

      <View style={styles.containerForm}>
          {!keyboardOpen && (
            <>
              <Text style={styles.jargonLine1}>
                {t('login.jargon1.part1')}
                <Text style={styles.jargonAccent}> {t('login.jargon1.accent')}</Text>
              </Text>
              <Text style={styles.jargonLine2}>
                {t('login.jargon2.part1')}
                <Text style={styles.jargonAccent}> {t('login.jargon2.accent')}</Text>
              </Text>
            </>
          )}


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
          placeholder={t('login.emailPlaceholder')}
          mode="flat"
          underlineColor="#E2E4D7"
          placeholderTextColor="rgba(226, 228, 215, 0.58)"
          activeUnderlineColor="#2BA787"
          textColor="#E2E4D7"
          style={[
            styles.formInput,
            { backgroundColor: 'transparent', fontFamily: 'UbuntuLightItalic' }
          ]}
          contentStyle={{ fontFamily: email.length > 0 ? 'UbuntuRegular' : 'UbuntuLightItalic', paddingLeft: 0 }}
        />

        <TextInput
          autoCapitalize="none"
          value={password}
          onChangeText={setPassword}
          placeholder={t('login.passwordPlaceholder')}
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
          {t('login.forgotPassword')}
        </Text>

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
          onPress={handleLogin}
        >
          <Animated.View style={[styles.buttonLogin, animatedStyle]}>
            <Text style={styles.buttonLoginText}>
              {t('login.signIn')}
            </Text>
          </Animated.View>
        </Pressable>
      </View>

      {modalVisible && (
        <>
        {/* @ts-ignore */}
          <BlurView
            intensity={30}
              experimentalBlurMethod= "dimezisBlurView"
            tint="dark"
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
          <Text style={{
            color: '#E2E4D7',
            fontFamily: 'UbuntuMedium',
            fontSize: 18,
            marginBottom: 16,
            textAlign: 'center',
          }}>
            {t('login.sendNewPasswordTitle')}
          </Text>

          <TextInput
            autoCapitalize="none"
            value={otpEmail}
            onChangeText={setOtpEmail}
            placeholder={t('login.enterYourEmail')}
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
              {t('login.cancel')}
            </Button>

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
              {t('login.send')}
            </Button>
          </View>
        </Modal>
      </Portal>
      </KeyboardAvoidingView>
    </SafeAreaView>


  )

  
}

export default LoginPage
