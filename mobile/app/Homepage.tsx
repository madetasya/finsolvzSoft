import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import ReportFilter from "../components/ReportFilter";
import Grid from "../assets/image/Grid.svg";
import ResultsPage from "../components/Results";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import Icon from "react-native-vector-icons/MaterialIcons";
const API_URL = process.env.EXPO_PUBLIC_API_URL;

const HomePage: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [reportType, setReportType] = useState<string[] | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        if (!token) {
          console.error("No auth token found");
          return;
        }

        const response = await axios.get(`${API_URL}/loginUser`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUserName(response.data.name);

      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);
  const handleFilterChange = (company: string | null, type: string[] | null) => {
    setSelectedCompany(company);
    setReportType(type);
  };




  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("authToken");
      navigation.replace("Login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleReportNavigation = async () => {
    if (!selectedCompany || !reportType || reportType.length === 0) return;

    try {
      const token = await AsyncStorage.getItem("authToken");

      const response = await axios.get(`${API_URL}/reports/company/${selectedCompany}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const reports = response.data;
      let foundReport = null;

      for (let i = 0; i < reports.length; i++) {
        if (reportType.includes(reports[i].reportType.name)) {
          foundReport = reports[i];
          break;
        }
      }

      if (foundReport && foundReport._id) {
        navigation.navigate("Report", { reportId: foundReport._id });
      } else {
        console.error("Can't find this specific report");
      }
    } catch (error) {
      console.error("sumthinc wong===>", error);
    }
  };


  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#071C25", "#253d3d"]}
        style={styles.background}
      />

      {/* GRID */}
      <View style={styles.grid}>
        <Grid />
      </View>

      {/* PROFILE */}
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <View style={{ marginLeft: 16, marginTop: 16 }}>
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Text style={styles.greeting}>Welcome,</Text>
              <Text style={styles.clientName}>{userName || "User"}</Text>
            </>
          )}
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Icon name="logout" style={styles.logoutIcon} />
        </TouchableOpacity>
      </View>

      <View style={{ marginTop: 32 }}>
        <ReportFilter onFilterChange={handleFilterChange} />

        <ResultsPage
          selectedCompany={selectedCompany}
          reportType={reportType}
        />
        <TouchableOpacity style={styles.button} onPress={handleReportNavigation}>
          <Text style={styles.buttonText}>Lihat Laporan</Text>
        </TouchableOpacity>

      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 2,
    backgroundColor: "#0c1519",
    justifyContent: "center",
    alignItems: "flex-start",
    padding: 20,
    paddingTop: 100,
  },
  background: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  grid: {
    width: "100%",
    height: "100%",
    position: "absolute",
    top: 0,
    left: 0,
  },
  profile: {
    width: 60,
    height: 70,
    backgroundColor: "#D9D9D9",
    borderRadius: 30,
    marginBottom: 16,
  },
  greeting: {
    fontSize: 23,
    color: "#FFFFFF",
    opacity: 0.7,
    marginBottom: 4,
  },
  clientName: {
    fontSize: 32,
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  picker: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 10,
    marginTop: 10,
  },
  noCompanyText: {
    fontSize: 16,
    color: "#bbb",
    marginTop: 10,
  },
  button: {
    backgroundColor: "#15616D",
    padding: 12,
    borderRadius: 5,
    alignItems: "center",
    marginVertical: 10,
    width: "80%",
    alignSelf: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  logoutButton: {
    backgroundColor: "transparent",
    paddingLeft: 24,
    marginTop: 42,
    color: "#000",
  },
  logoutIcon: {
    fontSize: 32,
    color: "#FF5733",
  },
});

export default HomePage;