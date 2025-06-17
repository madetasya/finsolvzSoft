import React, { useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Animated, FlatList, ImageBackground, Image } from "react-native";

const screenWidth = Dimensions.get('window').width;
const cardWidth = (screenWidth - 64) / 3; 

interface UserItem {
    _id: string;
    name: string;
    role?: string;
}

interface UserListProps {
    navigation: any;
    users: UserItem[];
    onPressUser: (user: UserItem) => void;
    onAddUser: () => void;
    onDeleteUser: (userId: string) => Promise<void>;
    // onSeeMore: () => void;
    userRole: string | null;
}

const getRoleLabel = (role?: string) => {
    if (!role) return '';
    const lower = role.toLowerCase();
    if (lower === 'super_admin') return 'SA';
    if (lower === 'client') return 'C';
    if (lower === 'admin') return 'A';
    return role.charAt(0).toUpperCase();
};

const UserList: React.FC<UserListProps> = ({ users, onPressUser, onAddUser,  userRole }) => {
    const scrollX = useRef(new Animated.Value(0)).current;

    const renderItem = ({ item }: { item: UserItem }) => {
        const names = item.name.split(' ');
        return (
            <TouchableOpacity
                style={styles.cardWrapper}
                onPress={() => onPressUser(item)}
                activeOpacity={0.8}
            >
                <ImageBackground source={require('../assets/image/UserCard.png')} style={styles.cardBackground}>
                    <View style={styles.roleLabelWrapper}>
                        <Text style={styles.roleLabel}>{getRoleLabel(item.role)}</Text>
                    </View>
                    <View style={styles.nameWrapper}>
                        <Text style={styles.userName} numberOfLines={1} ellipsizeMode="tail">{names[0]}</Text>
                        <Text style={styles.userName} numberOfLines={1} ellipsizeMode="tail">{names[1] || ''}</Text>
                    </View>
                </ImageBackground>
            </TouchableOpacity>
        );
    };

    return (
        <ImageBackground source={require('../assets/image/UserCardBG.png')} style={styles.container}>
            <View style={styles.headerRow}>
                <Text style={styles.sectionTitle}>User List</Text>
            </View>

            <FlatList
                data={users}
                keyExtractor={(item) => item._id}
                horizontal
                showsHorizontalScrollIndicator={false}
                snapToInterval={cardWidth + 16}
                decelerationRate="fast"
                contentContainerStyle={styles.cardRow}
                renderItem={renderItem}
                bounces={false}
            />
            <View style={styles.bottomRow}>
                {userRole === "SUPER_ADMIN" && (
                    <TouchableOpacity style={styles.addButton} onPress={onAddUser}>
                        <Text style={styles.addButtonText}>+ Add User</Text>
                    </TouchableOpacity>
                )}

                {/* <TouchableOpacity style={styles.seeMoreButton} onPress={onSeeMore}>
                    <Text style={styles.seeMoreButtonText}>See More {">>"}</Text>
                </TouchableOpacity> */}
            </View>

        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        marginTop: 48,
        paddingBottom: 40,
        alignItems: 'center',
    },
    headerRow: {
        width: '90%',
        marginBottom: 10,
    },
    sectionTitle: {
        color: '#E2E4D7',
        fontSize: 36,
        fontFamily: 'UbuntuMedium',
        marginBottom: 20,
    },
    cardRow: {
        paddingHorizontal: 16,
    },
    cardWrapper: {
        width: cardWidth,
        height: cardWidth * 1.3,
        borderRadius: 12,
        marginRight: 16,
        overflow: 'hidden',
    },
    cardBackground: {
        flex: 1,
        resizeMode: 'cover',
        justifyContent: 'flex-end',
        paddingBottom: 12,
        paddingHorizontal: 8,
    },
    roleLabelWrapper: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: 'transparent',
        marginRight:16,
        borderRadius: 8,
        paddingHorizontal: 3,
        paddingVertical: 0,

    },
    roleLabel: {
        fontSize: 16,
        color: '#0D241F',
        fontFamily: 'UbuntuMedium'
        
    },
    nameWrapper: {
        alignItems: 'flex-start',
        marginBottom:16,
        paddingBottom:8,
        width: '100%',

    },
    userName: {
        fontSize: 20,
        color: '#0D241F',
        fontFamily: 'UbuntuBold',
        elevation: 5,
        shadowColor: "#0A2C29"
    },
    bottomRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end', 
        alignItems: 'center',
        width: '90%',
        marginTop: 8,
        gap: 12,
    },
    addButton: {
        backgroundColor: '#E2E4D7',
        borderRadius: 20,
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    addButtonText: {
        color: '#0D241F',
        fontFamily: 'UbuntuBold',
        fontSize: 14,
    },
    seeMoreButton: {
        backgroundColor: '#112725',
        borderWidth: 1,
        borderColor: '#E2E4D7',
        borderRadius: 20,
        paddingVertical: 8,
        paddingHorizontal: 20,
    },
    seeMoreButtonText: {
        color: '#E2E4D7',
        fontFamily: 'UbuntuBold',
        fontSize: 14,
    },

});

export default UserList;