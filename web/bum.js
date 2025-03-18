import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  FlatList,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const { width } = Dimensions.get("window");

interface ReportFilterProps {
  onFilterChange: (company: string | null, types: string[]) => void;
}

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const ReportFilter: React.FC<ReportFilterProps> = ({ onFilterChange }) => {
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [companyList, setCompanyList] = useState<{ _id: string; name: string }[]>([]);
  const [reportTypes, setReportTypes] = useState<{ _id: string; name: string }[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("authToken");
      if (!token) return;

      const response = await axios.get(`${API_URL}/user/companies`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setCompanyList(response.data);
      if (response.data.length > 0) {
        const defaultCompany = response.data[0]._id;
        setSelectedCompany(defaultCompany);
        fetchReportTypes(defaultCompany);
      }
    } catch (error) {
      console.error("Error fetching companies:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReportTypes = async (companyId: string) => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("authToken");
      if (!token) return;

      const response = await axios.get(`${API_URL}/reports/company/${companyId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const uniqueReportTypes = Array.from(
        new Set(response.data.map((report: any) => report.reportType.name))
      ).map((name) => {
        return response.data.find((report: any) => report.reportType.name === name).reportType;
      });

      setReportTypes(uniqueReportTypes);
    } catch (error) {
      console.error("Error fetching report types:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleCompanySelect = (companyId: string) => {
    setSelectedCompany(companyId);
    setDropdownOpen(false);
    setSelectedTypes([]);
    fetchReportTypes(companyId);
    onFilterChange(companyId, []);
  };

  const toggleReportType = (typeId: string) => {
    let updatedSelectedTypes;
    if (selectedTypes.includes(typeId)) {
      updatedSelectedTypes = selectedTypes.filter((id) => id !== typeId);
    } else {
      updatedSelectedTypes = [...selectedTypes, typeId];
    }
    setSelectedTypes(updatedSelectedTypes);
    onFilterChange(selectedCompany, updatedSelectedTypes);
  };

  return (
    <View style={styles.container}>
      {/* Dropdown Perusahaan */}
      <View style={styles.dropdownContainer}>
        <Text style={styles.label}>Choose Company</Text>
        <TouchableOpacity style={styles.dropdown} onPress={toggleDropdown}>
          {loading ? (
            <ActivityIndicator size="small" color="#253d3d" />
          ) : (
            <Text style={styles.dropdownText}>
              {selectedCompany
                ? companyList.find((c) => c._id === selectedCompany)?.name
                : "Select Company"}
            </Text>
          )}
        </TouchableOpacity>

        {dropdownOpen && !loading && (
          <View style={styles.dropdownList}>
            <FlatList
              data={companyList}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.dropdownItem,
                    selectedCompany === item._id && styles.dropdownItemSelected,
                  ]}
                  onPress={() => handleCompanySelect(item._id)}
                >
                  <Text
                    style={[
                      styles.dropdownItemText,
                      selectedCompany === item._id && styles.dropdownItemTextSelected,
                    ]}
                  >
                    {item.name}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        )}
      </View>

      {/* Tombol Filter Report Type */}
      <View style={styles.buttonContainer}>
        {loading ? (
          <ActivityIndicator size="small" color="#253d3d" />
        ) : (
          reportTypes.slice(0, 3).map((reportType) => (
            <TouchableOpacity
              key={reportType._id}
              style={[
                styles.button,
                selectedTypes.includes(reportType._id) && styles.buttonSelected,
              ]}
              onPress={() => toggleReportType(reportType._id)}
            >
              <Text
                style={[
                  styles.buttonText,
                  selectedTypes.includes(reportType._id) && styles.buttonTextSelected,
                ]}
              >
                {reportType.name}
              </Text>
            </TouchableOpacity>
          ))
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 10,
  },
  dropdownContainer: {
    marginBottom: 16,
    width: width * 0.9,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#F4F4F4",
    marginBottom: 8,
  },
  dropdown: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 50,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
  },
  dropdownText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#253d3d",
  },
  dropdownList: {
    marginTop: 10,
    borderRadius: 10,
    backgroundColor: "rgba(240, 240, 240, 1)",
    padding: 8,
  },
  dropdownItem: {
    padding: 10,
  },
  dropdownItemSelected: {
    backgroundColor: "#253d3d",
  },
  dropdownItemText: {
    fontSize: 16,
    color: "#253d3d",
  },
  dropdownItemTextSelected: {
    color: "#ffffff",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
  },
  button: {
    backgroundColor: "#253d3d",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  buttonSelected: {
    backgroundColor: "#6c918b",
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  buttonTextSelected: {
    color: "#253d3d",
  },
});

export default ReportFilter;
