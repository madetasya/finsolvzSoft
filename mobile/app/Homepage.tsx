import React, { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal, TextInput, Text } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import HomeHeader from "../components/HeaderHome";
import ReportList from "../components/ReportList";
import UserList from "../components/UserList";
import CompanyList from "../components/CompanyList";


const API_URL = process.env.EXPO_PUBLIC_API_URL;

interface UserItem {
  _id: string;
  name: string;
  email?: string;
  role?: string;
}

interface CompanyItem {
  _id: string;
  name: string;
  user?: string[];
}



const HomePage: React.FC<{ navigation: any; route: any }> = ({ navigation, route }) => {
  const [userName, setUserName] = useState<string | null>(null);
  const [reports, setReports] = useState<any[]>([]);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [companies, setCompanies] = useState<CompanyItem[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isCompanyCreateModalVisible, setCompanyCreateModalVisible] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState("");
  const [selectedCompanyUsers, setSelectedCompanyUsers] = useState<string[]>([]);
  const [searchUserQuery, setSearchUserQuery] = useState("");
  const [editingCompanyId, setEditingCompanyId] = useState<string | null>(null);
  const [isUserModalVisible, setUserModalVisible] = useState(false);
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserRole, setNewUserRole] = useState<"SUPER_ADMIN" | "ADMIN" | "CLIENT">("CLIENT");
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [isRolePickerVisible, setRolePickerVisible] = useState(false);
  const [selectedUserCompanies, setSelectedUserCompanies] = useState<string[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
  const [searchCompanyQuery, setSearchCompanyQuery] = useState("");
  const [loading, setLoading] = useState(true);


  function roleLogin(role: string) {
    if (role === "SUPER_ADMIN") return "SUPER ADMIN";
    if (role === "ADMIN") return "ADMIN";
    if (role === "CLIENT") return "CLIENT";
    return role;
  }

  function formatUserName(name: string) {
    if (name.length <= 15) {
      return name;
    }
    let spaceIndexes = [];
    for (let i = 0; i < name.length; i++) {
      if (name[i] === ' ') {
        spaceIndexes.push(i);
      }
    }
    if (spaceIndexes.length < 2) {
      return name;
    }
    const secondSpaceIndex = spaceIndexes[1];
    return name.substring(0, secondSpaceIndex) + '\n' + name.substring(secondSpaceIndex + 1);
  }

  //USE EFFECTS
  useEffect(() => {
    const init = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        if (!token) {
          Alert.alert("Oops", "Something went wrong, try again later.");
          return;
        }

        const response = await axios.get(`${API_URL}/api/loginUser`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUserName(response.data.name);
        setUserRole(response.data.role);

        await fetchReports(token, response.data.role, response.data._id);
        await getUsers(token);
        await fetchCompanies(token);
      } catch (error) {
        Alert.alert("Oops", "Something went wrong, try again later.");
      }
    };

    init();
  }, []);

  useEffect(() => {
    if (route.params?.openModal && route.params?.selectedUser) {
      navigation.setParams({ openModal: null, selectedUser: null });
      handleEditUser(route.params.selectedUser);
    }
    if (route.params?.openCompanyModal && route.params?.selectedCompany) {
      navigation.setParams({ openCompanyModal: null, selectedCompany: null });
      handleEditCompany(route.params.selectedCompany);
    }
  }, [route.params]);


