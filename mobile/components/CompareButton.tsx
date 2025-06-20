import React, { useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    FlatList,
    StyleSheet,
} from "react-native";
import { useTranslation } from "react-i18next";

interface CompareButtonProps {
    availableReports: { id: string; title: string; date: string }[];
    onCompareSelect: (selectedReport: { id: string; title: string; date: string }) => void;
}

const CompareButton: React.FC<CompareButtonProps> = ({ availableReports, onCompareSelect }) => {
    const [modalVisible, setModalVisible] = useState(false);
    const { t } = useTranslation();
    return (
        <View>
            {/* +Compare Button */}
            <TouchableOpacity style={styles.button} onPress={() => setModalVisible(true)}>
                <Text style={styles.buttonText}>{t('compare')}</Text>
            </TouchableOpacity>

            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>{t('selectReportToCompare')}</Text>

                        <FlatList
                            data={availableReports}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.reportItem}
                                    onPress={() => {
                                        onCompareSelect(item);
                                        setModalVisible(false);
                                    }}
                                >
                                    <Text style={styles.reportTitle}>{item.title}</Text>
                                    <Text style={styles.reportDate}>{item.date}</Text>
                                </TouchableOpacity>
                            )}
                        />

                        <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
                            <Text style={styles.closeButtonText}>{t('close')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    button: {
        backgroundColor: "#15616D",
        padding: 12,
        borderRadius: 5,
        alignItems: "center",
        marginVertical: 10,
        width: "80%",
        marginLeft: 32,
    },
    buttonText: {
        color: "white",
        fontFamily: "UbuntuBold",
    },
    modalContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalContent: {
        backgroundColor: "white",
        padding: 20,
        borderRadius: 10,
        width: "80%",
        alignItems: "center",
    },
    modalTitle: {
        fontSize: 18,
        fontFamily: "UbuntuMedium",
        marginBottom: 10,
    },
    reportItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#ddd",
        width: "100%",
    },
    reportTitle: {
        fontSize: 16,
        fontFamily: "UbuntuBold",
    },
    reportDate: {
        fontSize: 14,
        color: "gray",
        fontFamily: "UbuntuLight",
    },
    closeButton: {
        marginTop: 10,
        backgroundColor: "#f44336",
        padding: 10,
        borderRadius: 5,
    },
    closeButtonText: {
        color: "white",
        fontFamily: "UbuntuBold",
    },
});

export default CompareButton;
