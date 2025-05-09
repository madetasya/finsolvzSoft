import React, { useState } from "react"
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
} from "react-native"
import { Dimensions } from "react-native"
const windowWidth = Dimensions.get("window").width


interface BSPLTableProps {
    headers: string[]
    data: (string | number | null | undefined)[][]
    selectedYears: string[]
    labelColumnCount: number
}

const BSPLTable: React.FC<BSPLTableProps> = ({ headers, data, selectedYears, labelColumnCount }) => {
    const [openKeys, setOpenKeys] = useState<string[]>([])
    const containerWidth = Dimensions.get("window").width * 0.96
    const labelWidth = Math.max(windowWidth * 0.32, 160)

    const valueHeaders = headers.filter(
        (h) => !h.toLowerCase().includes("category") && selectedYears.includes(h)
    )

    const isSingle = valueHeaders.length === 1
    const valueColWidth = isSingle
        ? containerWidth - labelWidth - 12
        : Math.max(windowWidth * 0.24, 100)

    const totalTableWidth = labelWidth + valueColWidth * valueHeaders.length

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
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={true}
                            keyboardShouldPersistTaps="handled"
                            scrollEnabled={true}
                            nestedScrollEnabled={true}
                            contentContainerStyle={{ minWidth: 200 }} 
                            style={{ maxWidth: Math.max(windowWidth * 0.50, 160) }}
                            scrollEventThrottle={16}
                        >
                            <Text
                                style={[styles.labelText]}
                                numberOfLines={1}
                            >
                                {showArrow ? (openKeys.includes(key) ? "▼ " : "▶ ") : ""}
                                {l1}
                            </Text>
                        </ScrollView>
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
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={true}
                            scrollEnabled={true}
                            nestedScrollEnabled={true}
                            contentContainerStyle={{ minWidth: 200 }}
                            style={{ flexGrow: 1 }}
                        >
                            <Text style={styles.labelText} numberOfLines={1}>
                                {labelText}
                            </Text>
                        </ScrollView>
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
        <View style={styles.wrapper}>
            <View style={styles.table}>
                <View style={styles.labelColumn}>
                    <View style={styles.labelCell}>
                        <View style={{ minWidth: 160 }}>
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={true}
                                style={{ maxWidth: 160 }}
                                contentContainerStyle={{
                                    paddingRight: 12, 
                                }}
                            >
                                <Text style={styles.headerText}></Text>
                            </ScrollView>
                        </View>
                    </View>
                    {renderLabelRows()}
                </View>

                <View style={{ flex: 1 }}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={true}
                        scrollEnabled={true}
                        nestedScrollEnabled={true}
                        contentContainerStyle={{ minHeight: 300 }}
                    >
                    <View>
                        <View style={styles.valueRow}>
                            {valueHeaders.map((h, idx) => (
                                <View
                                    key={idx}
                                    style={{
                                        width: valueColWidth,
                                        paddingVertical: 12,
                                    
                                        justifyContent: "center",
                                        alignItems: "center",
                                    }}
                                >
                                    <Text style={styles.valueText}>{h}</Text>

                                </View>

                            ))}
                        </View>
                        {renderValueRows()}
                    </View>
                </ScrollView>
            </View>
            </View>
        </View>
    )
}

function formatValue(val: any) {
    if (val === "" || val === null || val === undefined) return ""

    const stringValue = val.toString().replace(",", ".") 
    const num = Number(stringValue)

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
        marginHorizontal: 32,
        width: "96%",
        marginRight: 32,
    },
    table: {
        flexDirection: "row",
        alignItems: "center",
        alignSelf: "center",
        backgroundColor: "#fff",
        borderRadius: 8,
        overflow: 'hidden',

    },
    labelColumn: {
        flexShrink: 0,
        backgroundColor: "#fff"
    },
    labelCell: {
        borderBottomColor: "#eee",
        borderBottomWidth: 0.5,
        padding: 12,
        paddingRight: 4,
        minWidth: Math.max(windowWidth * 0.48, 160),
        maxWidth: Math.max(windowWidth * 0.48, 160),
        flexGrow: 1 
    },

    labelText: {
        fontWeight: "bold",
        color: "#333",

        paddingRight: 24,
    },
    headerText: {
        fontWeight: "bold",
        color: "#0A6067"
    },
    valueRow: {
        flexDirection: "row",
        borderBottomColor: "#eee",
        borderBottomWidth: 0.5,
        paddingRight: 20,
        paddingLeft: 1,
        alignItems: "center",
        justifyContent: "center",
        minWidth: 50
    },
    valueCell: {
        minWidth: Math.max(windowWidth * 0.24, 100),
        paddingVertical: 12,
        paddingHorizontal: 16,
        justifyContent: "center",
        alignItems: "center",
    },
    valueText: {
        fontSize: 14,
        color: "#222"
    },
    totalRow: {
        backgroundColor: "#8EB8B8"
    },
    profitRow: {
        backgroundColor: "#8EB8B8"

    }
})

export default BSPLTable