//REFRESH DATA FUNCTION
 
  const refreshData = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) return Alert.alert("Oops", "Token missing");

      const userRes = await axios.get(`${API_URL}/api/loginUser`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const userData = userRes.data;
      setUserName(userData.name);
      setUserRole(userData.role);

      await fetchReports(token, userData.role, userData._id);
      await getUsers(token);
      await fetchCompanies(token);
    } catch (err) {
      Alert.alert("Failed", "Gagal refresh data");
    }
  };


  //========================================REPORTS======================================//
  //========================================REPORTS======================================//
  //========================================REPORTS======================================//

  const fetchReports = async (token: string, role: string, userId: string) => {
    try {
      if (role === "SUPER_ADMIN" || role === "ADMIN") {
        const response = await axios.get(`${API_URL}/api/reports`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setReports(response.data);
      } else {
        const response = await axios.get(`${API_URL}/api/reports/userAccess/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setReports(response.data);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to fetch reports. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    const token = await AsyncStorage.getItem("authToken");

    if (!token) {
      Alert.alert("Oops", "Something went wrong, try to login again.");
      return;
    }

    try {
      await axios.delete(`${API_URL}/api/reports/${reportId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      Alert.alert("Error", "Failed to delete report.");
      return;
    }

    const updatedReports = reports.filter((report) => report._id !== reportId);
    setReports(updatedReports);
    Alert.alert("Success", "Report deleted successfully!");
  };



  //====================================USERS=======================================//
  //====================================USERS=======================================//
  //====================================USERS=======================================//

  const handleAddUser = () => {
    setNewUserName("");
    setNewUserEmail("");
    setNewUserPassword("");
    setNewUserRole("CLIENT");
    setEditingUserId(null);
    setUserModalVisible(true);
  };


  const handleEditUser = (user: UserItem) => {
    setSelectedUser(user);
    setNewUserName(user.name);
    setNewUserEmail(user.email || "");
    setNewUserPassword("");
    setNewUserRole(user.role as "CLIENT" | "ADMIN" | "SUPER_ADMIN");
    setEditingUserId(user._id);
    setUserModalVisible(true);
  };

  const getUsers = async (token: string) => {
    try {
      const response = await axios.get(`${API_URL}/api/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // console.log(response.data);
      setUsers(response.data);
    } catch (error: any) {
      // console.error("ERROR FETCH USERS >>>", error?.response?.status, error?.response?.data);
      Alert.alert("Error", "Failed to fetch users. Please try again later.");
    }
  };

  //UPDATE OR CREATE USER
  const handleSaveUser = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        Alert.alert("Oops", "Something went wrong, try login again.");
        return;
      }

      const payload: { name: string; email: string; password?: string; role: string; company?: string[] } = {
        name: newUserName.trim(),
        email: newUserEmail.trim(),
        ...(editingUserId ? {} : { password: newUserPassword.trim() }),
        role: newUserRole,
        ...(selectedUserCompanies.length > 0 ? { company: selectedUserCompanies } : {}),
      };

      // console.log("PAYLOAD YANG DIKIRIM >>>>", payload);

      if (!payload.name || !payload.email || (!editingUserId && !payload.password)) {
        Alert.alert("Error", "Please fill in all required fields.");
        return;
      }

      if (editingUserId) {
        await axios.put(`${API_URL}/api/updateUser/${editingUserId}`, payload, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
      
        setTimeout(() => {
          Alert.alert("Success", "User updated successfully!");
        }, 300);
      } else {
        await axios.post(`${API_URL}/api/register`, payload, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
      
        setTimeout(() => {
          Alert.alert("Success", "User created successfully!");
        }, 300);
      }
      
      setNewUserName("");
      setNewUserEmail("");
      setNewUserPassword("");
      setNewUserRole("CLIENT");
      setEditingUserId(null);
      setSelectedUserCompanies([]);

      getUsers(token);
    } catch (error: any) {
      // console.error("Error during user registration:", error?.response?.data || error);
      Alert.alert("Error", error?.response?.data?.message || "Failed to save user");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        Alert.alert("Oops", "Something went wrong, try to login again.");
        return;
      }

      await axios.delete(`${API_URL}/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      Alert.alert("Success", "User deleted successfully!");
      setUsers(users.filter((user) => user._id !== userId));
    } catch (err) {
      Alert.alert("Error", "Failed to delete user.");
    }
  };

  //====================================COMPANY=======================================//
  //====================================COMPANY=======================================//
  //====================================COMPANY=======================================//

  const fetchCompanies = async (token: string) => {
    try {
      const response = await axios.get(`${API_URL}/api/company`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCompanies(response.data);
    } catch (error: any) {
      // console.error("Error fetching companies >>>", error?.response?.data || error.message || error);
      Alert.alert("Error", "Failed to fetch companies. Please try again later.");
    }
  };

  // handle setiap user ada di company apa.
  const handleUsersCompany = (userId: string) => {
    setSelectedCompanyUsers((prev) => {
      if (prev.includes(userId)) {
        return prev.filter((id) => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  const handleEditCompany = async (company: CompanyItem) => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        Alert.alert("Oops", "Auth token missing");
        return;
      }

      const realId = typeof company._id === "object" && company._id !== null && "$oid" in (company._id as any)
        ? (company._id as { $oid: string }).$oid
        : company._id;

      const res = await axios.get(`${API_URL}/api/company/${realId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });



      const freshCompany = res.data;

      setNewCompanyName(freshCompany.name);
      setEditingCompanyId(freshCompany._id);
      setSelectedCompanyUsers(freshCompany.user || []);
      setCompanyCreateModalVisible(true);
    } catch (err) {
      // console.log("GAGAL FETCH COMPANY >>>", err);
      Alert.alert("Error", "Failed to load company data");
    }
  };

  const handleSaveCompany = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        Alert.alert("Oops", "Something went wrong, try again later.");
        return;
      }

      const payload = {
        name: newCompanyName,
        user: selectedCompanyUsers,
      };

      if (editingCompanyId) {
        // EDIT
        await axios.put(`${API_URL}/api/company/${editingCompanyId}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        Alert.alert("Success", "Company updated successfully");
      } else {
        // CREATE
        await axios.post(`${API_URL}/api/company`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        Alert.alert("Success", "Company created successfully");
      }

      setCompanyCreateModalVisible(false);
      setNewCompanyName("");
      setSelectedCompanyUsers([]);
      setEditingCompanyId(null);

      fetchCompanies(token);
    } catch (err) {
      // console.error("Error saving company", err);
      Alert.alert("Error", "Failed to save company");
    }
  };



  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>
      <HomeHeader
        navigation={navigation}
        userName={userName}
        formatUserName={formatUserName}
        showLanguageToggle={true}
      />

      <View style={{ height: 280 }} />
      <TouchableOpacity
        style={{
          paddingVertical: 6,
          paddingHorizontal: 16,
          borderRadius: 20,
          marginTop: -16,
          marginRight: 16,
          alignSelf: "flex-end",
          marginBottom: 16,
        }}
        onPress={refreshData}
      >
        <Text style={{ color: "#FFFF", fontWeight: "bold", textDecorationLine: "underline" }}>Refresh</Text>
      </TouchableOpacity>

      <ReportList
        reports={reports}
        loading={loading}
        searchQuery=""
        onPressReport={(report) => {
          navigation.navigate('CreateReport', { reportId: report._id });
        }}
        onDeleteReport={handleDeleteReport}
        // onPressSeeMore={() => console.log('SEE MORE REPORTS >>>')}
        onPressCreateReport={() => navigation.navigate('CreateReport')}
        userRole={userRole}
      />
      <UserList
        navigation={navigation}
        users={users}
        onPressUser={handleEditUser}
        onAddUser={handleAddUser}
        onDeleteUser={handleDeleteUser}
        userRole={userRole}
      />




      <CompanyList
        companies={companies}
        onPressCompany={handleEditCompany}
        // onSeeMore={() => console.log('SEE MORE COMPANIES >>>')}
        onAddCompany={() => {
          setNewCompanyName("");
          setEditingCompanyId(null);
          setSelectedCompanyUsers([]);
          setCompanyCreateModalVisible(true);
        }}

        userRole={userRole}
      />
      <Modal
        visible={isCompanyCreateModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setCompanyCreateModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* <Text style={styles.modalTitle}>Create Company</Text> */}

            <TextInput
              placeholder="Company Name"
              editable={userRole === "SUPER_ADMIN"}
              placeholderTextColor="#aaa"
              style={styles.inputUnderline}
              value={newCompanyName}
              onChangeText={setNewCompanyName}
            />

            {userRole === "SUPER_ADMIN" ? (
              <>
                <Text style={[styles.modalTitle, { alignSelf: "flex-start", fontSize: 16, paddingTop: 32 }]}>Tag Users</Text>

                <TextInput
                  placeholder="Search..."
                  placeholderTextColor="#aaa"
                  style={styles.searchInput}
                  value={searchUserQuery}
                  onChangeText={setSearchUserQuery}
                />
              </>
            ) : (
              <Text style={[styles.modalTitle, { alignSelf: "flex-start", fontSize: 16, paddingTop: 32 }]}>
                User
              </Text>
            )}

            <ScrollView style={{ maxHeight: 200, width: "100%" }}>
              <View style={{ width: "100%" }}>
                {users
                  .filter((user) => user.name.toLowerCase().includes(searchUserQuery.toLowerCase()))
                  .map((user) => {
                    const isSelected = selectedCompanyUsers.includes(user._id);

                    if (userRole !== "SUPER_ADMIN") {
                      return (
                        isSelected && (
                          <View
                            key={user._id}
                            style={[styles.modalItem]}
                          >
                            <Text style={[styles.modalItemText, { color: "#000" }]}>
                              {user.name}
                            </Text>
                          </View>
                        )
                      );
                    }

                    return (
                      <TouchableOpacity
                        key={user._id}
                        style={[styles.modalItem, isSelected && { backgroundColor: "#1B3935" }]}
                        onPress={() => handleUsersCompany(user._id)}
                      >
                        <Text style={[styles.modalItemText, isSelected && { color: "#E2E4D7" }]}>
                          {user.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
              </View>
            </ScrollView>





            {userRole === "SUPER_ADMIN" && (
              <TouchableOpacity
                style={styles.modalSaveButton}
                onPress={handleSaveCompany}
              >
                <Text style={styles.modalSaveButtonText}>Save Company</Text>
              </TouchableOpacity>
            )}

            {editingCompanyId && userRole === "SUPER_ADMIN" && (
              <TouchableOpacity
                style={[styles.modalDeleteButton, { backgroundColor: "#7B241C" }]}
                onPress={async () => {
                  try {
                    const token = await AsyncStorage.getItem("authToken");
                    if (!token) return;
                    await axios.delete(`${API_URL}/api/company/${editingCompanyId}`, {
                      headers: { Authorization: `Bearer ${token}` },
                    });
                    Alert.alert("Deleted", "Company deleted!");
                    setCompanyCreateModalVisible(false);
                    setNewCompanyName("");
                    setEditingCompanyId(null);
                    fetchCompanies(token);
                  } catch (err) {
                    Alert.alert("Error", "Failed to delete company.");
                  }
                }}
              >
                <Text style={styles.modalSaveButtonText}>Delete Company</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setCompanyCreateModalVisible(false)}
            >
              <Text style={styles.modalCloseButtonText}>Cancel</Text>
            </TouchableOpacity>

          </View>
        </View>
      </Modal>

      {/* MODAL UPDATE USER */}
      {/* MODAL UPDATE USER */}
      {/* MODAL UPDATE USER */}
      {(isUserModalVisible && (selectedUser || editingUserId === null)) && (
        <Modal
          visible={isUserModalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setUserModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>User Details</Text>

              <TextInput
                placeholder="Name"
                editable={userRole === "SUPER_ADMIN"}
                placeholderTextColor="#aaa"
                style={styles.inputUnderline}
                value={newUserName}
                onChangeText={setNewUserName}
              />

              <TextInput
                placeholder="Email"
                placeholderTextColor="#aaa"
                style={styles.inputUnderline}
                value={newUserEmail}
                onChangeText={setNewUserEmail}
              />

              <TextInput
                placeholder="Password"
                editable={userRole === "SUPER_ADMIN"}
                placeholderTextColor="#aaa"
                style={styles.inputUnderline}
                value={newUserPassword}
                onChangeText={setNewUserPassword}
                secureTextEntry
              />

              <TouchableOpacity
                style={[styles.inputUnderline, { justifyContent: "center" }]}
                onPress={userRole === "SUPER_ADMIN" ? () => setRolePickerVisible(true) : undefined}
              >
                <Text style={{ color: newUserRole ? "#000" : "#aaa" }}>
                  {roleLogin(newUserRole) || "Select Role"}
                </Text>
              </TouchableOpacity>

              {userRole === "SUPER_ADMIN" ? (
                <>
                  <Text style={[styles.modalTitle, { alignSelf: "flex-start", fontSize: 16, paddingTop: 32 }]}>
                    Select Company
                  </Text>
                  <TextInput
                    placeholder="Search Company..."
                    placeholderTextColor="#aaa"
                    style={styles.searchInput}
                    value={searchCompanyQuery}
                    onChangeText={setSearchCompanyQuery}
                  />
                </>
              ) : (
                <Text style={[styles.modalTitle, { alignSelf: "flex-start", fontSize: 16, paddingTop: 32 }]}>
                  Company:
                </Text>
              )}



              <ScrollView style={{ maxHeight: 150, width: "100%" }}>
                <View style={{ width: "100%" }}>
                  {companies
                    .filter((company) =>
                      company.name.toLowerCase().includes(searchCompanyQuery.toLowerCase())
                    )
                    .map((company) => {
                      const isSelected = selectedUserCompanies.includes(company._id);
                      return (
                        <TouchableOpacity
                          key={company._id}
                          disabled={userRole !== "SUPER_ADMIN"}
                          style={[styles.modalItem, isSelected && { backgroundColor: "#1B3935" }]}
                          onPress={() => {
                            if (isSelected) {
                              setSelectedUserCompanies((prev) => prev.filter((id) => id !== company._id));
                            } else {
                              setSelectedUserCompanies((prev) => [...prev, company._id]);
                            }
                          }}
                        >
                          <Text style={[styles.modalItemText, isSelected && { color: "#E2E4D7" }]}>
                            {company.name}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                </View>
              </ScrollView>

              {userRole === "SUPER_ADMIN" && (
                <TouchableOpacity
                  style={styles.modalSaveButton}
                  onPress={handleSaveUser}
                >
                  <Text style={styles.modalSaveButtonText}>Save User</Text>
                </TouchableOpacity>
              )}


              {editingUserId && userRole === "SUPER_ADMIN" && (
                <TouchableOpacity
                  style={[styles.modalDeleteButton, { backgroundColor: "#7B241C" }]}
                  onPress={async () => {
                    try {
                      const token = await AsyncStorage.getItem("authToken");
                      if (!token) return;
                      await axios.delete(`${API_URL}/api/users/${editingUserId}`, {

                        headers: { Authorization: `Bearer ${token}` },
                      });
                      Alert.alert("Deleted", "User deleted!");
                      setUserModalVisible(false);
                      setEditingUserId(null);
                      getUsers(token);
                    } catch (err) {
                      console.error("Error deleting user >>>", err);
                    }
                  }}
                >
                  <Text style={styles.modalSaveButtonText}>Delete User</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setUserModalVisible(false)}
              >

                <Text style={styles.modalCloseButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      <Modal
        visible={isRolePickerVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setRolePickerVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { padding: 0, overflow: "hidden" }]}>
            <TouchableOpacity
              style={styles.roleOption}
              onPress={() => {
                setNewUserRole("CLIENT");
                setRolePickerVisible(false);
              }}
            >
              <Text style={styles.roleOptionText}>CLIENT</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.roleOption}
              onPress={() => {
                setNewUserRole("SUPER_ADMIN");
                setRolePickerVisible(false);
              }}
            >
              <Text style={styles.roleOptionText}>SUPER ADMIN</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.roleOption}
              onPress={() => {
                setNewUserRole("ADMIN");
                setRolePickerVisible(false);
              }}
            >
              <Text style={styles.roleOptionText}>ADMIN</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalCloseButton, { marginTop: 0 }]}
              onPress={() => setRolePickerVisible(false)}
            >

            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </ScrollView>


  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#314E4A",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)"
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    width: "80%",
    alignItems: "center"
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20
  },
  modalItem: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    alignSelf: "stretch",
  },
  modalItemText: {
    fontSize: 16,
    color: "#000",
    paddingLeft: 4,
  },

  modalSaveButton: {
    backgroundColor: "#112725",
    padding: 12,
    borderRadius: 20,
    alignItems: "center",
    marginTop: 32,
    width: "100%"
  },
  modalDeleteButton: {
    backgroundColor: "#112725",
    padding: 12,
    borderRadius: 20,
    alignItems: "center",
    marginTop: 8,
    width: "100%"
  },
  modalSaveButtonText: {
    color: "#E2E4D7",
    fontWeight: "bold",
    textAlign: "center"
  },
  modalCloseButton: {
    marginTop: 10
  },
  modalCloseButtonText: {
    color: "#7B241C",
    fontWeight: "bold",
    textAlign: "center",
    paddingVertical: 8,
  },
  inputUnderline: {
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    width: "100%",
    padding: 8,
    color: "#000"
  },

  searchInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 8,
    marginBottom: 12,
    width: "100%",
    color: "#000",
    backgroundColor: "#f9f9f9",
  },


  roleOption: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    width: "100%",
    alignItems: "center",
  },
  roleOptionText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },


});



export default HomePage;