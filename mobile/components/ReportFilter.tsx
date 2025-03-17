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
  onFilterChange: (company: string | null, type: string | null) => void;
}

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const ReportFilter: React.FC<ReportFilterProps> = ({ onFilterChange }): JSX.Element => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [companyList, setCompanyList] = useState<{ _id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);

  const toggleDropdown = () => setIsOpen(!isOpen);

  /** 🔥 Fetch user-specific companies */
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
        onFilterChange(defaultCompany, null);
      }
    } catch (error) {
      console.error("Error fetching companies:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleCompanySelect = (companyId: string) => {
    setSelectedCompany(companyId);
    setIsOpen(false);
    onFilterChange(companyId, null);
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
    </View>
  );
};

const styles = StyleSheet.create({
  filterContainer: {
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 32,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingTop: 24,
  },
  chooseText: {
    fontSize: 16,
    paddingLeft: 24,
    fontWeight: "bold",
    color: "#F4F4F4",
    marginBottom: 16,
  },
  filterContainerOpen: {
    flex: -2,
  },
  dropdownContainers: {
    marginBottom: 24,
    position: "relative",
    width: width * 0.9,
  },
  dropdown: {
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
    marginTop: 80,
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
});

export default ReportFilter;
