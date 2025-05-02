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
  onFilterChange: (company: string | null, type: string[] | null) => void;
}

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const ReportFilter: React.FC<ReportFilterProps> = ({ onFilterChange }): JSX.Element => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [companyList, setCompanyList] = useState<{ _id: string; name: string }[]>([]);
  const [reportTypes, setReportTypes] = useState<{ _id: string; name: string }[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        console.error("No auth token found");
        return;
      }

      const response = await axios.get(`${API_URL}/user/companies`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setCompanyList(response.data);
      if (response.data.length > 0) {
        const defaultCompany = response.data[0]._id;
        setSelectedCompany(defaultCompany);
        onFilterChange(defaultCompany, []);
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
    setSelectedTypes([]);
    fetchReportTypes(companyId);
    setIsOpen(false);
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
    <View style={[styles.filterContainer, isOpen && styles.filterContainerOpen]}>
      <View style={styles.dropdownContainers}>
        <Text style={styles.chooseText}>Choose Company</Text>
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

        <Text style={styles.chooseText}>Choose Report Type</Text>
        {isOpen && !loading && (
          <View style={styles.dropdownContainer}>
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
      <View style={styles.buttonContainer}>
        {loading ? (
          <Text style={{ color: '#A0A0A0', fontStyle: 'italic', fontFamily: 'UbuntuLightItalic', paddingLeft: 16, marginBottom: 16 }}>
            Fetching data...
          </Text>
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
  filterContainer: {
    justifyContent: "flex-start",
    alignItems: "flex-start",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#1B3935",
    backgroundColor: "#011414",
    paddingVertical: 24,
    marginTop: 16,
    width: "96%"
  },
  chooseText: {
    fontSize: 16,
    paddingLeft: 24,
    fontWeight: "bold",
    color: "#F4F4F4",
    marginBottom: 8,
    fontFamily: "UbuntuRegular",
  },
  filterContainerOpen: {
    flex: -1,
  },
  dropdownContainers: {
    marginBottom: 24,
    position: "relative",
    width: width * 0.9,
  },
  dropdown: {
    marginBottom: 24,
    marginHorizontal: 16,
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
  dropdownContainer: {
    marginHorizontal: 16,
    marginTop: 72,
    position: "absolute",
    width: width * 0.82,
    zIndex: 2,
    elevation: 5,
    borderRadius: 18,
    backgroundColor: "rgba(240, 240, 240, 1)",
    overflow: "hidden",
  },
  dropdownItem: {
    padding: 12,
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
  marginLeft: 16,
  },
  button: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#fff",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 32,
    marginHorizontal: 5,
    marginBottom: 16,
    marginTop: -24,
  },
  buttonSelected: {
    borderWidth: 0,
    backgroundColor: "#6c918b",
   
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  buttonTextSelected: {
    color: "#fff",
  },
});

export default ReportFilter;
