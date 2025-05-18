import React from "react"
import { View, Text, StyleSheet } from "react-native"

export default function BSPLValueTable({
    data,
    openKeys,
    headers,
}: {
    data: (string | number | null | undefined)[][]
    openKeys: string[]
    headers: string[]
}) {
    let currentKey = ""

    return (
        <>
            {data.map((row, i) => {
                const [l1, l2, l3, ...values] = row

                if (l1 && !l2) {
                    currentKey = l1 as string
                    return (
                        <View key={`cat-val-${i}`} style={styles.dataRow}>
                            <View style={[styles.cell, { minWidth: 200, alignItems: "flex-start" }]}>
                                <Text style={styles.text}>{l1}</Text>
                            </View>
                            {values.map((v: any, idx: number) => (
                                <View key={idx} style={styles.cell}>
                                    <Text style={styles.text}>{formatValue(v)}</Text>
                                </View>
                            ))}
                        </View>
                    )
                }

                if ((l2 || l3) && openKeys.includes(currentKey)) {
                    return (
                        <View key={`val-${i}`} style={styles.dataRow}>
                            <View style={[styles.cell, { minWidth: 200, alignItems: "flex-start" }]}>
                                <Text style={styles.text}>{l3 || l2}</Text>
                            </View>
                            {values.map((v: any, idx: number) => (
                                <View key={idx} style={styles.cell}>
                                    <Text style={styles.text}>{formatValue(v)}</Text>
                                </View>
                            ))}
                        </View>
                    )
                }

                return null
            })}
        </>
    )
}

function formatValue(v: any) {
    const num = Number(v)
    if (!isNaN(num)) return num.toFixed(2)
    return ""
}

const styles = StyleSheet.create({
    table: { backgroundColor: "#fff" },
    headerRow: {
        flexDirection: "row",
        borderBottomWidth: 1,
        borderBottomColor: "#0A6067",
    },
    cell: {
        minWidth: 100,
        padding: 12,
        justifyContent: "center",
        alignItems: "flex-end",
    },
    headerText: {
        fontWeight: "bold",
        color: "#0A6067",
    },
    dataRow: {
        flexDirection: "row",
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    text: { color: "#222", fontSize: 14 },
})
