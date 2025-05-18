import React from "react";
import { View, Text, Dimensions, StyleSheet } from "react-native";
import Svg, { Path, G, Text as SvgText } from "react-native-svg";

interface ChartData {
  name: string;
  value: number;
}

interface PieChartProps {
  data: ChartData[];
}

const defaultColors = ["#FF6384", "#61a5c2", "#FFCE56", "#4CAF50", "#FF9800", "#9C27B0", "#3F51B5"];
const generateColor = (index: number) => defaultColors[index % defaultColors.length];

const PieChartComponent: React.FC<PieChartProps> = ({ data }) => {
  const screenWidth = Dimensions.get("window").width;
  const centerX = screenWidth / 2;
  const centerY = 140;
  const radius = 116;
  const textRadius = radius + 24; 

  const total = data.reduce((sum, category) => sum + category.value, 0);
  let startAngle = 0;

  return (
    <View>
      {/* Pie Chart */}
      <Svg width={screenWidth} height={280} viewBox={`0 0 ${screenWidth} 280`}>
        {data.map((category, index) => {
          const value = category.value;
          if (value === 0) return null;

          const angle = (value / total) * 360;
          const endAngle = startAngle + angle;
          const largeArc = angle > 180 ? 1 : 0;

          const midAngle = startAngle + angle / 2;
          const textX = centerX + textRadius * Math.cos((Math.PI * midAngle) / 180);
          const textY = centerY + textRadius * Math.sin((Math.PI * midAngle) / 180);

          const startX = centerX + radius * Math.cos((Math.PI * startAngle) / 180);
          const startY = centerY + radius * Math.sin((Math.PI * startAngle) / 180);
          const endX = centerX + radius * Math.cos((Math.PI * endAngle) / 180);
          const endY = centerY + radius * Math.sin((Math.PI * endAngle) / 180);

          const pathData = `
            M ${centerX} ${centerY}
            L ${startX} ${startY}
            A ${radius} ${radius} 0 ${largeArc} 1 ${endX} ${endY}
            Z
          `;

          startAngle = endAngle;

          return (
            <G key={index}>
              <Path d={pathData} fill={generateColor(index)} />
              {/* <SvgText
                x={textX}
                y={textY}
                 dx={textX > centerX ? 10 : -10}
                fill="#FFFFFF"
                fontSize="12"
                fontFamily="UbuntuRegular"
                textAnchor={textX > centerX ? "start" : "end"}
                alignmentBaseline="middle"
              >
                {((value / total) * 100).toFixed(1)}%
              </SvgText> */}
            </G>
          );
        })}
      </Svg>

      {/* Legend */}
      <View style={styles.legendContainer}>
        {data.map((category, index) => (
          <View key={index} style={styles.legendItem}>
            <View style={[styles.colorBox, { backgroundColor: generateColor(index) }]} />
            <Text style={styles.legendText}>
              {category.name} ({((category.value / total) * 100).toFixed(1)}%)
            </Text>

          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  legendContainer: {
    flexDirection: "row",
    justifyContent: "flex-start",
    flexWrap: "wrap",
    marginTop: 8,
    marginBottom: 16,
   
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 4,
    marginBottom: 4,
  },
  colorBox: {
    width: 16,
    height: 16,
    borderRadius: 4,
    marginRight: 8,
    marginBottom: 8
  },
  legendText: {
    fontSize: 14,
    color: "#FFFFFF",
    fontFamily: "UbuntuRegular",
  },
});

export default PieChartComponent;
