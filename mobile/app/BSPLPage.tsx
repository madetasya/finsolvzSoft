import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRoute } from "@react-navigation/native";
import axios from "axios";
import NestedDrawer from "../components/NestedDrawer"; 


const API_URL = process.env.EXPO_PUBLIC_API_URL;


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
                // Handle error
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
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 64 }}>

            <Text style={styles.title}>{report.reportName}</Text>

            <Text style={styles.subtitle}>{report.reportType?.name}</Text>
            <Text style={styles.subtitle}>{report.company?.name}</Text>

            <Text style={styles.subtitle}>{report.currency}</Text>
            <Text style={styles.subtitle}>{report.year}</Text>

            <NestedDrawer reportId={reportId} />


        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0D241F",
        padding: 16,
        paddingBottom: 32,
    },
    title: {
        fontSize: 20,
        color: "#fff",
        fontWeight: "bold",
        marginTop: 32,

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
});

export default BSPLPage;
