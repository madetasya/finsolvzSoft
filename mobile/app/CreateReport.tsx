import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert, Modal } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import * as XLSX from "xlsx";
import axios from "axios";
import * as WebBrowser from "expo-web-browser";
import { Asset } from "expo-asset";
import { FlatList } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage";
import { RouteProp, useRoute } from "@react-navigation/native";

const API_URL = process.env.EXPO_PUBLIC_API_URL;
const CELL_WIDTH = 100;
const CELL_HEIGHT = 40;
const defaultHeaders = ["Category", "Subcategory1", "Subcategory2", "Subcategory3"];

const CreateReportPage = () => {
    const [form, setForm] = useState({
        reportName: "",
        currency: "",
        year: "",
        reportType: "",
        company: "",
        userAccess: [] as string[]
    });

    const [jsonHeader, setJsonHeader] = useState(defaultHeaders);
    const [jsonData, setJsonData] = useState<string[][]>(
        Array(3).fill(null).map(() => ["", "", "", ""])
    );

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

    type CreateReportPageRouteProp = RouteProp<{ params: { reportId?: string } }, 'params'>;

    const route = useRoute<CreateReportPageRouteProp>();
    const reportId = route.params?.reportId;
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
                Alert.alert("Oops", "Something went wrong, try again later.");
                return;
            }
            const res = await axios.get(`${API_URL}/reportTypes`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setReportTypes(res.data);

        } catch (err) {
            Alert.alert("Oops", "Error fetching report types, try again later.");
        }
    };

    const updateForm = (field: keyof typeof form, value: string): void => {
        setForm({ ...form, [field]: value });
    };

    const addRow = (pos: "above" | "below"): void => {
        const { row } = selectedCell ?? { row: jsonData.length - 1, col: jsonHeader.length - 1 };
        const newRow: string[] = Array(jsonHeader.length).fill("");
        const updated = [...jsonData];
        const idx = pos === "above" ? row : row + 1;
        updated.splice(idx, 0, newRow);
        setJsonData(updated);
        setSelectedCell({ row: idx, col: 0 });
    };

    const addColumn = (pos: "left" | "right"): void => {
        const { col } = selectedCell ?? { row: jsonData.length - 1, col: jsonHeader.length - 1 };
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
        setSelectedCell({ row: 0, col: idx });
    };

    const deleteRow = (pos: "above" | "below"): void => {
        if (!selectedCell) return;

        const { row } = selectedCell;

        if (jsonData.length <= 1) {
            Alert.alert("NO!", "You can't delete all rows!");
            return;
        }

        const idx = pos === "above" ? row : row + 1;
        const updated = [...jsonData];
        updated.splice(idx, 1);
        setJsonData(updated);
    };

    const deleteColumn = (pos: "left" | "right"): void => {
        if (!selectedCell) return;

        const { row, col } = selectedCell;

        if (jsonHeader.length <= 1) {
            Alert.alert("NO!", "You can't delete all columns!");
            return;
        }

        const idx = pos === "left" ? col : col + 1;
        const updatedHeader = [...jsonHeader];
        updatedHeader.splice(idx, 1);

        const updatedData = jsonData.map((row) => {
            const newRow = [...row];
            newRow.splice(idx, 1);
            return newRow;
        });

        setJsonHeader(updatedHeader);
        setJsonData(updatedData);
    };

    const handleCellSelection = (rowIndex: number, colIndex: number) => {
        setSelectedCell({ row: rowIndex, col: colIndex });
    };
    const wrapTextEvery3Words = (text: string): string => {
        const words = text.split(" ");
        let result = "";
        for (let i = 0; i < words.length; i++) {
            result += words[i];
            if ((i + 1) % 3 === 0) {
                result += "\n";
            } else {
                result += " ";
            }
        }
        return result.trim();
    };

    const getMaxCharLengthPerColumn = (headers: string[], data: string[][]): number[] => {
        let result = headers.map((header, i) => header.length);

        for (let row of data) {
            for (let i = 0; i < row.length; i++) {
                if (row[i].length > result[i]) {
                    result[i] = row[i].length;
                }
            }
        }

        return result;
    };

    const charLengths = getMaxCharLengthPerColumn(jsonHeader, jsonData);

    const saveReport = async () => {
        try {
            const token = await AsyncStorage.getItem("authToken");
            if (!token) {
                Alert.alert("Error", "No auth token found");
                return;
            }

            const reportData = {
                jsonHeader: jsonHeader,
                jsonData: jsonData,
            };

            const payload = {
                ...form,
                userAccess: (form.userAccess || []).filter((id) => !!id),
                reportData: reportData,
            };

            if (reportId) {
                await axios.put(`${API_URL}/reports/${reportId}`, payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                Alert.alert("Success!", "Report updated successfully.");
            } else {
                await axios.post(`${API_URL}/reports`, payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                Alert.alert("Success!", "Report saved successfully.");
            }
        } catch (err) {
            Alert.alert("Error", "Failed to save the report.");
        }
    };


    const fetchCompanies = async () => {
        try {
            const token = await AsyncStorage.getItem("authToken");
            if (!token) {
                Alert.alert("Oops", "Something went wrong, try again later.");
                return;
            }

            const res = await axios.get(`${API_URL}/company`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setCompanies(res.data);
        } catch (err) {
            Alert.alert("Something Wrong", "Error fetching company data, try again later.");
        }
    };

    const fetchUsers = async () => {
        try {
            const token = await AsyncStorage.getItem("authToken");
            if (!token) {
                Alert.alert("Oops", "No token found");
                return;
            }

            const res = await axios.get(`${API_URL}/users`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setUsers(res.data);
        } catch (err) {
            Alert.alert("Something Wrong", "Error fetching user data, try again later.");
        }
    };

    const fetchReportDetail = async (id: string) => {
        try {
            const token = await AsyncStorage.getItem("authToken");
            if (!token) {
                Alert.alert("Oops", "Something went wrong, try again later.");
                return;
            }
            const res = await axios.get(`${API_URL}/reports/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const data = res.data;

            setForm({
                reportName: data.reportName,
                currency: data.currency,
                year: data.year.toString(),
                reportType: data.reportType?._id || "",
                company: data.company?._id || "",
                userAccess: data.userAccess?.map((u: any) => u._id) || [],
            });
            setSelectedUsers(
                Array.isArray(data.userAccess)
                    ? typeof data.userAccess[0] === "string"
                        ? data.userAccess
                        : data.userAccess.map((u: any) => u._id)
                    : []
            )

            setJsonHeader(data.reportData?.jsonHeader || defaultHeaders);
            setJsonData(data.reportData?.jsonData || [["", "", "", ""]]);
        } catch (err) {
            Alert.alert("Something Wrong", "Error fetching report detail, try again later.");
        }
    };


    const handleSelectCompany = (companyId: string) => {
        setForm({ ...form, company: companyId });
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
        const selectedUserIds = users
            .filter((user) => selectedUsers.includes(user._id))
            .map((user) => user._id);

        setForm({ ...form, userAccess: selectedUserIds });

        setUserModalVisible(false);
    };
    useEffect(() => {

        const fetchInitialData = async () => {
            await fetchCompanies();
            await fetchUsers();
            await fetchReportTypes();

            if (reportId) {
                await fetchReportDetail(reportId);
            }
        };

        fetchInitialData();
    }, [reportId]);

    useEffect(() => {
        if (users.length > 0 && form.userAccess.length > 0) {
            setForm((prev) => ({ ...prev })) // trigger re-render
        }
    }, [users])


    return (
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 64 }}>
            <View style={styles.header}>

                <Text style={styles.headerTitle}>Report Detail</Text>
            </View>

            <View style={styles.formWrap}>
                <TextInput
                    placeholder="Report Name"
                    placeholderTextColor="#aaa"  
                    value={form.reportName}      
                    onChangeText={(text) => updateForm("reportName", text)}  
                    style={styles.inputUnderline}  
                />

                {Object.keys(form).map((key) => {
                    if (key === "reportName") {
                        return null;
                    }
                    if (key === "reportType") {
                        return (
                            <TouchableOpacity
                                key={key}
                                style={styles.inputUnderline}
                                onPress={() => setReportTypeModalVisible(true)}
                            >
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Text style={{ color: form.reportType ? '#fff' : '#aaa' }}>
                                        {reportTypes.find((r) => r._id === form.reportType)?.name || "Select Report Type"}
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
                                        {companies.find((c) => c._id === form.company)?.name || "Select Company"}
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
                                    <Text style={{ color: form.userAccess.length > 0 ? "#fff" : "#aaa" }}>
                                        {form.userAccess.length > 0 ? `Selected Users (${form.userAccess.length})` : "Select User Access"}
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
                                            setForm({ ...form, reportType: item._id });
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
                                        onPress={() => handleSelectCompany(item._id)}
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
                                                isSelected && { backgroundColor: "#1B3935" },
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

                <TouchableOpacity
                    style={styles.downloadButton}
                    onPress={() => WebBrowser.openBrowserAsync("https://drive.google.com/file/d/1JQo7bi6PO8OXAym97Gp9xAVbDZm-L-I1/view?usp=sharing")}
                >
                    <Text style={styles.buttonTextLight}>Download Template</Text>
                </TouchableOpacity>
            </View>
            {/* <Modal
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
                                handleDownloadTemplate("templateFullYear"); 
                            }}
                        >
                            <Text style={styles.modalButtonText}>Template Full Year</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.modalButton}
                            onPress={() => {
                                setModalVisible(false);
                                handleDownloadTemplate("templateYearOnly"); 
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
            </Modal> */}
            <View style={styles.tableWrapper}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
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

                        <TouchableOpacity style={styles.deleteButton} onPress={() => deleteRow("above")}>
                            <Text style={styles.buttonTextLight}>- Row Above</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.deleteButton} onPress={() => deleteRow("below")}>
                            <Text style={styles.buttonTextLight}>- Row Below</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.deleteButton} onPress={() => deleteColumn("right")}>
                            <Text style={styles.buttonTextLight}>- Col Right</Text>
                        </TouchableOpacity>


                    </View>
                </ScrollView>

                <ScrollView horizontal>
                    <View>
                        {/* HEADER */}
                        <View style={styles.row}>
                            {jsonHeader.map((header, colIndex) => (
                                <TouchableOpacity
                                    key={colIndex}
                                    style={[styles.cell, selectedCell?.col === colIndex && selectedCell?.row === -1 ? styles.selectedCell : {}]} // Highlight selected header
                                    onPress={() => setSelectedCell({ row: -1, col: colIndex })} // Select header
                                >
                                    <Text>{header}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* BODY */}
                        {jsonData.map((row, rowIndex) => (
                            <View key={rowIndex} style={styles.row}>
                                {row.map((cell, colIndex) => (
                                    <TouchableOpacity
                                        key={colIndex}
                                        style={[
                                            styles.cell,
                                            selectedCell?.row === rowIndex && selectedCell?.col === colIndex
                                                ? styles.selectedCell // Highlight selected cell
                                                : {}
                                        ]}
                                        onPress={() => handleCellSelection(rowIndex, colIndex)} // Select cell on press
                                    >
                                        {selectedCell?.row === rowIndex && selectedCell?.col === colIndex ? (
                                            // Editable input when selected
                                            <TextInput
                                                value={cell}
                                                onChangeText={(text) => {
                                                    const updatedData = [...jsonData];
                                                    updatedData[rowIndex][colIndex] = text;
                                                    setJsonData(updatedData);
                                                }}
                                                style={styles.cellInput}
                                            />
                                        ) : (
                                            <Text>{cell}</Text>
                                        )}
                                    </TouchableOpacity>
                                ))}
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
    selectedCell: {
        backgroundColor: "#c0e0e0", // Light background for selected cell
    },
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
        alignItems: 'flex-end',
        paddingTop: 8
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
        flexWrap: "nowrap",
        justifyContent: "flex-start",
        alignItems: "center",
        columnGap: 8,
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
        alignItems: "flex-start",
        paddingLeft: 9,
    },
    cellInput: {
        width: "100%",
        height: "100%",
        textAlign: "left",
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
