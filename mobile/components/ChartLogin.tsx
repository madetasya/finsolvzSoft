import React, { useEffect, useRef, useState } from "react";
import { View, ScrollView, StyleSheet, Dimensions } from "react-native";
import Svg, { Rect, Defs, LinearGradient, Stop } from "react-native-svg";

const { width: screenWidth } = Dimensions.get("window");

interface Bar {
  id: number;
  height: number;
  direction: number;
}

const chartWidth = 16;
const spacing = 20; 
const intervalSpeed = chartWidth + spacing; 

const generateBars = (): Bar[] => {
  const bars: Bar[] = [];
  for (let i = 0; i < 20; i++) {
    bars.push({
      id: i,
      height: Math.floor(Math.random() * 200) + 50, 
      direction: Math.random() > 0.5 ? 1 : -1,
    });
  }
  return bars;
};

const InfiniteScrollingChart: React.FC = () => {
  const [bars, setBars] = useState<Bar[]>(generateBars());
  const scrollViewRef = useRef<ScrollView>(null);
  const positionX = useRef(0);

  useEffect(() => {
    const scrollContainer = scrollViewRef.current;
    let interval: NodeJS.Timeout;

    //ROLLING BAR
    if (scrollContainer) {
      interval = setInterval(() => {
        positionX.current += 0.3; 
        scrollContainer.scrollTo({ x: positionX.current, animated: false });

        if (positionX.current >= bars.length * intervalSpeed) {
          positionX.current = 9;
        }
    // BAR HEIGHT
        setBars((prevBars) =>
          prevBars.map((bar) => {
            let newHeight = bar.height + bar.direction * 0.3;
            if (newHeight > 250 || newHeight < 50) {
              bar.direction *= -1;
            }
            return { ...bar, height: newHeight };
          })
        );
      }, 16); 
    }

    return () => {
      clearInterval(interval); 
    };
  }, [bars]);

  const extendedBars = [...bars, ...bars];

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        bounces={false}
        scrollEnabled={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Svg height="250" width={extendedBars.length * intervalSpeed}>
          {extendedBars.map((bar, index) => (
            <Rect
              key={index}
              x={index * intervalSpeed}
              y={250 - bar.height}
              width={chartWidth}
              height={bar.height}
              fill="url(#grad)"
              rx={2}
            />
          ))}
          <Defs>
            <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">

              <Stop offset="1" stopColor="#6fb591" stopOpacity="-1" />
              <Stop offset="2" stopColor="#000000" stopOpacity="-1" />
            </LinearGradient>
          </Defs>
        </Svg>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  scrollContent: {
    alignItems: "center",
    paddingHorizontal: screenWidth / 10, 
  },
});

export default InfiniteScrollingChart;
