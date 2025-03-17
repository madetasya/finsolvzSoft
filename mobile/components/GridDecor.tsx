import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

const GridDecoration: React.FC = () => {
  const rows = 30; 
  const columns = 10; 

  const renderGrid = () => {
    const gridItems = [];
    for (let i = 0; i < rows * columns; i++) {   
      gridItems.push(<View key={i} style={styles.gridCell} />
        
      );
    }
    return gridItems;
  };

  return <View style={styles.gridContainer}>{renderGrid()}</View>;
};

const styles = StyleSheet.create({
  gridContainer: {
    position: "absolute",
    top: -40,
    left: 0,
    width: width,
    height: height,
    flexDirection: "row",
    flexWrap: "wrap",
    opacity: 0.1,
  },
  gridCell: {
    width: width / 10,
    height: height / 20,
    borderWidth: 0.5,
    borderColor: "#2d5852",
    backgroundColor: "transparent",
  },
});

export default GridDecoration;
