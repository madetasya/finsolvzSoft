import React, { JSX } from "react"
import { View, Text, TouchableOpacity, StyleSheet } from "react-native"

export default function BSPLCategoryColumn({
    data,
    openKeys,
    onToggle,
}: {
    data: (string | number | null | undefined)[][];
    openKeys: string[];
    onToggle: (key: string) => void;
}) {
    const rendered: JSX.Element[] = []

    let currentCategory = ""
    let currentKey = ""

    for (let i = 0; i < data.length; i++) {
        const [l1, l2, l3] = data[i]

        if (l1 && !l2) {
            currentCategory = l1 as string
            currentKey = currentCategory

            rendered.push(
                <TouchableOpacity
                    key={`cat-${i}`}
                    onPress={() => onToggle(currentKey)}
                    style={styles.labelCell}
                >
                    <Text style={styles.labelText}>
                        {openKeys.includes(currentKey) ? "▼ " : "▶ "} {currentCategory}
                    </Text>
                </TouchableOpacity>
            )
        }

        if (l2 && !l3 && openKeys.includes(currentKey)) {
            rendered.push(
                <View key={`sub1-${i}`} style={[styles.labelCell, { paddingLeft: 12 }]}>
                    <Text style={styles.labelText}>{l2}</Text>
                </View>
            )
        }

        if (l3 && openKeys.includes(currentKey)) {
            rendered.push(
                <View key={`sub2-${i}`} style={[styles.labelCell, { paddingLeft: 24 }]}>
                    <Text style={styles.labelText}>{l3}</Text>
                </View>
            )
        }
    }

    return (
        <View style={styles.col}>
            <Text style={styles.header}>Kategori</Text>
            {rendered}
        </View>
    )
}

const styles = StyleSheet.create({
    col: { width: 200, backgroundColor: "#fff" },
    header: {
        fontWeight: "bold",
        color: "#0A6067",
        textAlign: "center",
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#0A6067",
    },
    labelCell: {
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
        paddingVertical: 12,
        paddingHorizontal: 8,
    },
    labelText: {
        fontWeight: "bold",
        color: "#333",
    },
})
