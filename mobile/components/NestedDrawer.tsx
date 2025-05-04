import { JSX, useEffect, useState } from "react"
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native"
import axios from "axios"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { Alert } from "react-native"

const API_URL = process.env.EXPO_PUBLIC_API_URL

interface NestedDrawerProps {
    reportId: string
}

type ReportRow = (string | number | null | undefined)[]

export default function NestedDrawer({ reportId }: NestedDrawerProps) {
    const [open, setOpen] = useState<Record<string, boolean>>({})
    const [data, setData] = useState<ReportRow[]>([])
    const [header, setHeader] = useState<string[]>([])

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = await AsyncStorage.getItem("authToken")
                if (!token) return
                const res = await axios.get(`${API_URL}/reports/${reportId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                })
                setHeader(res.data.reportData.jsonHeader)
                setData(res.data.reportData.jsonData)
            } catch (err) {
                // console.log("THIS IS ERRORRR >>>>", err)
                Alert.alert("Oops", "Something went wrong, try again later.");
            }
        }
        fetchData()
    }, [reportId])

    const toggle = (key: string) => {
        setOpen((prev) => ({ ...prev, [key]: !prev[key] }))
    }

    const formatValue = (val: string | number | null | undefined): string => {
        if (!val || val === "-") return ""
        const num = Number(val)
        if (!isNaN(num)) return num % 1 !== 0 ? num.toFixed(2) : num.toString()
        return String(val)
    }

    const renderRows = (data: ReportRow[]): JSX.Element[] => {
        let output: JSX.Element[] = []
        let currentCat = ""
        let currentSub = ""

        for (let i = 0; i < data.length; i++) {
            const row = data[i]
            const [level1, level2, level3, ...values] = row
            const isTotal =
                (typeof level1 === "string" && level1.toLowerCase().includes("jumlah")) ||
                (typeof level2 === "string" && level2.toLowerCase().includes("jumlah"))

            if (level1 && !level2) {
                currentCat = level1 as string
                const isSingleWord = currentCat.trim().split(" ").length === 1
                const subKey = `${currentCat}-single`
                const hasMulti = values.filter((v) => v !== "" && v != null).length > 1

                let hasChildren = false
                for (let j = i + 1; j < data.length; j++) {
                    if (data[j][0] || data[j][1]) break
                    hasChildren = true
                }

                if (isSingleWord) {
                    output.push(<Text key={`cat-${i}`} style={styles.sectionTitle}>{currentCat}</Text>)
                } else {
                    output.push(
                        <TouchableOpacity
                            key={`catbubble-${i}`}
                            onPress={() => toggle(subKey)}
                            style={[styles.cardSub, isTotal && styles.cardTotal]}
                        >
                            <Text style={[styles.label, isTotal && { color: "#fff" }]}>{currentCat}</Text>
                            {!hasChildren && !isTotal && values.some((v) => v !== "" && v != null) && (
                                <Text style={[styles.value, isTotal && { color: "#fff" }]}>
                                    {formatValue(values[0])}
                                </Text>
                            )}
                        </TouchableOpacity>
                    )

                    if (open[subKey] && hasMulti) {
                        output.push(
                            <View key={`total-expand-${i}`} style={styles.cardSub2}>
                                {header.slice(3).map((h, idx) => (
                                    <View key={`${h}-${i}`} style={styles.valueRow}>
                                        <Text style={styles.sub2Label}>{h}</Text>
                                        <Text style={styles.sub2Val}>{formatValue(values[idx])}</Text>
                                    </View>
                                ))}
                            </View>
                        )
                    }
                }
            }

            else if (level2 && !level3) {
                currentSub = level2 as string
                const subKey = `${currentCat}-${currentSub}`
                const hasMulti = values.filter((v) => v !== "" && v != null).length > 1

                let hasChildren = false
                for (let j = i + 1; j < data.length; j++) {
                    if (data[j][0] || data[j][1]) break
                    hasChildren = true
                }

                output.push(
                    <TouchableOpacity
                        key={`sub1-${i}`}
                        onPress={() => toggle(subKey)}
                        style={[styles.cardSub, isTotal && styles.cardTotal]}
                    >
                        <Text style={[styles.label, isTotal && { color: "#fff" }]}>{currentSub}</Text>
                    </TouchableOpacity>
                )

                if (open[subKey]) {
                    if (hasChildren) {
                        for (let j = i + 1; j < data.length; j++) {
                            const child = data[j]
                            if (child[0] || child[1]) break
                            output.push(
                                <View key={`sub2-child-${j}`} style={styles.cardSub2}>
                                    <Text style={styles.label}>{child[2]}</Text>
                                    <View style={styles.sub2Values}>
                                        {header.slice(3).map((h, idx) => (
                                            <View key={`${h}-${j}`} style={styles.valueRow}>
                                                <Text style={styles.sub2Label}>{h}</Text>
                                                <Text style={styles.sub2Val}>{formatValue(child[3 + idx])}</Text>
                                            </View>
                                        ))}
                                    </View>
                                </View>
                            )
                        }
                    } else if (hasMulti) {
                        output.push(
                            <View key={`sub2-nokid-${i}`} style={styles.cardSub2}>
                                {header.slice(3).map((h, idx) => (
                                    <View key={`h-${h}-${i}`} style={styles.valueRow}>
                                        <Text style={styles.sub2Label}>{h}</Text>
                                        <Text style={styles.sub2Val}>{formatValue(values[idx])}</Text>
                                    </View>
                                ))}
                            </View>
                        )
                    }
                }
            }

            else if (level3) {
                const subKey = `${currentCat}-${currentSub}`
                if (open[subKey]) {
                    output.push(
                        <View key={`sub2-direct-${i}`} style={styles.cardSub2}>
                            <Text style={styles.label}>{level3}</Text>
                            <View style={styles.sub2Values}>
                                {header.slice(3).map((h, idx) => (
                                    <View key={`${h}-${i}`} style={styles.valueRow}>
                                        <Text style={styles.sub2Label}>{h}</Text>
                                        <Text style={styles.sub2Val}>{formatValue(row[3 + idx])}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )
                }
            }
        }

        return output
    }

    return <ScrollView contentContainerStyle={styles.container}>{renderRows(data)}</ScrollView>
}

const styles = StyleSheet.create({
    container: { padding: 16 },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#fff",
        marginTop: 12,
        marginBottom: 4,
    },
    cardSub: {
        backgroundColor: "#eee",
        padding: 10,
        marginBottom: 8,
        borderRadius: 6,
        marginLeft: 4,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    cardSub2: {
        backgroundColor: "#cce5cc",
        padding: 10,
        marginBottom: 6,
        borderRadius: 5,
        marginLeft: 24,
    },
    label: {
        fontSize: 14,
        color: "#000",
        fontWeight: "600",
    },
    value: {
        fontSize: 14,
        color: "#000",
        fontWeight: "700",
    },
    sub2Values: { marginTop: 6 },
    valueRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 4,
    },
    sub2Label: { fontSize: 13, color: "#333" },
    sub2Val: { fontSize: 13, color: "#000", fontWeight: "600" },
    cardTotal: {
        backgroundColor: "#2BA787",
    },
})
