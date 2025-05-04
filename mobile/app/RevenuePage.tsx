import React, { useState, useEffect } from "react";
import { View, Text, ActivityIndicator, StyleSheet, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";
import RevenueTable from "../components/RevenueTable";
import { ScrollView } from "react-native-gesture-handler";
import { useRoute, RouteProp } from "@react-navigation/native";
import CompareButton from "../components/CompareButton";
import { RootStackParamList } from "../types";
import { useTranslation } from "react-i18next";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const RevenuePage: React.FC = () => {
  const route = useRoute<RouteProp<RootStackParamList, "Revenue">>();
  const { reportId, selectedCompany } = route.params;

  const [report, setReport] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [availableReports, setAvailableReports] = useState<any[]>([]);
  const [selectedComparisonReport, setSelectedComparisonReport] = useState<any | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    const getReportById = async () => {
      if (!reportId) {
        Alert.alert("Error", "Something went wrong, try again later.");
        setLoading(false);
        return;
      }

      try {
        const token = await AsyncStorage.getItem("authToken");
        if (!token) {
          Alert.alert("Oops", "Something went wrong, try to log in again.");
          setLoading(false);
          return;
        }

        const response = await axios.get(`${API_URL}/reports/${reportId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setReport(() => {
          const newData = response.data;

          if (newData?.reportData?.jsonHeader && newData?.reportData?.jsonData) {
            const headers = newData.reportData.jsonHeader;
            const rawData = newData.reportData.jsonData;

            const filtered = rawData.filter((row: any) => row[0] && row[0] !== "");
            const categories = filtered.map((row: any) => row[0]);
            const months = headers.slice(4);
            const monthData: Record<string, any[]> = {};

            for (let i = 0; i < months.length; i++) {
              const month = months[i];
              monthData[month] = [];

              for (let j = 0; j < filtered.length; j++) {
                let val = filtered[j][i + 4];
                if (typeof val === "string") {
                  val = val.replace(",", ".");
                  const parsed = parseFloat(val);
                  val = isNaN(parsed) ? 0 : parsed;
                }
                if (typeof val !== "number") {
                  val = 0;
                }
                monthData[month].push(val);
              }
            }

            newData.categories = categories;
            newData.monthData = monthData;
          }

          return newData;
        });
      } catch (error) {
        Alert.alert("Error", "Error fetching report data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    getReportById();
  }, [reportId]);

  useEffect(() => {
    if (report?.reportType && (selectedCompany || report?.company?._id)) {
      const reportTypeId = report?.reportType?._id || report?.reportType;
      fetchReportsByType(reportTypeId, selectedCompany || report.company?._id);
    }
  }, [report, selectedCompany]);

  const fetchReportsByType = async (reportType?: string, companyId?: string) => {
    if (!reportType || !companyId) {
      Alert.alert("Error", "Invalid report type or company");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("authToken");
      const response = await axios.get(`${API_URL}/reports/reportType/${reportType}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200 && response.data.length > 0) {
        const filteredReports = response.data.filter(
          (element: any) => element._id !== reportId && (element.company?._id === companyId || element.company === companyId)
        );

        setAvailableReports(
          filteredReports.map((element: any, index: number) => ({
            key: `${element._id}-${index}`,
            id: element._id,
            title: element.reportName,
            date: element.year.toString(),
          }))
        );
      } else {
        Alert.alert("Error", "No reports found for this type.");
        setAvailableReports([]);
      }
    } catch (error: any) {
      Alert.alert("Error", "Failed to fetch reports. Please try again later.");
    }
  };

  const handleCompareSelect = async (selectedReport: { id: string; title: string; date: string }) => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("authToken");
      const response = await axios.get(`${API_URL}/reports/${selectedReport.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const newData = response.data;
      if (newData?.reportData?.jsonHeader && newData?.reportData?.jsonData) {
        const headers = newData.reportData.jsonHeader;
        const rawData = newData.reportData.jsonData;

        const filtered = rawData.filter((row: any) => row[0] && row[0] !== "");
        const categories = filtered.map((row: any) => row[0]);
        const months = headers.slice(4);
        const monthData: Record<string, any[]> = {};

        for (let i = 0; i < months.length; i++) {
          const month = months[i];
          monthData[month] = [];

          for (let j = 0; j < filtered.length; j++) {
            let val = filtered[j][i + 4];
            if (typeof val === "string") {
              val = val.replace(",", ".");
              const parsed = parseFloat(val);
              val = isNaN(parsed) ? 0 : parsed;
            }
            if (typeof val !== "number") {
              val = 0;
            }
            monthData[month].push(val);
          }
        }

        newData.categories = categories;
        newData.monthData = monthData;
      }

      setSelectedComparisonReport(newData);
    } catch (error) {
      Alert.alert("Oops", "Something went wrong, try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.fullScreen} contentContainerStyle={styles.contentContainer}>
      <LinearGradient colors={["#071C25", "#253d3d"]} style={styles.background} />

      {loading ? (
        <ActivityIndicator size="large" color="#6c918b" style={styles.loading} />
      ) : (
        <View>
          <Text style={styles.title}>{report?.reportName || "No Report Found"}</Text>
          <Text style={styles.detailReport}>{report?.reportType?.name || "Unknown"}</Text>
          <Text style={styles.detailReport}>{report?.currency || "N/A"}</Text>
          <Text style={styles.detailReport}>{report?.year || "N/A"}</Text>

          {report?.reportType?.name === "Revenue" && report?.monthData && report?.categories && (
            <View>
              <Text style={styles.sectionTitle}>{report.reportName} (Main Report)</Text>
              <RevenueTable monthData={report.monthData} categories={report.categories} />
            </View>
          )}

          {availableReports.length > 0 && (
            <CompareButton availableReports={availableReports} onCompareSelect={handleCompareSelect} />
          )}

          {selectedComparisonReport?.reportType?.name === "Revenue" && selectedComparisonReport?.monthData && selectedComparisonReport?.categories && (
            <View>
                <Text style={styles.sectionTitle}>{selectedComparisonReport.reportName} {t("report.comparison")}</Text>
              <RevenueTable
                monthData={selectedComparisonReport.monthData}
                categories={selectedComparisonReport.categories}
                hideChart={true}
              />
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 80,
  },
  background: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginLeft: 16,
    marginTop: 48,
  },
  detailReport: {
    fontSize: 12,
    color: "#A9A9A9",
    marginLeft: 16,
    marginTop: 4,
  },
  loading: {
    marginLeft: 16,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginLeft: 16,
    marginTop: 24,
  },
});

export default RevenuePage;
