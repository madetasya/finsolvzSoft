import React, { useState } from "react"
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
} from "react-native"


interface BSPLTableProps {
    headers: string[]
    data: (string | number | null | undefined)[][]
    selectedYears: string[]
    labelColumnCount: number
}

const BSPLTable: React.FC<BSPLTableProps> = ({ headers, data, selectedYears, labelColumnCount }) => {
    const [openKeys, setOpenKeys] = useState<string[]>([])

    const valueHeaders = headers.filter(
        (h) => !h.toLowerCase().includes("category") && selectedYears.includes(h)
    )

    const toggle = (key: string) => {
        if (openKeys.includes(key)) {
            setOpenKeys(openKeys.filter((x) => x !== key))
        } else {
            setOpenKeys([...openKeys, key])
        }
    }

    const isTotalRow = (text: string | undefined | null) => {
        if (!text) return false
        const lower = text.toString().toLowerCase()
        return lower.includes("jumlah") || lower.includes("total")
    }

    const isProfitRow = (text: string | undefined | null) => {
        if (!text) return false
        const lower = text.toString().toLowerCase()
        return lower.includes("laba") || lower.includes("profit")
    }

    const renderLabelRows = () => {
        let currentKey = ""
        return data.map((row, i) => {
            const labelCols = row.slice(0, labelColumnCount)
            const [l1, l2, l3] = labelCols
            const isParent = l1 && !l2
            const key = isParent ? (l1 as string) : currentKey
            if (isParent) currentKey = key

            const labelText = labelCols.reverse().find((x) => x)

            const showArrow =
                isParent &&
                !isTotalRow(labelText?.toString()) &&
                labelColumnCount > 1

            const paddingLeft =
                labelCols[labelColumnCount - 1] ? 16 :
                    labelCols[labelColumnCount - 2] ? 24 :
                        labelCols[labelColumnCount - 3] ? 32 : 0

            const labelStyle = [
                styles.labelCell,
                isTotalRow(labelText?.toString()) && styles.totalRow,
                isProfitRow(labelText?.toString()) && styles.profitRow,
                { paddingLeft }
            ]

            if (isParent) {
                return (
                    <TouchableOpacity
                        key={`label-${i}`}
                        style={labelStyle}
                        onPress={() => {
                            if (showArrow) toggle(key)
                        }}
                        activeOpacity={showArrow ? 0.6 : 1}
                    >
                        <View >    
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={true}
                                scrollEnabled={true}
                                style={{ maxWidth: 180 }}
                                
                            >
                                <Text style={styles.labelText}>
                                    {showArrow ? (openKeys.includes(key) ? "▼ " : "▶ ") : ""}
                                    {l1}
                                </Text>
                            </ScrollView>
                        </View>
                    </TouchableOpacity>

                )
            }

            if ((l2 || l3 || labelCols.length > 1) && openKeys.includes(key)) {
                const labelText = labelCols.reverse().find((x) => x)
                return (
                    <View
                        key={`label-${i}`}
                        style={[
                            styles.labelCell,
                            { paddingLeft },
                            isTotalRow(labelText?.toString()) && styles.totalRow,
                            isProfitRow(labelText?.toString()) && styles.profitRow,
                        ]}
                    >
                        <View style={{ minWidth: 160 }}>
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={true}
                                style={{ minWidth: 160 }}
                                scrollEnabled={true}
                            >
                                <Text style={styles.labelText}>
                                    {labelText}
                                </Text>
                            </ScrollView>
                        </View>

                    </View>
                )
            }

            return null
        })
    }

    const renderValueRows = () => {
        let currentKey = ""
        return data.map((row, i) => {
            const labelCols = row.slice(0, labelColumnCount)
            const [l1, l2, l3] = labelCols
            const isParent = l1 && !l2
            const key = isParent ? (l1 as string) : currentKey
            if (isParent) currentKey = key

            const labelText = labelCols.reverse().find((x) => x)
            const isTotal = isTotalRow(labelText?.toString())
            const isProfit = isProfitRow(labelText?.toString())

            if (isParent || ((l2 || l3 || labelCols.length > 1) && openKeys.includes(key))) {
                return (
                    <View
                        key={`value-${i}`}
                        style={[
                            styles.valueRow,
                            isTotal && styles.totalRow,
                            isProfit && styles.profitRow,
                            { flex: 1 }
                        ]}
                    >
                        {valueHeaders.map((year, idx) => {
                            const indexInHeader = headers.indexOf(year)
                            const value = row[indexInHeader]
                            return (
                                <View
                                    key={idx}
                                    style={{
                                        flex: 1,
                                        padding: 12,
                                        alignItems: "center",
                                        justifyContent: "center"
                                    }}
                                >
                                    <Text style={styles.valueText}>{formatValue(value)}</Text>
                                </View>
                            )
                        })}
                    </View>
                )
            }

            return null
        })
    }

    return (
        <View style={[styles.wrapper, { width: 182 + valueHeaders.length * 168 }]}>
            <View style={[styles.table, { width: 182 + valueHeaders.length * 108 }]}>
                <View style={styles.labelColumn}>
                    <View style={styles.labelCell}>
                        <View style={{ minWidth: 160 }}>
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={true}
                                style={{ maxWidth: 160 }}
                            >
                                <Text style={styles.headerText}></Text>
                            </ScrollView>
                        </View>
                    </View>
                    {renderLabelRows()}
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={true}>
                    <View>
                        <View style={styles.valueRow}>
                            {valueHeaders.map((h, idx) => (
                                <View key={idx} style={styles.valueCell}>
                                    <Text style={styles.headerText}>{h}</Text>
                                </View>
                            ))}
                        </View>
                        {renderValueRows()}
                    </View>
                </ScrollView>
            </View>
        </View>
    )
}

function formatValue(val: any) {
    if (val === "" || val === null || val === undefined) return ""
    const num = Number(val)
    if (!isNaN(num)) {
        if (num < 0) return `(${Math.abs(num).toFixed(2)})`
        return num.toFixed(2)
    }
    return ""
}

const styles = StyleSheet.create({
    wrapper: {
        marginTop: 16,
        alignItems: "center",
        justifyContent: "center",
        alignSelf: "center",
        paddingHorizontal: 34,
    },
    table: {
        flexDirection: "row",
        alignItems: "center",
        alignSelf: "center",
        backgroundColor: "#fff",
    
    },
    labelColumn: {
        flexShrink: 0,
        backgroundColor: "#fff"
    },
    labelCell: {
        borderBottomColor: "#eee",
        borderBottomWidth: 1,
        padding: 12,
        paddingRight: 8,
    },
    labelText: {
        fontWeight: "bold",
        color: "#333",
        paddingLeft: 36,
        paddingRight: 24,
    },
    headerText: {
        fontWeight: "bold",
        color: "#0A6067"
    },
    valueRow: {
        flexDirection: "row",
        borderBottomColor: "#eee",
        borderBottomWidth: 1,
        paddingRight: 20,
        paddingLeft: 1,
        alignItems: "center",
        justifyContent: "center",
        minWidth: 50
    },
    valueCell: {
        minWidth: 50,
        paddingVertical: 12,
        paddingHorizontal: 36,
        justifyContent: "center"
    },
    valueText: {
        fontSize: 14,
        color: "#222"
    },
    totalRow: {
        backgroundColor: "#8EB8B8"
    },
    profitRow: {
        backgroundColor: "#A0D6D6"
    }
})

export default BSPLTable
