import React, { useState } from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import PeriodicDropdown from "./PeriodicDropdown";
import BarChartComponent from "./BarChartComponent";
import PieChartComponent from "./PieChartComponent";

interface RevenueTableProps {
    monthData: Record<string, any[]>;
    categories: string[];
    hideChart?: boolean;
}

const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

const quarters = {
    Q1: ["January", "February", "March"],
    Q2: ["April", "May", "June"],
    Q3: ["July", "August", "September"],
    Q4: ["October", "November", "December"],
};
const RevenueTable: React.FC<RevenueTableProps> = ({ monthData, categories, hideChart = false }) => {
    const [chartType, setChartType] = useState<"bar" | "pie">("bar");
    const [selectedFilter, setSelectedFilter] = useState("Full Year");
    const [selectedDetail, setSelectedDetail] = useState("");
    const displayedMonths = selectedFilter === "Full Year"
        ? months
        : selectedFilter === "Quartal" && selectedDetail
            ? quarters[selectedDetail as keyof typeof quarters]
            : selectedFilter === "Month" && selectedDetail
                ? [selectedDetail]
                : months;
    const chartData = categories.map((category, index) => ({
        name: category,
        values: displayedMonths.map((month) => {
            const values = monthData[month] || [];
            const rawData = values[index] as { value?: { $numberDecimal?: string } } | number;
            return typeof rawData === "object" && rawData !== null
                ? parseFloat(rawData.value?.$numberDecimal || "0")
                : (rawData as number);
        })
    }));

    const yearlyData = categories.map((category, index) => {
        const total = months.reduce((sum, month) => {
            const values = monthData[month] || [];
            const rawData = values[index] as { value?: { $numberDecimal?: string } } | number;
            const categoryValue =
                typeof rawData === "object" && rawData !== null
                    ? parseFloat(rawData.value?.$numberDecimal || "0")
                    : (rawData as number);
            return sum + categoryValue;
        }, 0);
        return { name: category, value: total };
    });

    return (
        <View style={styles.container}>

            {/* Bar Chart */}
            {!hideChart && (
                <View style={styles.chartToggleContainer}>
                    <TouchableOpacity
                        style={[styles.chartToggleButton, chartType === "bar" && styles.activeButton]}
                        onPress={() => setChartType("bar")}
                    >
                        <Text style={[styles.chartToggleText, chartType === "bar" && styles.activeText]}>Bar Chart</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.chartToggleButton, chartType === "pie" && styles.activeButton]}
                        onPress={() => setChartType("pie")}
                    >
                        <Text style={[styles.chartToggleText, chartType === "pie" && styles.activeText]}>Pie Chart</Text>
                    </TouchableOpacity>
                </View>
            )}

            {!hideChart && (
                chartType === "bar" ? (
                    <BarChartComponent
                        data={categories.map((category, index) => ({
                            name: category,
                            values: months.map((month) => {
                                const values = monthData[month] || [];
                                const rawData = values[index] as { value?: { $numberDecimal?: string } } | number;
                                return typeof rawData === "object" && rawData !== null
                                    ? parseFloat(rawData.value?.$numberDecimal || "0")
                                    : (rawData as number);
                            })
                        }))}
                        months={months}
                        categories={categories}
                    />
                ) : (
                    <PieChartComponent data={yearlyData} />
                )
            )}

            {/* Dropdown Filter */}
            <View style={styles.filterContainer}>
                <PeriodicDropdown
                    label="Pilih Periode"
                    data={["Full Year", "Quartal", "Month"]}
                    selectedValue={selectedFilter}
                    onSelect={(value) => {
                        setSelectedFilter(value);
                        setSelectedDetail("");
                    }}
                />

                {selectedFilter !== "Full Year" && (
                    <PeriodicDropdown
                        label="Choose Filter"
                        data={selectedFilter === "Quartal" ? Object.keys(quarters) : months}
                        selectedValue={selectedDetail}
                        onSelect={setSelectedDetail}
                        isSecondDropdown
                    />
                )}
            </View>

            <View style={styles.tableWrapper}>
                {/* Sticky Kategori */}
                <View style={styles.stickyColumn}>
                    <Text style={[styles.categorySticky]}></Text>
                    {categories.map((category, index) => (
                        <Text key={index} style={[styles.cell, styles.categorySticky]}>{category}</Text>
                    ))}
                    <Text style={[styles.cell, styles.categorySticky, styles.totalCategory]}>Total</Text>
                </View>

                {/* Scroll Horizontal */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View>
                        {/*  Header */}
                        <View style={styles.row}>
                            {displayedMonths.map((month) => (
                                <Text
                                    key={month}
                                    style={[
                                        styles.headerCell,
                                        styles.monthCell,
                                        { minWidth: displayedMonths.length === 1 ? 120 : 85 }
                                    ]}
                                >
                                    {month}
                                </Text>
                            ))}
                            {/* TOTAL */}
                            <Text
                                style={[
                                    styles.headerCell,
                                    styles.totalColumn,
                                    { minWidth: displayedMonths.length === 1 ? 170 : 85 }
                                ]}
                            >
                                Total
                            </Text>
                        </View>

                        {/* Data Table */}
                        {categories.map((category, index) => (
                            <View key={category} style={styles.row}>
                                {displayedMonths.map((month) => {
                                    const values = monthData[month] || [];
                                    const rawData = values[index] as { value?: { $numberDecimal?: string } } | number;
                                    const categoryValue =
                                        typeof rawData === "object" && rawData !== null
                                            ? parseFloat(rawData.value?.$numberDecimal || "0")
                                            : (rawData as number);

                                    return (
                                        <Text
                                            key={`${category}-${month}`}
                                            style={[
                                                styles.cell,
                                                { minWidth: displayedMonths.length === 1 ? 120 : 85 }
                                            ]}
                                        >
                                            {categoryValue.toFixed(2)}
                                        </Text>
                                    );
                                })}
                                {/* Total Kategori */}
                                <Text
                                    style={[
                                        styles.cell,
                                        styles.totalColumn,
                                        { minWidth: displayedMonths.length === 1 ? 170 : 85 }
                                    ]}
                                >
                                    {displayedMonths.reduce((sum, month) => {
                                        const values = monthData[month] || [];
                                        const rawData = values[index] as { value?: { $numberDecimal?: string } } | number;
                                        const categoryValue =
                                            typeof rawData === "object" && rawData !== null
                                                ? parseFloat(rawData.value?.$numberDecimal || "0")
                                                : (rawData as number);
                                        return sum + categoryValue;
                                    }, 0).toFixed(2)}
                                </Text>
                            </View>
                        ))}

                        {/* Row Total Bulan */}
                        <View style={styles.row}>
                            {displayedMonths.map((month) => (
                                <Text
                                    key={month}
                                    style={[
                                        styles.cell,
                                        styles.totalRow,
                                        { minWidth: displayedMonths.length === 1 ? 120 : 85 }
                                    ]}
                                >
                                    {categories.reduce((sum, _, index) => {
                                        const values = monthData[month] || [];
                                        const rawData = values[index] as { value?: { $numberDecimal?: string } } | number;
                                        const categoryValue =
                                            typeof rawData === "object" && rawData !== null
                                                ? parseFloat(rawData.value?.$numberDecimal || "0")
                                                : (rawData as number);
                                        return sum + categoryValue;
                                    }, 0).toFixed(2)}
                                </Text>
                            ))}
                            {/* Total Keseluruhan */}
                            <Text
                                style={[
                                    styles.cell,
                                    styles.grandTotalColumn,
                                    { minWidth: displayedMonths.length === 1 ? 170 : 85 }
                                ]}
                            >
                                {displayedMonths.reduce((sumMonth, month) =>
                                    sumMonth + categories.reduce((sumCat, _, index) => {
                                        const values = monthData[month] || [];
                                        const rawData = values[index] as { value?: { $numberDecimal?: string } } | number;
                                        const categoryValue =
                                            typeof rawData === "object" && rawData !== null
                                                ? parseFloat(rawData.value?.$numberDecimal || "0")
                                                : (rawData as number);
                                        return sumCat + categoryValue;
                                    }, 0)
                                    , 0).toFixed(2)}
                            </Text>
                        </View>
                    </View>
                </ScrollView>
            </View>
        </View>
    );

};
const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        paddingTop: 24,
    },
    filterContainer: {
        flexDirection: "row",
        justifyContent: "flex-start",
        gap: 8,
        paddingBottom: 16
    },
    tableWrapper: {
        flexDirection: "row",
        backgroundColor: "#F6F4F0",
        borderRadius: 10,
        overflow: "hidden",
    },
    stickyColumn: {
        backgroundColor: "#F6F4F0",

    },
    categorySticky: {
        position: "relative",
        left: 0,
        fontWeight: "bold",
        textAlign: "left",
        minWidth: 100,
        paddingVertical: 20,
        backgroundColor: "#F6F4F0",
        paddingLeft: 12,

    },
    headerCell: {
        color: "#F6F4F0",
        fontWeight: "bold",
        textAlign: "center",
        paddingVertical: 12,
        minWidth: 85,
        borderBottomWidth: 1,
        borderColor: "#0A6067",
    },
    monthCell: {
        color: "#008D92",
        fontWeight: "bold",
        textAlign: "center",
        paddingVertical: 10,
        minWidth: 85, // Default width
    },
    totalCategory: {
        color: "#008D92",
        fontWeight: "bold",
    },
    totalColumn: {
        fontWeight: "bold",
        color: "#008D92",
        textAlign: "center",
        paddingVertical: 10,
        minWidth: 85, // Default width
    },
    totalRow: {
        fontWeight: "bold",
        color: "#008D92",
        textAlign: "center",
        paddingVertical: 10,
        minWidth: 85, // Default width
    },
    grandTotalColumn: {
        fontWeight: "bold",
        color: "#0A6067",
        textAlign: "center",
        paddingVertical: 10,
        minWidth: 85, // Default width
    },
    row: {
        flexDirection: "row",
        paddingVertical: 10,
    },
    cell: {
        textAlign: "center",
        paddingVertical: 10,
        minWidth: 85,
    },
    legendContainer: {
        flexDirection: "row",
        justifyContent: "center",
        flexWrap: "wrap",
        marginVertical: 10,
        gap: 8,
    },
    legendItem: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "#ccc",
        backgroundColor: "white",
        alignItems: "center",
    },
    activeLegend: {
        backgroundColor: "#008D92",
        borderColor: "#008D92",
    },
    fullLegend: {
        backgroundColor: "#0A6067",
        borderColor: "#0A6067",
    },

    chartToggleContainer: {
        flexDirection: "row",
        justifyContent: "center",
        marginBottom: 10,
    },
    chartToggleButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "#008D92",
        marginHorizontal: 5,
    },
    activeButton: {
        backgroundColor: "#008D92",
    },
    chartToggleText: {
        color: "#008D92",
        fontWeight: "bold",
    },
    activeText: {
        color: "#FFF",
    },
});

export default RevenueTable;
