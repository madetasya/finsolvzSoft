import React, { useState } from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions, Modal } from "react-native";
import { Icon } from 'react-native-paper';
import AsyncStorage from "@react-native-async-storage/async-storage";

const screenWidth = Dimensions.get('window').width;

interface HomeHeaderProps {
    navigation: any;
    userName: string | null;
    formatUserName: (name: string) => string;
}

const HomeHeader: React.FC<HomeHeaderProps> = ({ navigation, userName, formatUserName }) => {
    const [modalVisible, setModalVisible] = useState(false);

    const handleLogout = async () => {
        try {
            await AsyncStorage.removeItem("authToken");
            navigation.replace("Login");
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

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
                    <Text style={styles.searchPlaceholder}>Search</Text>
                </View>
            </TouchableOpacity>

            {/* HEADER */}
            <View style={styles.headerContainer}>
                <View style={styles.userRow}>
                    <View style={styles.nameContainer}>
                        <Text style={styles.welcomeText}>Welcome,</Text>
                        <Text style={styles.userName}>{userName ? formatUserName(userName) : "User"}</Text>

                        <TouchableOpacity
                            style={{ alignItems: 'center', justifyContent: 'center', marginLeft: "72%", marginTop: "-9%" }}
                            onPress={() => setModalVisible(true)}
                        >
                            <Image source={require("../assets/image/Play.png")} style={styles.playButton} />
                        </TouchableOpacity>

                        <Modal
                            visible={modalVisible}
                            transparent
                            animationType="fade"
                            onRequestClose={() => setModalVisible(false)}
                        >
                            <View style={styles.modalOverlay}>
                                <View style={styles.modalContainer}>
                                    <TouchableOpacity style={styles.modalButton} onPress={() => console.log('Change Password')}>
                                        <Text style={styles.modalButtonText}>Change Password</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                                        <Text style={styles.logoutButtonText}>Sign Out</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
                                        <Text style={styles.closeButtonText}>Close</Text>
                                    </TouchableOpacity>
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
        paddingTop: '60%',
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
        width: "100%",
        marginTop: 10,
        bottom: 10,
    },
    closeButtonText: {
        color: '#A0A0A0',
        fontFamily: 'UbuntuLightItalic',
    },
});

export default HomeHeader;
