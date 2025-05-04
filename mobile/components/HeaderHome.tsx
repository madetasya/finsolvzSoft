import React, { useEffect, useState } from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions, Modal, Alert } from "react-native";
import { Icon, TextInput } from 'react-native-paper';
import AsyncStorage from "@react-native-async-storage/async-storage";
import i18n from '../src/i18n'
const screenWidth = Dimensions.get('window').width;
import { useTranslation } from 'react-i18next'
4
interface HomeHeaderProps {
    navigation: any;
    userName: string | null;
    formatUserName: (name: string) => string;
    showLanguageToggle: boolean; 
}


const HomeHeader: React.FC<HomeHeaderProps> = ({
    navigation,
    userName,
    formatUserName,
    showLanguageToggle, 
}) => {

    const [modalVisible, setModalVisible] = useState(false);
    const [changePasswordVisible, setChangePasswordVisible] = useState(false)
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [passwordError, setPasswordError] = useState('')
    const [successMessage, setSuccessMessage] = useState('')
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [language, setLanguage] = useState(i18n.language || 'en') 

    const { t } = useTranslation()
    const handleChangePassword = async () => {
        setPasswordError('')
        setSuccessMessage('')

        if (!newPassword || !confirmPassword) {
            setPasswordError('Please fill all fields')
            return
        }

        if (newPassword !== confirmPassword) {
            setPasswordError('Passwords do not match')
            return
        }

        try {
            const token = await AsyncStorage.getItem('authToken')
            if (!token) throw new Error('No token')

            const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/change-password`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    newPassword,
                    confirmPassword
                })
            })


            if (response.ok) {
                setSuccessMessage('Password changed successfully!')
                setNewPassword('')
                setConfirmPassword('')
                setTimeout(() => {
                    setChangePasswordVisible(false)
                    setSuccessMessage('')
                }, 2000)
            }
            else {
                setPasswordError('Failed to change password')
            }
        } catch (err) {
            setPasswordError('Something went wrong')
        }
    }


    const handleLogout = async () => {
        try {
            await AsyncStorage.removeItem("authToken");
            navigation.replace("Login");
        } catch (error) {
            Alert.alert("Error", "Cannot log out. Please try again later.");
        }
    };



    useEffect(() => {
        const loadLanguage = async () => {
            const storedLang = await AsyncStorage.getItem("selectedLanguage")
            if (storedLang && storedLang !== i18n.language) {
                await i18n.changeLanguage(storedLang)
                setLanguage(storedLang)
            }
        }
        loadLanguage()
    }, [])

    return (
        <View style={{ width: '100%' }}>
     
            {/* SEARCHBAR */}
            <TouchableOpacity
                style={styles.searchBar}
                activeOpacity={0.8}
                onPress={() => navigation.navigate('SearchPage')}
            >
                <View style={styles.searchContent}>
                    <Icon source="magnify" color="#E2E4D7" size={24} />
                    <Text style={styles.searchPlaceholder}>{t('searchPlaceholder')}</Text>
                </View>
            </TouchableOpacity>

          



            {/* HEADER */}
            <View style={styles.headerContainer}>
                <View style={styles.userRow}>
                    <View style={styles.nameContainer}>
                        <Text style={styles.welcomeText}>{t('welcome') }</Text>
                        <Text style={styles.userName}>{userName ? formatUserName(userName) : "User"}</Text>

                        <TouchableOpacity
                            style={{ alignItems: 'center', justifyContent: 'center', marginLeft: "72%", marginTop: "-6%" }}
                            onPress={() => setModalVisible(true)}
                        >
                            <Image source={require("../assets/image/Play.png")} style={styles.playButton} />
                        </TouchableOpacity>
                        {showLanguageToggle && (
                            <View style={{ flexDirection: 'row', alignSelf: 'flex-end', marginTop: 48, marginRight: 24 }}>
                                <Text
                                    onPress={async () => {
                                        await i18n.changeLanguage('zh')
                                        await AsyncStorage.setItem('selectedLanguage', 'zh')
                                        setLanguage('zh')
                                    }}
                                    style={{
                                        color: language === 'zh' ? '#2BA787' : '#E2E4D7',
                                        fontFamily: 'UbuntuBold',
                                        fontSize: 14,
                                        marginRight: 8,
                                    }}
                                >
                                    中文
                                </Text>
                                <Text style={{ color: '#E2E4D7', fontSize: 14, marginHorizontal: 4 }}>|</Text>
                                <Text
                                    onPress={async () => {
                                        await i18n.changeLanguage('en')
                                        await AsyncStorage.setItem('selectedLanguage', 'en')
                                        setLanguage('en')
                                    }}
                                    style={{
                                        color: language === 'en' ? '#2BA787' : '#E2E4D7',
                                        fontFamily: 'UbuntuBold',
                                        fontSize: 14,
                                        marginLeft: 8,
                                    }}
                                >
                                    ENG
                                </Text>
                            </View>
                        )}

                        <Modal
                            visible={modalVisible}
                            transparent
                            animationType="fade"
                            onRequestClose={() => setModalVisible(false)}
                        >
                            <View style={styles.modalOverlay}>
                                
                                <View style={styles.modalContainer}>
                                    <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
                                        <Text style={styles.closeButtonText}>{t('close')}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.modalButton} onPress={() => {
                                        setModalVisible(false)
                                        setChangePasswordVisible(true)
                                    }}>
                                        <Text style={styles.modalButtonText}>{t('changePassword')}</Text>
                                    </TouchableOpacity>


                                    <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                                        <Text style={styles.logoutButtonText}>{t('signOut')}</Text>
                                    </TouchableOpacity>

                                  
                                </View>
                            </View>
                        </Modal>
                        <Modal
                            visible={changePasswordVisible}
                            transparent
                            animationType="fade"
                            onRequestClose={() => setChangePasswordVisible(false)}
                        >
                            <View style={styles.modalOverlay}>
                                <View style={styles.modalContainer}>
                                    <Text style={{ fontSize: 18, fontFamily: 'UbuntuMedium', marginBottom: 16, color: 'white' }}>
                                        {t('changePassword')}
                                    </Text>

                                    <TextInput

                                        value={newPassword}
                                        onChangeText={setNewPassword}
                                        secureTextEntry={!showNewPassword}
                                        right={
                                            <TextInput.Icon
                                                icon={showNewPassword ? 'eye-off' : 'eye'}
                                                onPress={() => setShowNewPassword(!showNewPassword)}
                                            />
                                        }
                                        placeholder={t('newPassword')}
                                        autoCapitalize="none"
                                        underlineColor="#E2E4D7"
                                        activeUnderlineColor="#2BA787"
                                        placeholderTextColor="#E2E4D7"
                                        style={{ width: '100%', marginBottom: 12, backgroundColor: 'transparent' }}
                                        contentStyle={{
                                            fontFamily: 'UbuntuRegular',
                                            fontSize: 16,
                                            color: '#E2E4D7',
                                            paddingLeft: 0,
                                        }}
                                    />
                                    <TextInput
                                        autoCapitalize="none"
                                        value={confirmPassword}
                                        onChangeText={setConfirmPassword}
                                        secureTextEntry={!showConfirmPassword}
                                        right={
                                            <TextInput.Icon
                                                icon={showConfirmPassword ? 'eye-off' : 'eye'}
                                                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                            />
                                        }
                                        placeholder={t('confirmPassword')}
                                        activeUnderlineColor="#2BA787"
                                        placeholderTextColor="#E2E4D7"
                                        underlineColor="#E2E4D7"
                                        style={{ width: '100%', marginBottom: 12, backgroundColor: 'transparent' }}
                                        contentStyle={{
                                            fontFamily: 'UbuntuRegular',
                                            fontSize: 16,
                                            color: '#E2E4D7',
                                            paddingLeft: 0,
                                        }}
                                    />

                                    {passwordError !== '' && (
                                        <Text style={{ color: '#FF6B6B', fontSize: 14 }}>{passwordError}</Text>
                                    )}
                                    {successMessage !== '' && (
                                        <Text style={{ color: '#2BA787', fontSize: 14 }}>{successMessage}</Text>
                                    )}

                                    <View style={{ marginTop: 16, width: '100%' }}>
                                        <TouchableOpacity
                                            style={styles.modalButton}
                                            onPress={handleChangePassword}
                                        >
                                            <Text style={styles.modalButtonText}>{t('submit')}</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={[styles.logoutButton,]}
                                            onPress={() => setChangePasswordVisible(false)}
                                        >
                                            <Text style={styles.logoutButtonText}>{t('cancel')}</Text>
                                        </TouchableOpacity>
                                    </View>

                                </View>
                            </View>
                        </Modal>

                    </View>
                </View>
                <Image source={require("../assets/image/Subtract.png")} style={styles.nameMenuBG} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#314E4A",
    },
    headerContainer: {
        width: '100%',
        top: '-2%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    nameContainer: {
        flexDirection: 'column',
    },
    userRow: {
        position: 'absolute',
        paddingTop: '64%',
        left: '8%',
        flexDirection: 'row',
        alignItems: 'center',
        zIndex: 5,
    },
    welcomeText: {
        fontSize: 16,
        color: '#A0A0A0',
        fontFamily: 'UbuntuLight',
        marginBottom: 2,
    },
    userName: {
        fontSize: 24,
        color: '#E2E4D7',
        fontFamily: 'UbuntuBold',
        marginRight: 12,
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.17,
        shadowRadius: 3.05,
        elevation: 4,
    },
    playButton: {
        width: 16,
        height: 16,
        marginTop: "-1%",
        marginLeft: "58%",
        resizeMode: 'contain',
    },
    nameMenuBG: {
        position: "absolute",
        top: '9%',
        width: screenWidth * 1.5,
        height: screenWidth * 0.7,
        aspectRatio: 1.8,
        opacity: 1,
        zIndex: 1,
    },
    searchBar: {
        position: 'absolute',
        marginTop: '52%',
        left: '2%',
        width: '96%',
        height: 50,
        backgroundColor: '#011414',
        borderWidth: 1,
        borderColor: '#1B3935',
        borderRadius: 32,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        zIndex: 5,
    },
    searchContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    searchPlaceholder: {
        color: '#E2E4D7',
        fontFamily: 'UbuntuLightItalic',
        fontSize: 16,
        marginLeft: 12,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        backgroundColor: '#314E4A',
        padding: 32,
        borderRadius: 10,
        width: '80%',
        alignItems: 'center',
        position: 'relative',
    },
    modalButton: {
        backgroundColor: '#E2E4D7',
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderRadius: 8,
        marginVertical: 10,
        width: '100%',
        alignItems: 'center',
    },
    modalButtonText: {
        color: '#0D241F',
        fontFamily: 'UbuntuBold',
        fontSize: 16,
    },
    logoutButton: {
        backgroundColor: '#E53935',
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderRadius: 8,
        marginVertical: 10,
        width: '100%',
        alignItems: 'center',
        paddingBottom: 5,
    },
    logoutButtonText: {
        color: 'white',
        fontFamily: 'UbuntuBold',
        fontSize: 16,
        marginBottom: 8,
    },
    closeButton: {
        position: 'absolute',
        top: 12,
        right: 16,
    },
    closeButtonText: {
        color: '#A0A0A0',
        fontFamily: 'UbuntuLightItalic',
    },
});

export default HomeHeader;
