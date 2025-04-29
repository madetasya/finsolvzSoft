import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Dimensions, Alert, Modal } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import * as XLSX from "xlsx";
import axios from "axios";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { Asset } from "expo-asset";
import { FlatList } from "react-native-gesture-handler";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = process.env.EXPO_PUBLIC_API_URL;
const CELL_WIDTH = 100;
const CELL_HEIGHT = 40;
const defaultHeaders = ["Category", "Subcategory1", "Subcategory2", "Subcategory3"];

const CreateReportPage = () => {
    const [form, setForm] = useState({
        name: "",
        currency: "",
        year: "",
        reportType: "",
        company: "",
        userAccess: [] as string[]
    });

    const [jsonHeader, setJsonHeader] = useState(defaultHeaders);
    const [jsonData, setJsonData] = useState<string[][]>([["", "", "", ""]]);
    const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
    const [editingCell, setEditingCell] = useState<{ row: number; col: number } | null>(null);
    const [editingHeaderIndex, setEditingHeaderIndex] = useState<number | null>(null);
    const [isModalVisible, setModalVisible] = useState(false);
    const [companies, setCompanies] = useState<{ _id: string; name: string }[]>([]);
    const [users, setUsers] = useState<{ _id: string; name: string }[]>([]);
    const [isCompanyModalVisible, setCompanyModalVisible] = useState(false);
    const [isUserModalVisible, setUserModalVisible] = useState(false);
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [reportTypes, setReportTypes] = useState<{ _id: string; name: string }[]>([]);
    const [isReportTypeModalVisible, setReportTypeModalVisible] = useState(false);



    const fallbackSelected = { row: jsonData.length - 1, col: jsonHeader.length - 1 };

    const handlePickExcel = async (): Promise<void> => {
        const result = await DocumentPicker.getDocumentAsync({
            type: ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "application/vnd.ms-excel"],
            copyToCacheDirectory: true,
            multiple: false,
        });

        if (!result.assets || result.assets.length === 0) return;

        const file = result.assets[0];
        const response = await fetch(file.uri);
        const blob = await response.blob();
        const reader = new FileReader();
        reader.onload = (e) => {
            const data = e.target?.result;
            const workbook = XLSX.read(data, { type: "binary" });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const json = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
            const [headerRow, ...bodyRows] = json;
            setJsonHeader((headerRow as unknown[]).map((cell) => String(cell ?? "")));
            setJsonData((bodyRows as unknown[][]).map((row) => row.map((cell) => String(cell ?? ""))));
        };
        reader.readAsArrayBuffer(blob);
    };

    const fetchReportTypes = async () => {
        try {
            const token = await AsyncStorage.getItem("authToken");
            if (!token) {
                console.error("No auth token found");
                return;
            }
            const res = await axios.get(`${API_URL}/reportTypes`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setReportTypes(res.data);

        } catch (err) {
            console.error("Error fetching report types", err);
        }
    };


    const updateForm = (field: keyof typeof form, value: string): void => {
        setForm({ ...form, [field]: value });
    };
    const handleDownloadTemplate = async (templateName: "templateFullYear" | "templateYearOnly") => {
        try {
            const templateAsset = templateName === "templateFullYear"
                ? require("../assets/templateFullYear.xlsx")
                : require("../assets/templateYearOnly.xlsx");

            const templateUri = FileSystem.cacheDirectory + `${templateName}.xlsx`;

            await FileSystem.downloadAsync(
                Asset.fromModule(templateAsset).uri,
                templateUri
            );

            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(templateUri);
            } else {
                Alert.alert("Error", "This feature not available for your device");
            }
        } catch (error) {
            console.error("Error downloading template:", error);
            Alert.alert("Error", "Failed to download the template.");
        }
    };

    const addRow = (pos: "above" | "below"): void => {
        const { row } = selectedCell ?? fallbackSelected;
        const newRow: string[] = Array(jsonHeader.length).fill("");
        const updated = [...jsonData];
        const idx = pos === "above" ? row : row + 1;
        updated.splice(idx, 0, newRow);
        setJsonData(updated);
    };

    const addColumn = (pos: "left" | "right"): void => {
        const { col } = selectedCell ?? fallbackSelected;
        const updatedHeader = [...jsonHeader];
        const idx = pos === "left" ? col : col + 1;
        updatedHeader.splice(idx, 0, "");
        const updatedData: string[][] = jsonData.map((row) => {
            const newRow = [...row];
            newRow.splice(idx, 0, "");
            return newRow;
        });
        setJsonHeader(updatedHeader);
        setJsonData(updatedData);
    };

    const deleteRow = () => {
        if (!selectedCell) return;
        if (jsonData.length <= 1) return Alert.alert("You can't delete all rows!");
        const updated = [...jsonData];
        updated.splice((selectedCell as { row: number }).row, 1);
        setJsonData(updated);
        setSelectedCell(null);
    };

    const deleteColumn = () => {
        if (!selectedCell) return;
        if (jsonHeader.length <= 1) return Alert.alert("You can't delete all columns!");
        const updatedHeader = [...jsonHeader];
        updatedHeader.splice((selectedCell as { col: number }).col, 1);
        const updatedData = jsonData.map((row) => {
            const newRow = [...row];
            newRow.splice((selectedCell as { col: number }).col, 1);
            return newRow;
        });
        setJsonHeader(updatedHeader);
        setJsonData(updatedData);
        setSelectedCell(null);
    };

    const saveReport = async () => {
        try {
            const payload = {
                ...form,
                jsonHeader: jsonHeader.map((header) => header || ""),
                jsonData: jsonData.map((row) => row.map((cell) => cell || "")),
            };
            console.log("THIS IS PAYLOAAADDD >>>>", payload);
            const res = await axios.post(`${API_URL}/reports`, payload);
            console.log("SAVED REPORT WOHOOOO >>>>", res.data);
            Alert.alert("Mantap", "Report udah disave");
        } catch (err) {
            console.log("ERRORR SAVE REPORTTTT >>>>", err);
            Alert.alert("Error", "Gagal save report anjir");
        }
    };

    const fetchCompanies = async () => {
        try {
            const token = await AsyncStorage.getItem("authToken");
            if (!token) {
                console.error("No auth token found");
                return;
            }

            const res = await axios.get(`${API_URL}/company`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setCompanies(res.data);
        } catch (err) {
            console.error("Error fetching companies", err);
        }
    };

    const fetchUsers = async () => {
        try {
            const res = await axios.get(`${API_URL}/users`);
            setUsers(res.data);
        } catch (err) {
            console.error("Error fetching users", err);
        }
    };


    useEffect(() => {
        fetchCompanies();
        fetchUsers();
        fetchReportTypes();
    }, []);

    const handleSelectCompany = (companyName: string) => {
        setForm({ ...form, company: companyName });
        setCompanyModalVisible(false);
    };


    const handleToggleUser = (userId: string) => {
        setSelectedUsers((prev) => {
            if (prev.includes(userId)) {
                return prev.filter((id) => id !== userId);
            } else {
                return [...prev, userId];
            }
        });
    };

    const handleSaveUsers = () => {
        const selectedUserNames = users
            .filter((user) => selectedUsers.includes(user._id)) // Filter only selected users
            .map((user) => user.name); // Map to their names
        setForm({ ...form, userAccess: selectedUserNames }); // Update the form with selected user names
        setUserModalVisible(false); // Close the modal
    };
    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton}>
                    <Text style={styles.backButtonText}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Create Report</Text>
            </View>

            <View style={styles.formWrap}>
                <Text style={styles.formTitle}>Insert report details</Text>
                {Object.keys(form).map((key) => {
                    if (key === "reportType") {
                        return (
                            <TouchableOpacity
                                key={key}
                                style={styles.inputUnderline}
                                onPress={() => setReportTypeModalVisible(true)}
                            >
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Text style={{ color: form.reportType ? '#fff' : '#aaa' }}>
                                        {form.reportType || "Select Report Type"}
                                    </Text>
                                    <Text style={{ color: '#aaa' }}>▼</Text>
                                </View>
                            </TouchableOpacity>
                        );
                    }

                    if (key === "company") {
                        return (
                            <TouchableOpacity
                                key={key}
                                style={styles.inputUnderline}
                                onPress={() => setCompanyModalVisible(true)}
                            >
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Text style={{ color: form.company ? '#fff' : '#aaa' }}>
                                        {form.company || "Select Company"}
                                    </Text>
                                    <Text style={{ color: '#aaa' }}>▼</Text>
                                </View>
                            </TouchableOpacity>
                        );
                    }
                    if (key === "userAccess") {
                        return (
                            <TouchableOpacity
                                key={key}
                                style={styles.inputUnderline}
                                onPress={() => setUserModalVisible(true)}
                            >
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Text style={{ color: form.userAccess.length ? '#fff' : '#aaa' }}>
                                        {form.userAccess.length ? form.userAccess.join(", ") : "Select User Access"}
                                    </Text>
                                    <Text style={{ color: '#aaa' }}>▼</Text>
                                </View>
                            </TouchableOpacity>
                        );
                    }
                    return (
                        <TextInput
                            key={key}
                            placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
                            placeholderTextColor="#aaa"
                            value={typeof form[key as keyof typeof form] === "string" ? form[key as keyof typeof form] as string : ""}
                            onChangeText={(text) => setForm({ ...form, [key]: text })}
                            style={styles.inputUnderline}
                        />
                    );
                })}

                <Modal
                    visible={isReportTypeModalVisible}
                    transparent={true}
                    animationType="slide"
                    onRequestClose={() => setReportTypeModalVisible(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Select Report Type</Text>
                            <FlatList
                                data={reportTypes}
                                keyExtractor={(item, index) => (item._id ? item._id.toString() : `reportType-${index}`)}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={styles.modalItem}
                                        onPress={() => {
                                            setForm({ ...form, reportType: item.name });
                                            setReportTypeModalVisible(false);
                                        }}
                                    >
                                        <Text style={styles.modalItemText}>{item.name}</Text>
                                    </TouchableOpacity>
                                )}
                            />
                            <TouchableOpacity
                                style={styles.modalCloseButton}
                                onPress={() => setReportTypeModalVisible(false)}
                            >
                                <Text style={styles.modalCloseButtonText}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>

                <Modal
                    visible={isCompanyModalVisible}
                    transparent={true}
                    animationType="slide"
                    onRequestClose={() => setCompanyModalVisible(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Select a Company</Text>
                            <FlatList
                                data={companies}
                                keyExtractor={(item, index) => (item._id ? item._id.toString() : `company-${index}`)}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={styles.modalItem}
                                        onPress={() => handleSelectCompany(item.name)}
                                    >
                                        <Text style={styles.modalItemText}>{item.name}</Text>
                                    </TouchableOpacity>
                                )}
                            />
                            <TouchableOpacity
                                style={styles.modalCloseButton}
                                onPress={() => setCompanyModalVisible(false)}
                            >
                                <Text style={styles.modalCloseButtonText}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>

                {/* User Access Modal */}

                <Modal
                    visible={isUserModalVisible}
                    transparent={true}
                    animationType="slide"
                    onRequestClose={() => setUserModalVisible(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Select Users</Text>

                            {/* Search Bar */}
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Search users..."
                                placeholderTextColor="#aaa"
                                value={searchQuery}
                                onChangeText={(text) => setSearchQuery(text)}
                            />

                            {/* Filtered User List */}
                            <FlatList
                                data={users.filter((user) =>
                                    user.name.toLowerCase().includes(searchQuery.toLowerCase())
                                )}
                                keyExtractor={(item, index) => (item._id ? item._id.toString() : `user-${index}`)}
                                renderItem={({ item }) => {
                                    const isSelected = selectedUsers.includes(item._id);
                                    return (
                                        <TouchableOpacity
                                            style={[
                                                styles.modalItem,
                                                isSelected && { backgroundColor: "#1B3935" }, // latar gelap
                                            ]}
                                            onPress={() => handleToggleUser(item._id)}
                                        >
                                            <Text style={[styles.modalItemText, isSelected && { color: "#E2E4D7" }]}>
                                                {item.name}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                }}

                            />

                            <TouchableOpacity
                                style={styles.modalSaveButton}
                                onPress={handleSaveUsers}
                            >
                                <Text style={styles.modalSaveButtonText}>Save</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.modalCloseButton}
                                onPress={() => setUserModalVisible(false)}
                            >
                                <Text style={styles.modalCloseButtonText}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
                <TouchableOpacity style={styles.importButton} onPress={handlePickExcel}>
                    <Text style={styles.buttonTextDark}>Import Excel</Text>
                </TouchableOpacity>

                {/* <TouchableOpacity
                    style={styles.downloadButton}
                    onPress={() => setModalVisible(true)}
                >
                    <Text style={styles.buttonTextLight}>Download Template</Text>
                </TouchableOpacity> */}
            </View>
            <Modal
                visible={isModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Choose a Template</Text>
                        <TouchableOpacity
                            style={styles.modalButton}
                            onPress={() => {
                                setModalVisible(false);
                                handleDownloadTemplate("templateFullYear"); // pake nama file
                            }}
                        >
                            <Text style={styles.modalButtonText}>Template Full Year</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.modalButton}
                            onPress={() => {
                                setModalVisible(false);
                                handleDownloadTemplate("templateYearOnly"); // pake nama file
                            }}
                        >
                            <Text style={styles.modalButtonText}>Template Year Only</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.modalCloseButton}
                            onPress={() => setModalVisible(false)}
                        >
                            <Text style={styles.modalCloseButtonText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
            <View style={styles.tableWrapper}>
                <View style={styles.actionRowGrid}>
                    <TouchableOpacity style={styles.actionButton} onPress={() => addRow("above")}>
                        <Text style={styles.buttonTextLight}>+ Row Above</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionButton} onPress={() => addRow("below")}>
                        <Text style={styles.buttonTextLight}>+ Row Below</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionButton} onPress={() => addColumn("left")}>
                        <Text style={styles.buttonTextLight}>+ Col Left</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionButton} onPress={() => addColumn("right")}>
                        <Text style={styles.buttonTextLight}>+ Col Right</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.deleteButton} onPress={deleteRow}>
                        <Text style={styles.buttonTextLight}>- Row</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.deleteButton} onPress={deleteColumn}>
                        <Text style={styles.buttonTextLight}>- Col</Text>
                    </TouchableOpacity>

                </View>

                <ScrollView horizontal>
                    <View>
                        <View style={styles.row}>
                            {jsonHeader.map((header, colIndex) => (
                                <TouchableOpacity
                                    key={colIndex}
                                    style={styles.cell}
                                    onPress={() => setEditingHeaderIndex(colIndex)}
                                >
                                    {editingHeaderIndex === colIndex ? (
                                        <TextInput
                                            style={styles.cellInput}
                                            value={header}
                                            onChangeText={(text) => {
                                                const updated = [...jsonHeader];
                                                updated[colIndex] = text;
                                                setJsonHeader(updated);
                                            }}
                                            onBlur={() => setEditingHeaderIndex(null)}
                                            autoFocus
                                        />
                                    ) : (
                                        <Text numberOfLines={1}>{header || ""}</Text>
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>

                        {jsonData.map((row, rowIndex) => (
                            <View key={rowIndex} style={styles.row}>
                                {row.map((cell, colIndex) => {
                                    const editing = editingCell?.row === rowIndex && editingCell?.col === colIndex;
                                    return (
                                        <TouchableOpacity
                                            key={colIndex}
                                            style={styles.cell}
                                            onPress={() => setSelectedCell({ row: rowIndex, col: colIndex })}
                                            onLongPress={() => setEditingCell({ row: rowIndex, col: colIndex })}
                                        >
                                            {editing ? (
                                                <TextInput
                                                    style={styles.cellInput}
                                                    value={String(cell ?? "")}
                                                    onChangeText={(text) => {
                                                        const updated = [...jsonData];
                                                        updated[rowIndex][colIndex] = text;
                                                        setJsonData(updated);
                                                    }}
                                                    onBlur={() => setEditingCell(null)}
                                                    autoFocus
                                                />
                                            ) : (
                                                <Text numberOfLines={1}>{cell || ""}</Text>
                                            )}
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        ))}
                    </View>
                </ScrollView>
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={saveReport}>
                <Text style={styles.saveButtonText}>Save Report</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    // === General Container ===
    container: {
        flex: 1,
        backgroundColor: "#0D241F",
        padding: 16
    },

    // === Header ===
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
        marginTop: 16,
    },
    backButton: {
        marginRight: 16,
        padding: 8,
    },
    backButtonText: {
        fontSize: 24,
        color: '#E2E4D7',
        fontWeight: 'bold',
    },
    headerTitle: {
        fontSize: 24,
        color: '#E2E4D7',
        fontFamily: 'UbuntuBold',
    },

    // === Form ===
    formWrap: {
        marginBottom: 24
    },
    formTitle: {
        color: "#fff",
        fontSize: 16,
        marginBottom: 16
    },
    inputUnderline: {
        borderBottomWidth: 1,
        borderBottomColor: "#ccc",
        color: "#fff",
        marginBottom: 12,
        paddingVertical: 4
    },

    // === Buttons ===
    importButton: {
        backgroundColor: "#e0e0e0",
        padding: 12,
        borderRadius: 20,
        alignItems: "center",
        marginBottom: 8
    },
    downloadButton: {
        backgroundColor: "#112725",
        padding: 12,
        borderRadius: 20,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#E2E4D7"
    },
    actionButton: {
        backgroundColor: "#1B3935",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20
    },
    deleteButton: {
        backgroundColor: "#7B241C",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20
    },
    saveButton: {
        backgroundColor: "#7A8B89",
        padding: 16,
        borderRadius: 20,
        alignItems: "center",
        marginBottom: 24
    },

    // === Button Texts ===
    buttonTextDark: {
        color: "#000",
        fontWeight: "bold"
    },
    buttonTextLight: {
        color: "#E2E4D7",
        fontWeight: "bold"
    },
    saveButtonText: {
        color: "#000",
        fontFamily: "UbuntuBold",
        fontSize: 16
    },

    // === Table / Grid ===
    tableWrapper: {
        backgroundColor: "#7A8B89",
        borderRadius: 16,
        padding: 8,
        marginBottom: 24,
        overflow: "hidden"
    },
    actionRowGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "flex-start",
        gap: 8,
        marginBottom: 12
    },
    row: {
        flexDirection: "row"
    },
    cell: {
        width: CELL_WIDTH,
        height: CELL_HEIGHT,
        borderWidth: 0.5,
        borderColor: "rgba(0, 0, 0, 1)",
        backgroundColor: "#7A8B89",
        justifyContent: "center",
        alignItems: "center"
    },
    cellInput: {
        width: "100%",
        height: "100%",
        textAlign: "center",
        color: "#fff"
    },

    // === Modal ===
    modalOverlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)"
    },
    modalContent: {
        backgroundColor: "#fff",
        padding: 20,
        borderRadius: 10,
        width: "80%",
        alignItems: "center"
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 20
    },
    modalItem: {
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#ccc",
        width: "100%"
    },
    modalItemText: {
        fontSize: 16,
        color: "#000"
    },
    modalItemSelected: {
        backgroundColor: "#E6E6E6"
    },
    modalItemTextSelected: {
        color: "#E2E4D7"
    },
    modalButton: {
        backgroundColor: "#112725",
        padding: 12,
        borderRadius: 20,
        alignItems: "center",
        marginBottom: 10,
        width: "100%"
    },
    modalButtonText: {
        color: "#E2E4D7",
        fontWeight: "bold",
        textAlign: "center"
    },
    modalSaveButton: {
        backgroundColor: "#112725",
        padding: 12,
        borderRadius: 20,
        alignItems: "center",
        marginTop: 10,
        width: "100%"
    },
    modalSaveButtonText: {
        color: "#E2E4D7",
        fontWeight: "bold",
        textAlign: "center"
    },
    modalCloseButton: {
        marginTop: 10
    },
    modalCloseButtonText: {
        color: "#7B241C",
        fontWeight: "bold",
        textAlign: "center"
    },

    // === Search Input in Modal ===
    searchInput: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 10,
        padding: 8,
        marginBottom: 12,
        width: "100%",
        color: "#000",
        backgroundColor: "#f9f9f9",
    },
});

export default CreateReportPage;
