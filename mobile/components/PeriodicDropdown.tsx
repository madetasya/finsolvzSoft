import React, { useState } from "react";
import { View, Text, TouchableOpacity, Modal, FlatList, StyleSheet } from "react-native";

interface CustomDropdownProps {
    label: string;
    data: string[];
    selectedValue: string;
    onSelect: (value: string) => void;
    isSecondDropdown?: boolean;
}

const PeriodicDropdown: React.FC<CustomDropdownProps> = ({ label, data, selectedValue, onSelect, isSecondDropdown }) => {
    const [visible, setVisible] = useState(false);

    return (
        <View style={[styles.dropdownContainer, isSecondDropdown && styles.secondDropdownContainer]}>
            <TouchableOpacity
                style={[styles.dropdown, isSecondDropdown && styles.secondDropdown]}
                onPress={() => setVisible(true)}
            >
                <Text style={styles.dropdownText}>{selectedValue || label}</Text>
            </TouchableOpacity>

            <Modal transparent visible={visible} animationType="fade">
                <TouchableOpacity style={styles.overlay} onPress={() => setVisible(false)}>
                    <View style={[styles.modalContainer, isSecondDropdown && styles.secondModalContainer]}>
                        <FlatList
                            data={data}
                            keyExtractor={(item) => item}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.option}
                                    onPress={() => {
                                        onSelect(item);
                                        setVisible(false);
                                    }}
                                >
                                    <Text style={styles.optionText}>{item}</Text>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    dropdownContainer: {
        width: 164,
    },
    //terlihat tidak berguna tapi kalo diganti malah nyebelin. biarkan dia di sini dulu UwU
    secondDropdownContainer: {
        marginLeft: -100,
    },

    dropdown: {
        backgroundColor: "#F6F4F0",
        padding: 12,
        borderRadius: 8,
        elevation: 3,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 3,
        width: 208,
    },
    secondDropdown: {
        width: 136, 
        paddingLeft: 10,
    },
    dropdownText: {
        fontSize: 14,
        color: "#333",
        textAlign: "left",
        fontFamily: "UbuntuRegular",
    },
    overlay: {
        flex: 3,
        backgroundColor: "rgba(0,0,0,0.4)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContainer: {
        backgroundColor: "#fff",
        width: 168 ,
        borderRadius: 10,
        paddingVertical: 10,
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowRadius: 4,
        alignSelf: "center",
        elevation: 5,
        transform: [{ translateY: -50 }],
    },
    secondModalContainer: {
        width: 104, 
    },
    option: {
        padding: 8,
        alignItems: "center",
    },
    optionText: {
        fontSize: 14,
        color: "#333",
        fontFamily: "UbuntuRegular",
    },
});

export default PeriodicDropdown;
