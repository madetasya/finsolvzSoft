import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { Picker } from "@react-native-picker/picker";
import ReportFilter from "../components/ReportFilter";
import Grid from "../assets/image/Grid.svg";
import ResultsPage from "../components/Results";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import HomeHeader from "../components/HeaderHome";
const API_URL = process.env.EXPO_PUBLIC_API_URL;

const HomePage: React.FC<{ navigation: any }> = ({ navigation }) => {
    const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
    const [reportType, setReportType] = useState<string[] | null>(null);
    const [userName, setUserName] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    function formatUserName(name: string) {
        if (name.length <= 15) {
            return name;
        }
        let spaceIndexes = [];
        for (let i = 0; i < name.length; i++) {
            if (name[i] === ' ') {
                spaceIndexes.push(i);
            }
        }
        if (spaceIndexes.length < 2) {
            return name;
        }
        const secondSpaceIndex = spaceIndexes[1];
        return name.substring(0, secondSpaceIndex) + '\n' + name.substring(secondSpaceIndex + 1);
    }

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = await AsyncStorage.getItem("authToken");
                if (!token) {
                    console.error("No auth token found");
                    return;
                }

                const response = await axios.get(`${API_URL}/loginUser`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                setUserName(response.data.name);

            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);
    const handleFilterChange = (company: string | null, type: string[] | null) => {
        setSelectedCompany(company);
        setReportType(type); 
    };
    const handleReportNavigation = () => {
        if (!selectedCompany || !reportType) return;

        if (reportType?.includes("Revenue")) {
            navigation.navigate("Revenue", { companyId: selectedCompany, reportType });
        } else {
            navigation.navigate("BSPL", { companyId: selectedCompany, reportType });
        }
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={["#011414", "#314E4A"]}
                style={styles.background}
            />

            {/* PROFILE */}
            <HomeHeader
                navigation={navigation}
                userName={userName}
                formatUserName={formatUserName}
            />


            <View style={{ marginTop: 320 }}>
                <ReportFilter onFilterChange={handleFilterChange}  />

                <ResultsPage
                    selectedCompany={selectedCompany}
                    reportType={reportType}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#314E4A",
    alignItems: "center",
    },
    background: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    grid: {
        width: "100%",
        height: "100%",
        position: "absolute",
        top: 0,
        left: 0,
    },
    profile: {
        width: 60,
        height: 70,
        backgroundColor: "#D9D9D9",
        borderRadius: 30,
        marginBottom: 16,
    },
    greeting: {
        fontSize: 23,
        color: "#FFFFFF",
        opacity: 0.7,
        marginBottom: 4,
    },
    clientName: {
        fontSize: 32,
        color: "#FFFFFF",
        fontWeight: "bold",
    },
    picker: {
        width: "100%",
        backgroundColor: "#fff",
        borderRadius: 10,
        marginTop: 10,
    },
    noCompanyText: {
        fontSize: 16,
        color: "#bbb",
        marginTop: 10,
    },
    button: {
        backgroundColor: "#15616D",
        padding: 12,
        borderRadius: 5,
        alignItems: "center",
        marginVertical: 10,
        width: "80%",
        alignSelf: "center",
    },
    buttonText: {
        color: "white",
        fontWeight: "bold",
    },
});

export default HomePage;