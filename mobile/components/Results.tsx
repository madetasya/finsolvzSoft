import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { RootStackParamList } from "../types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useTranslation } from "react-i18next";
import i18n from "../src/i18n";

const { width } = Dimensions.get("window");
interface ResultsPageProps {
  selectedCompany: string | null;
  reportType: string | null;
  onPressResult: () => void;
}



const API_URL = process.env.EXPO_PUBLIC_API_URL;

const ResultsPage: React.FC<ResultsPageProps> = ({ selectedCompany, reportType }) => {

  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();


  const fetchReports = async () => {
    if (!selectedCompany || !reportType) return;
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        Alert.alert("Oops", "Something went wrong, try again later.");
        return;
      }

      const response = await axios.get(`${API_URL}/reports/company/${selectedCompany}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setReports(response.data);
    } catch (error) {
      Alert.alert("Oops", "Something went wrong, try again later.");
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchReports();
  }, [selectedCompany, reportType]);

  // const filteredReports = reportType
  //   ? reports.filter((r) => reportType.includes(r.reportType?._id))
  //   : reports;
  const isMandarin = i18n.language === 'zh' || i18n.language === 'cn';
  const mandarinRegex = /资产负债表|利润表|收入/;

  const filteredReports = reports.filter((r) => {
    const typeMatch = reportType ? reportType.includes(r.reportType?._id) : true;
    const reportName = r.reportName || "";

    let titleMatch = true;

    if (isMandarin) {
      if (!mandarinRegex.test(reportName)) {
        titleMatch = false;
      }
    } else {
      if (mandarinRegex.test(reportName)) {
        titleMatch = false;
      }
    }

    return typeMatch && titleMatch;
  });



  if (!selectedCompany) {
    return null;
  }

  return (
    <View style={styles.container} >
      {/* Heeader */}
      <View style={styles.header}>
        <Text style={styles.resultsText}>{t("results.title")}</Text>

      </View>

      {/* Loading*/}
      {loading && <ActivityIndicator size="large" color="#6c918b" />}
      {!loading && filteredReports.length === 0 && (
        <Text style={{ color: "#fff", fontStyle: "italic", marginBottom: 8 }}>
          {t("results.noData")}
        </Text>
      )}


      {/* Result List */}
      <FlatList
        data={filteredReports}
        style={{ paddingTop: -8 }}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.resultCard}
            onPress={() => {
              if (item.reportType?.name === "Revenue") {
                navigation.navigate("Revenue", {
                  reportId: item._id,
                  selectedCompany,
                });
              } else {
                navigation.navigate("BSPLPage", {
                  reportId: item._id,
                  companyId: selectedCompany ?? undefined,
                  reportType: item.reportType?._id,
                });
              }
            }}

          >
            <View style={styles.resultContent}>
              <Text style={styles.resultTitle}>{item.reportName}</Text>
              {/* <Text style={styles.resultSubtitle}>{item.reportType?.name || "Unknown Type"}</Text>
              <Text style={styles.resultDate}>{item.year}</Text>
              <Text style={styles.resultDate}>{new Date(item.updatedAt).toLocaleDateString()}</Text> */}
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
    paddingBottom: 26,
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
    fontFamily: "UbuntuBold",
    marginTop: -8,
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
    fontFamily: "UbuntuBold",
  },
  resultSubtitle: {
    color: "#6c918b",
    fontSize: 14,
    marginTop: 4,
    fontFamily: "UbuntuRegular",
  },
  resultDate: {
    color: "#6c918b",
    fontSize: 12,
    marginTop: 4,
  },
});

export default ResultsPage;
