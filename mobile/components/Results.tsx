import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { RootStackParamList } from "../types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const { width } = Dimensions.get("window");

interface ResultsPageProps {
  selectedCompany: string | null;
  reportType: string | null;
}

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const ResultsPage: React.FC<ResultsPageProps> = ({ selectedCompany }) => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchReports = async () => {
    if (!selectedCompany) return;

    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        console.error("No user token found");
        return;
      }

      const response = await axios.get(`${API_URL}/reports/company/${selectedCompany}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setReports(response.data);
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [selectedCompany]);

  return (
    <View style={styles.container}>
      {/* Heeader */}
      <View style={styles.header}>
        <Text style={styles.resultsText}>Reports</Text>
      </View>

      {/* Loading*/}
      {loading && <ActivityIndicator size="large" color="#6c918b" />}

      {/* Result List */}
      <FlatList
        data={reports}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.resultCard}
            onPress={() =>
              navigation.navigate(
                item.reportType?.name === "Revenue" ? "Revenue" : "BSPL",
                { reportId: item._id }
              )
            }


          >
            <View style={styles.resultContent}>
              <Text style={styles.resultTitle}>{item.reportName}</Text>
              <Text style={styles.resultSubtitle}>{item.reportType?.name || "Unknown Type"}</Text>
              <Text style={styles.resultDate}>{item.year}</Text>
              <Text style={styles.resultDate}>{new Date(item.updatedAt).toLocaleDateString()}</Text>
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.resultList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    marginTop: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  resultsText: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "bold",
  },
  resultList: {
    paddingBottom: 20,
  },
  resultCard: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  resultContent: {
    flex: 1,
  },
  resultTitle: {
    color: "#253d3d",
    fontSize: 18,
    fontWeight: "bold",
  },
  resultSubtitle: {
    color: "#6c918b",
    fontSize: 14,
    marginTop: 4,
  },
  resultDate: {
    color: "#6c918b",
    fontSize: 12,
    marginTop: 4,
  },
});

export default ResultsPage;
