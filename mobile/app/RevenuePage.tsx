import React, { useState, useEffect } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";
import RevenueTable from "../components/RevenueTable";
import { ScrollView } from "react-native-gesture-handler";
import { useRoute, RouteProp } from "@react-navigation/native";
import CompareButton from "../components/CompareButton";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const RevenuePage: React.FC<{ selectedCompany: string | null }> = ({ selectedCompany }) => {
  type ReportPageRouteProp = RouteProp<{ params: { reportId: string } }, "params">;
  const route = useRoute<ReportPageRouteProp>();
  const reportId = route.params?.reportId;

  const [report, setReport] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [availableReports, setAvailableReports] = useState<any[]>([]);
  const [selectedComparisonReport, setSelectedComparisonReport] = useState<any | null>(null);


  useEffect(() => {
    const getReportById = async () => {
      if (!reportId) {
        console.error("No report ID provided");
        setLoading(false);
        return;
      }

      try {
        const token = await AsyncStorage.getItem("authToken");
        if (!token) {
          console.error("No token");
          setLoading(false);
          return;
        }

        const response = await axios.get(`${API_URL}/reports/${reportId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setReport(response.data);
      } catch (error) {
        console.error("Error fetching report:", error);
      } finally {
        setLoading(false);
      }
    };

    getReportById();
  }, [reportId]);
  useEffect(() => {
    if (report?.reportType?.name && (selectedCompany || report?.company?._id)) {
      // console.log("Fetching reports for type:", report.reportType.name, "Company:", selectedCompany || report.company?._id); // DEBUGGING
      fetchReportsByType(report.reportType.name, selectedCompany || report.company?._id);
    }
  }, [report, selectedCompany]);

  const fetchReportsByType = async (reportType?: string, companyId?: string) => {
    if (!reportType || !companyId) {
      console.error("Missing Report Type or Company ID");
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

        // console.log("Filtered reports:", filteredReports); 

        setAvailableReports(
          filteredReports.map((element: any) => ({
            id: element._id,
            title: element.reportName,
            date: element.year.toString(),
          }))
        );
      } else {
        console.warn("No matching reports found for", reportType);
        setAvailableReports([]);
      }
    } catch (error: any) {
      console.error("Error fetching reports:", error?.response?.data || error.message);
    }
  };

  const handleCompareSelect = async (selectedReport: { id: string; title: string; date: string }) => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("authToken");
      const response = await axios.get(`${API_URL}/reports/${selectedReport.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSelectedComparisonReport(response.data);
    } catch (error) {
      console.error("Error fetching report:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.fullScreen}>
      <LinearGradient colors={["#071C25", "#253d3d"]} style={styles.background} />

      {loading ? (
        <ActivityIndicator size="large" color="#6c918b" style={styles.loading} />
      ) : (
        <View>
          <Text style={styles.title}>{report?.reportName || "No Report Found"}</Text>
          <Text style={styles.detailReport}>{report?.reportType?.name || "Unknown"}</Text>
          <Text style={styles.detailReport}>{report?.currency || "N/A"}</Text>
          <Text style={styles.detailReport}>{report?.year || "N/A"}</Text>

          {/* MAIN TABLE */}
          {report?.reportType?.name === "Revenue" && report?.monthData && report?.categories && (
            <View>
              <Text style={styles.sectionTitle}>{report.reportName} (Main Report)</Text>
              <RevenueTable monthData={report.monthData} categories={report.categories} />
            </View>
          )}

          {/* COMPARE TABLE */}
          {availableReports.length > 0 && (
            <CompareButton availableReports={availableReports} onCompareSelect={handleCompareSelect} />
          )}

          {/* TABLE COMPARISON */}
          {selectedComparisonReport?.reportType?.name === "Revenue" && selectedComparisonReport?.monthData && selectedComparisonReport?.categories && (
            <View>
              <Text style={styles.sectionTitle}>{selectedComparisonReport.reportName} (Comparison Report)</Text>
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
