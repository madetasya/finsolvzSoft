import React, { useState, useEffect } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useRoute, RouteProp } from "@react-navigation/native";
import BSPLTable from "../components/BSPLTable";
import { ScrollView } from "react-native-gesture-handler";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const BSPLPage: React.FC = () => {
    type BSPLRouteProp = RouteProp<{ params: { reportId: string } }, "params">;
    const route = useRoute<BSPLRouteProp>();
    const reportId = route.params?.reportId;

    const [report, setReport] = useState<{
        reportName: string;
        reportType: { name: string };
        year: number;
        monthData?: Record<string, number[]>;
        categories?: string[];
    } | null>(null);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getReportById = async () => {
            if (!reportId) {
                console.error("No report ID provided");
                setLoading(false);
                return;
            }

            try {
                const token = await AsyncStorage.getItem("authToken");
                if (!token) {
                    console.error("No token");
                    setLoading(false);
                    return;
                }

                const response = await axios.get(`${API_URL}/reports/${reportId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                setReport(response.data);
            } catch (error) {
                console.error("Error fetching report:", error);
            } finally {
                setLoading(false);
            }
        };

        getReportById();
    }, [reportId]);

    return (
        <ScrollView style={styles.fullScreen}>
            {loading ? (
                <ActivityIndicator size="large" color="#6c918b" style={styles.loading} />
            ) : (
                <View>
                    <Text style={styles.title}>{report?.reportName || "No Report Found"}</Text>
                    <Text style={styles.detailReport}>{report?.reportType?.name || "Unknown"}</Text>
                    <Text style={styles.detailReport}>{report?.year || "N/A"}</Text>

                    {report?.monthData && report?.categories && (
                        <View>
                            <Text style={styles.sectionTitle}>{report.reportName} (Main Report)</Text>
                            <BSPLTable monthData={report.monthData} categories={report.categories} />
                        </View>
                    )}
                </View>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    fullScreen: { flex: 1 },
    title: { fontSize: 16, fontWeight: "bold", color: "#FFFFFF", marginLeft: 16, marginTop: 48 },
    detailReport: { fontSize: 12, color: "#A9A9A9", marginLeft: 16, marginTop: 4 },
    loading: { marginLeft: 16, marginTop: 16 },
    sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#FFFFFF", marginLeft: 16, marginTop: 24 },
});

export default BSPLPage;
