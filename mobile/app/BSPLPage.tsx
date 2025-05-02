import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRoute } from "@react-navigation/native";
import axios from "axios";

const API_URL = process.env.EXPO_PUBLIC_API_URL;
const CELL_WIDTH = 100;
const CELL_HEIGHT = 40;
const CELL_WIDTHS = [200, 130, 130]; // Label, 2024, 2023



const BSPLPage: React.FC = () => {
    const route = useRoute();
    const { reportId } = route.params as { reportId: string };

    const [report, setReport] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReport = async () => {
            try {
                const token = await AsyncStorage.getItem("authToken");
                if (!token) return;
                const res = await axios.get(`${API_URL}/reports/${reportId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setReport(res.data);
            } catch (err) {
                console.error("ERROR FETCH REPORT >>>", err);
            } finally {
                setLoading(false);
            }
        };
        fetchReport();
    }, [reportId]);

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#6c918b" />
            </View>
        );
    }

    if (!report) {
        return (
            <View style={styles.centered}>
                <Text style={styles.errorText}>No report found</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>{report.reportName}</Text>

            <Text style={styles.subtitle}>{report.reportType?.name}</Text>
            <Text style={styles.subtitle}>{report.company?.name}</Text>

            <Text style={styles.subtitle}>{report.currency}</Text>
            <Text style={styles.subtitle}>{report.year}</Text>

            <ScrollView horizontal style={styles.tableWrapper}>
                <View>
     
                    {/* Header Row */}
                    <View style={styles.row}>
                        <View style={[styles.cell, { width: CELL_WIDTHS[0], alignItems: "flex-start" }]}>
                            <Text style={[styles.cellText, { fontWeight: "bold", fontFamily: "UbuntuBold" }]}>
                                {report.reportData?.jsonHeader?.[0] ?? "Description"}
                            </Text>
                        </View>
                        <View style={[styles.cell, { width: CELL_WIDTHS[1] }]}>
                            <Text style={[styles.cellText, { fontWeight: "bold", fontFamily: "UbuntuBold" }]}>
                                {report.reportData?.jsonHeader?.[2] ?? "2024"}
                            </Text>
                        </View>
                        <View style={[styles.cell, { width: CELL_WIDTHS[2] }]}>
                            <Text style={[styles.cellText, { fontWeight: "bold", fontFamily: "UbuntuBold" }]}>
                                {report.reportData?.jsonHeader?.[3] ?? "2023"}
                            </Text>
                        </View>
                    </View>

                    {/* Body Rows */}
                    {Array.isArray(report.reportData?.jsonData) &&
                        report.reportData.jsonData.map((row: string[], rowIndex: number) => {
                            const label = row[0] ?? "";
                            const value2024 = row[2] ?? "";
                            const value2023 = row[3] ?? "";

                            const isJumlah = label.toUpperCase().includes("JUMLAH");

                            return (
                                <View key={rowIndex} style={styles.row}>
                                    {/* Label Cell */}
                                    <View
                                        style={[
                                            styles.cell,
                                            {
                                                width: CELL_WIDTHS[0],
                                                alignItems: "flex-start",
                                                paddingLeft: 8,
                                            },
                                        ]}
                                    >
                                        {label !== "" && (
                                            <Text
                                                style={[
                                                    styles.cellText,
                                                    (rowIndex === 0 || isJumlah) && {
                                                        fontWeight: "bold",
                                                        fontFamily: "UbuntuBold",
                                                    },
                                                ]}
                                            >
                                                {label}
                                            </Text>
                                        )}
                                    </View>

                                    {/* Value 2024 */}
                                    <View style={[styles.cell, { width: CELL_WIDTHS[1] }]}>
                                        <Text style={styles.cellText}>{value2024}</Text>
                                    </View>

                                    {/* Value 2023 */}
                                    <View style={[styles.cell, { width: CELL_WIDTHS[2] }]}>
                                        <Text style={styles.cellText}>{value2023}</Text>
                                    </View>
                                </View>
                            );
                        })}



                </View>
            </ScrollView>

        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0D241F",
        padding: 16,
    },
    title: {
        fontSize: 20,
        color: "#fff",
        fontWeight: "bold",
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: "#ccc",
        marginBottom: 4,
    },
    centered: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#0D241F",
    },
    errorText: {
        color: "red",
        fontSize: 16,
    },
    tableWrapper: {
        marginTop: 16,
        backgroundColor: "#7A8B89",
        borderRadius: 12,
        padding: 8,
    },
    row: {
        flexDirection: "row",
    },
    cell: {
        minHeight: 36,
        justifyContent: "flex-start",
        alignItems: "flex-start",
        paddingHorizontal: 6,
        paddingVertical: 4,
    },


    cellText: {
        color: "#fff",
        textAlign: "left",
    },
});

export default BSPLPage;
