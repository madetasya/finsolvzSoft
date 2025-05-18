import React, { useState, useEffect } from "react";
import { View, ScrollView, TouchableOpacity, Text, Dimensions, StyleSheet } from "react-native";
import Svg, { Rect, G, Text as SvgText } from "react-native-svg";

interface ChartData {
  name: string;
  values: number[];
}

interface BarChartProps {
  data: ChartData[];
  months: string[];
  categories: string[];
  hideLegend?: boolean; 
}

const defaultColors = ["#FF6384", "#61a5c2", "#FFCE56", "#4CAF50", "#FF9800", "#9C27B0", "#3F51B5"];

const generateColor = (index: number) => defaultColors[index % defaultColors.length];
const BarChartComponent: React.FC<BarChartProps> = ({ data, months, categories, hideLegend }) => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>(categories);

  useEffect(() => {
    setSelectedCategories(categories);
  }, [categories]);

  const screenWidth = Dimensions.get("window").width;
  const barWidth = 24;
  const barSpacing = 8;
  let monthSpacing;
  if (selectedCategories.length > 0) {
    monthSpacing = 42;
  } else {
    monthSpacing = 80;
  }

  const maxValue = Math.max(...data.flatMap(d => d.values));

  const categoryColors: Record<string, string> = {};
  categories.forEach((category, index) => {
    categoryColors[category] = generateColor(index);
  });

  const filteredChartData = data.filter(d => selectedCategories.includes(d.name));
  const totalChartWidth = months.length * (filteredChartData.length * (barWidth + barSpacing) + monthSpacing) + (selectedCategories.length > 0 ? 88 : 96);


  const toggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };
  useEffect(() => {
    // console.log("📊 BarChartComponent - Data yang diterima:", JSON.stringify(data, null, 2));
  }, [data]);


  return (
    <View>
      {/* Chart */}
      <ScrollView horizontal>
        <Svg width={Math.max(screenWidth, totalChartWidth)} height={360}>
          {months.map((month, monthIndex) => (
            <G key={monthIndex} x={monthIndex * (filteredChartData.length * (barWidth + barSpacing) + monthSpacing) + 42}>
             
             
              {/* MonthS */}
              <SvgText x={(filteredChartData.length * (barWidth + barSpacing)) / 2} y={275} fontSize={12} textAnchor="middle" fill="#FFFFFF" fontFamily="UbuntuBold">
                {month}
              </SvgText>


              {filteredChartData.map((company, companyIndex) => {
                const value = company.values[monthIndex] || 0
                const height = (value / maxValue) * 200;
                return (
                  <G key={companyIndex}>
                    <Rect
                      x={companyIndex * (barWidth + barSpacing)}
                      y={250 - height}
                      width={barWidth}
                      height={height}
                      fill={categoryColors[company.name]}
                    />
                    <SvgText
                      x={companyIndex * (barWidth + barSpacing) + barWidth / 2}
                      y={250 - height - 5}
                      fontSize={8}
                      textAnchor="middle"
                      fill="#FFFFFF"
                      fontFamily= "UbuntuRegular"
                    >
                      {value}
                    </SvgText>
                  </G>
                );
              })}
            </G>
          ))}
        </Svg>
      </ScrollView>
      {!hideLegend && (<View style={[styles.legendContainer, { marginTop: -42 }]}>
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.legendItem,
              {
                borderColor: categoryColors[category],
                backgroundColor: selectedCategories.includes(category) ? categoryColors[category] : "transparent"
              }
            ]}
            onPress={() => toggleCategory(category)}
          >
            <Text style={[
              styles.legendText,
              { color: selectedCategories.includes(category) ? "#FFFFFF" : categoryColors[category] }
            ]}>
              {category}
            </Text>
          </TouchableOpacity>

        ))}
      </View>

)}

    </View>
  );
};

const styles = StyleSheet.create({
  legendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    paddingBottom: 42,
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
  legendText: {
    fontSize: 14,
    fontFamily: "UbuntuBold",
    color: "#333",
  },
});

export default BarChartComponent;
