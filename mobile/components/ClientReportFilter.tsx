import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

interface CompanyItem {
    _id: string;
    name: string;
}

interface ClientReportFilterProps {
    onFilterChange: (companyId: string | null, reportType: string | null) => void;
    navigation: any;
}


const reportTypes = ["Balance Sheet", "Profit and Loss", "Revenue"];

const ClientReportFilter: React.FC<ClientReportFilterProps> = ({ onFilterChange }) => {
    const [companies, setCompanies] = useState<CompanyItem[]>([]);
    const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
    const [selectedReportType, setSelectedReportType] = useState<string | null>(null);
    const [companyModalVisible, setCompanyModalVisible] = useState(false);
    const [reportTypeModalVisible, setReportTypeModalVisible] = useState(false);

    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                const token = await AsyncStorage.getItem("authToken");
                if (!token) return;
                const res = await axios.get(`${API_URL}/user/companies`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setCompanies(res.data);
            } catch (error) {
                console.error("Error fetching companies >>>", error);
            }
        };

        fetchCompanies();
    }, []);

    const handleCompanySelect = (companyId: string) => {
        setSelectedCompany(companyId);
        onFilterChange(companyId, selectedReportType);
        setCompanyModalVisible(false);
    };

    const handleReportTypeSelect = (type: string) => {
        setSelectedReportType(type);
        onFilterChange(selectedCompany, type);
        setReportTypeModalVisible(false);
    };

    
    return (
        <View style={styles.container}>
            <Text style={styles.label}>Select Company</Text>
            <TouchableOpacity style={styles.dropdown} onPress={() => setCompanyModalVisible(true)}>
                <Text style={styles.dropdownText}>
                    {companies.find((c) => c._id === selectedCompany)?.name || "Choose Company"}
                </Text>
            </TouchableOpacity>

            <Text style={[styles.label, { marginTop: 16 }]}>Select Report Type</Text>
            <TouchableOpacity style={styles.dropdown} onPress={() => setReportTypeModalVisible(true)}>
                <Text style={styles.dropdownText}>{selectedReportType || "Choose Report Type"}</Text>
            </TouchableOpacity>

            {/* Company Modal */}
            <Modal transparent visible={companyModalVisible} animationType="fade">
                <TouchableOpacity style={styles.overlay} onPress={() => setCompanyModalVisible(false)}>
                    <View style={styles.modalContent}>
                        <FlatList
                            data={companies}
                            keyExtractor={(item) => item._id}
                            renderItem={({ item }) => (
                                <TouchableOpacity style={styles.modalItem} onPress={() => handleCompanySelect(item._id)}>
                                    <Text style={styles.modalItemText}>{item.name}</Text>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* Report Type Modal */}
            <Modal transparent visible={reportTypeModalVisible} animationType="fade">
                <TouchableOpacity style={styles.overlay} onPress={() => setReportTypeModalVisible(false)}>
                    <View style={styles.modalContent}>
                        {reportTypes.map((type) => (
                            <TouchableOpacity key={type} style={styles.modalItem} onPress={() => handleReportTypeSelect(type)}>
                                <Text style={styles.modalItemText}>{type}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: "100%",
        padding: 16,
    },
    label: {
        fontSize: 16,
        color: "#fff",
        marginBottom: 8,
    },
    dropdown: {
        backgroundColor: "#f9f9f9",
        padding: 12,
        borderRadius: 10,
        marginBottom: 8,
    },
    dropdownText: {
        color: "#000",
    },
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContent: {
        backgroundColor: "#fff",
        borderRadius: 10,
        paddingVertical: 10,
        width: 250,
    },
    modalItem: {
        paddingVertical: 12,
        paddingHorizontal: 20,
    },
    modalItemText: {
        color: "#000",
    },
});

export default ClientReportFilter;