import React, { useState, useEffect } from "react"
import {
    View,
    Text,
    ActivityIndicator,
    StyleSheet,
    Alert,
    ScrollView,
    TouchableOpacity,
    Modal,
    Pressable,
    Platform
} from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import axios from "axios"
import { LinearGradient } from "expo-linear-gradient"
import { useRoute, RouteProp } from "@react-navigation/native"
import { RootStackParamList } from "../types"
import BSPLTable from "../components/BSPLTable"
import i18n from '../src/i18n/index'
import { useTranslation } from "react-i18next"
import { KeyboardAvoidingView } from "react-native"

const API_URL = process.env.EXPO_PUBLIC_API_URL

const BSPLPage: React.FC = () => {
    const route = useRoute<RouteProp<RootStackParamList, "BSPLPage">>()
    const { reportId } = route.params
    const [report, setReport] = useState<any | null>(null)
    const [loading, setLoading] = useState(true)
    const [selectedYears, setSelectedYears] = useState<string[]>([])
    const [yearModalVisible, setYearModalVisible] = useState(false)
    const [labelColumnCount, setLabelColumnCount] = useState(1)
    const { t } = useTranslation();


    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = await AsyncStorage.getItem("authToken")
                const res = await axios.get(`${API_URL}/reports/${reportId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                })

                const jsonData = res.data?.reportData?.jsonData || []
                const jsonHeader: string[] = res.data?.reportData?.jsonHeader || []


                const labelCount =
                    jsonHeader.findIndex((h) => /^[0-9]{4}$/.test(h)) || 1

                const years = jsonHeader.slice(labelCount).filter((h) => /^[0-9]{4}$/.test(h))

                res.data.jsonHeaderParsed = years
                res.data.jsonDataParsed = jsonData
                setLabelColumnCount(labelCount)
                setReport(res.data)
                setSelectedYears([])

            } catch (err) {
                Alert.alert("Error", "Failed to load BSPL report")
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [reportId])

    const toggleYear = (year: string) => {
        if (selectedYears.includes(year)) {
            setSelectedYears(selectedYears.filter((y) => y !== year))
        } else {
            setSelectedYears([...selectedYears, year])
        }
    }

    const filteredHeaders =
        report?.reportData?.jsonHeader?.slice(0, labelColumnCount).concat(selectedYears) || []


    const filteredData =
        report?.reportData?.jsonData?.map((row: any) => {
            const base = row.slice(0, labelColumnCount)
            const values = selectedYears.map((year) => {
                const index = report?.reportData?.jsonHeader.indexOf(year)
                return row[index]
            })
            return [...base, ...values]
        }) || []

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={{ flex: 1 }}
        >
            <ScrollView
                style={{ flex: 1, backgroundColor: "transparent" }}
                contentContainerStyle={{
                    flexGrow: 1,
                    paddingBottom: 100,
                }}
                keyboardShouldPersistTaps="handled"
            >
                <LinearGradient colors={["#071C25", "#253d3d"]} style={StyleSheet.absoluteFill} />

                <View style={{ flex: 1, paddingBottom: 80 }}>
                    {loading || !report ? (
                        <ActivityIndicator size="large" color="#6c918b" style={{ marginTop: 48 }} />
                    ) : (
                        <>
                            <Text style={styles.title}>{report.reportType?.name}</Text>
                            <Text style={styles.detail}>{report.company?.name}</Text>
                            <Text style={styles.detail}>{report.currency}</Text>

                            <View style={styles.filterContainer}>
                                <TouchableOpacity
                                    onPress={() => setYearModalVisible(true)}
                                    style={styles.modalToggleButton}
                                >
                                    <Text style={styles.modalToggleText}>
                                        {selectedYears.length > 0
                                            ? `${t("selected")} (${selectedYears.length})`
                                            : t("chooseYears")}
                                    </Text>

                                </TouchableOpacity>
                            </View>

                            <Modal
                                visible={yearModalVisible}
                                transparent={true}
                                animationType="slide"
                                onRequestClose={() => setYearModalVisible(false)}
                            >
                                <View style={styles.modalBackdrop}>
                                    <View style={styles.modalContent}>
                                        <Text style={styles.modalTitle}>{t("chooseYears")}</Text>
                                        <ScrollView style={{ maxHeight: 200 }}>
                                            {report.jsonHeaderParsed.map((year: string) => (
                                                <TouchableOpacity
                                                    key={year}
                                                    onPress={() => toggleYear(year)}
                                                    style={[
                                                        styles.modalYearItem,
                                                        selectedYears.includes(year) && styles.modalYearItemActive
                                                    ]}
                                                >
                                                    <Text
                                                        style={[
                                                            styles.modalYearText,
                                                            selectedYears.includes(year) && styles.modalYearTextActive
                                                        ]}
                                                    >
                                                        {year}
                                                    </Text>
                                                </TouchableOpacity>
                                            ))}
                                        </ScrollView>

                                        <Pressable onPress={() => setYearModalVisible(false)} style={styles.modalCloseButton}>
                                            <Text style={{ color: "#fff", fontFamily: "UbuntuBold"}}>{t("done")}</Text>
                                        </Pressable>
                                    </View>
                                </View>
                            </Modal>

                            {selectedYears.length > 0 && (
                                <BSPLTable
                                    headers={filteredHeaders}
                                    data={filteredData}
                                    selectedYears={selectedYears}
                                    labelColumnCount={labelColumnCount}

                                />
                            )}
                        </>
                    )}
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    )
}

const styles = StyleSheet.create({
    title: {
        fontSize: 18,
        fontFamily: "UbuntuBold",
        color: "#FFF",
        marginLeft: 16,
        marginTop: 48
    },
    detail: {
        fontSize: 12,
        color: "#A9A9A9",
        marginLeft: 16,
        marginTop: 4,
        fontFamily: "UbuntuRegular",
        
    },
    filterContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginVertical: 32,
        paddingHorizontal: 16,
        fontFamily: "UbuntuRegular",
    },
    modalToggleButton: {
        paddingVertical: 8,
        paddingHorizontal: 32,
        backgroundColor: "#0A6067",
        borderRadius: 20,
        alignSelf: "flex-start",
        
    },
    modalToggleText: {
        color: "#fff",
        fontSize: 13,
        fontFamily: "UbuntuBold",
    },
    modalBackdrop: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center"
    },
    modalContent: {
        backgroundColor: "#fff",
        padding: 20,
        borderRadius: 8,
        width: "80%"
    },
    modalTitle: {
        fontSize: 16,
        fontFamily: "UbuntuBold",
        color: "#253d3d",
        marginBottom: 10
    },
    modalYearItem: {
        paddingVertical: 8,
        paddingHorizontal: 10,
        borderRadius: 10,
        marginBottom: 6,
        fontFamily: "UbuntuRegular", 

    },
    modalYearItemActive: {
        backgroundColor: "#8EB8B8"
    },
    modalYearText: {
        color: "#253d3d",
        fontFamily: "UbuntuRegular",
    },
    modalYearTextActive: {
        color: "#000"
    },
    modalCloseButton: {
        backgroundColor: "#0A6067",
        paddingVertical: 8,
        borderRadius: 10,
        alignItems: "center",
        marginTop: 12
    }
})

export default BSPLPage
