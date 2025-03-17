import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import PeriodicDropdown from "./PeriodicDropdown";
import BarChartComponent from "./BarChartComponent";

type ChartData = {
    name: string;
    values: number[];
};

interface MonthDataType {
    [key: string]: number[];
}

type BSPLTableProps = {
    monthData: MonthDataType;
    categories: string[];
    hideChart?: boolean;
};
const BSPLTable: React.FC<BSPLTableProps> = ({ monthData, categories, hideChart = false }) => {

const transformMonthData = (data: MonthDataType, categories: string[]): ChartData[] => {
    return categories.map((category, index) => ({
        name: category,
        values: Object.keys(data).map((month) => data[month][index])
    }));
};

    const [selectedFilter, setSelectedFilter] = useState("Full Year");
    const [selectedDetail, setSelectedDetail] = useState("");
    const [expandedCategories, setExpandedCategories] = useState<{ [key: string]: boolean }>({});
const toggleExpand = (category: string) => {
    setExpandedCategories((prev) => ({
        ...prev,
        [category]: !prev[category]
    }));
    useEffect(() => {
        console.log("📊 BSPLTable - monthData:", JSON.stringify(monthData, null, 2));
        console.log("📊 BSPLTable - categories:", JSON.stringify(categories, null, 2));
    }, [monthData, categories]);

};

return (
    <View style={styles.container}>
        {!hideChart && (
            <BarChartComponent 
                data={transformMonthData(monthData, categories)} 
                months={Object.keys(monthData)} 
                categories={categories}
                hideLegend={true} 
            />
        )}

            <View style={styles.filterContainer}>
                <PeriodicDropdown
                    label="Pilih Periode"
                    data={["Full Year", "Quartal", "Month"]}
                    selectedValue={selectedFilter}
                    onSelect={setSelectedFilter}
                />
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View>
                    {/* Header */}
                    <View style={styles.row}>
                        <Text style={[styles.headerCell, styles.categorySticky]}>Kategori</Text>
                        {Object.keys(monthData).map((month) => (
                            <Text key={month} style={[styles.headerCell, styles.monthCell]}>{month}</Text>
                        ))}
                    </View>

                    {/* Data Table */}
                    {categories.map((category, index) => {
                        const uniqueKey = category ? category : `Unknown-${index}`;
                        return (
                            <View key={uniqueKey}>
                                <Text style={[styles.cell, styles.categorySticky]} onPress={() => toggleExpand(category)}>
                                    {expandedCategories[category] ? "▼ " : "▶ "} {category}
                                </Text>
                                {expandedCategories[category] && (
                                    <View style={styles.row}>
                                        <Text style={[styles.cell, styles.subcategory]}>{category}</Text>
                                        {Object.keys(monthData).map((month) => (
                                            <Text key={`${uniqueKey}-${month}`} style={styles.cell}>
                                                {monthData[month][categories.indexOf(category)]}
                                            </Text>
                                        ))}
                                    </View>
                                )}
                            </View>
                        );
                    })}

                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { padding: 10 },
    filterContainer: { flexDirection: "row", justifyContent: "flex-start", paddingBottom: 10 },
    row: { flexDirection: "row", alignItems: "center" },
    headerCell: { fontWeight: "bold", textAlign: "center", padding: 10, backgroundColor: "#008D92" },
    monthCell: { minWidth: 100, backgroundColor: "#008D92" },
    categorySticky: { minWidth: 150, fontWeight: "bold", backgroundColor: "#F6F4F0", paddingLeft: 10 },
    cell: { textAlign: "center", padding: 10, minWidth: 100 },
    subcategory: { paddingLeft: 20, fontSize: 12, color: "#666" }
});

export default BSPLTable;
