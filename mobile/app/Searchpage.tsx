import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { Searchbar, ActivityIndicator } from "react-native-paper";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const SearchPage = ({ navigation }: any) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [reports, setReports] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [companies, setCompanies] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        if (searchQuery.length === 0) {
            return;
        }
    }, [searchQuery]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = await AsyncStorage.getItem("authToken");
                if (!token) return;

                const userRes = await axios.get(`${API_URL}/loginUser`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                setUserRole(userRes.data.role);
                setUserId(userRes.data._id);

                if (userRes.data.role === "SUPER_ADMIN") {
                    const [allReports, allUsers, allCompanies] = await Promise.all([
                        axios.get(`${API_URL}/reports`, { headers: { Authorization: `Bearer ${token}` } }),
                        axios.get(`${API_URL}/users`, { headers: { Authorization: `Bearer ${token}` } }),
                        axios.get(`${API_URL}/company`, { headers: { Authorization: `Bearer ${token}` } }),
                    ]);
                    setReports(allReports.data);
                    setUsers(allUsers.data);
                    setCompanies(allCompanies.data);
                } else if (userRes.data.role === "ADMIN") {
                    const [userReports, createdReports, allUsers, allCompanies] = await Promise.all([
                        axios.get(`${API_URL}/reports/userAccess/${userRes.data._id}`, { headers: { Authorization: `Bearer ${token}` } }),
                        axios.get(`${API_URL}/reports/createdBy/${userRes.data._id}`, { headers: { Authorization: `Bearer ${token}` } }),
                        axios.get(`${API_URL}/users`, { headers: { Authorization: `Bearer ${token}` } }),
                        axios.get(`${API_URL}/company`, { headers: { Authorization: `Bearer ${token}` } }),
                    ]);
                    setReports([...userReports.data, ...createdReports.data]);
                    setUsers(allUsers.data);
                    setCompanies(allCompanies.data);
                } else if (userRes.data.role === "CLIENT") {
                    const [userReports, createdReports] = await Promise.all([
                        axios.get(`${API_URL}/reports/userAccess/${userRes.data._id}`, { headers: { Authorization: `Bearer ${token}` } }),
                        axios.get(`${API_URL}/reports/createdBy/${userRes.data._id}`, { headers: { Authorization: `Bearer ${token}` } }),
                    ]);
                    setReports([...userReports.data, ...createdReports.data]);
                }
            } catch (error) {
                console.error("error fetching search data >>>", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const filteredReports = reports.filter((item) =>
        item.reportName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredUsers = users.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredCompanies = companies.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const hasResults = filteredReports.length > 0 || filteredUsers.length > 0 || filteredCompanies.length > 0;

    return (
        <View style={{ flex: 1, backgroundColor: '#314E4A', paddingTop: 40, paddingHorizontal: 16 }}>
            <Searchbar
                placeholder="Search..."
                value={searchQuery}
                onChangeText={(text) => setSearchQuery(text)}
                style={{
                    backgroundColor: '#011414',
                    borderWidth: 1,
                    borderColor: '#1B3935',
                    borderRadius: 32,
                    marginBottom: 20,
                }}
                inputStyle={{
                    color: "#E2E4D7",
                    fontFamily: searchQuery.length > 0 ? 'UbuntuRegular' : 'UbuntuLightItalic',
                }}
                iconColor="#E2E4D7"
            />

            {loading ? (
                <ActivityIndicator animating={true} size="large" color="#E2E4D7" />
            ) : (
                <ScrollView>
                    {hasResults ? (
                        <>
                            {userRole !== "CLIENT" && filteredUsers.length > 0 && (
                                <>
                                        <Text style={{ color: '#E2E4D7', fontFamily: 'UbuntuBold', marginBottom: 8, fontSize: 16, letterSpacing: 1.8, }}>USERS</Text>
                                    {filteredUsers.map((user, index) => (
                                        <View key={index} style={{ marginBottom: 8 }}>
                                            <Text style={{ color: '#E2E4D7', fontFamily: 'UbuntuMedium' }}>{user.name}</Text>
                                            <Text style={{ color: '#A0A0A0', fontFamily: 'UbuntuLightItalic', fontSize: 12 }}>{user.role}</Text>
                                        </View>
                                    ))}
                                </>
                            )}

                            {filteredReports.length > 0 && (
                                <>
                                        <Text style={{ color: '#E2E4D7', fontFamily: 'UbuntuBold', marginTop: 16, marginBottom: 8, letterSpacing: 1.8, }}>REPORTS</Text>
                                    {filteredReports.map((report, index) => (
                                        <View key={index} style={{ marginBottom: 8 }}>
                                            <Text style={{ color: '#E2E4D7', fontFamily: 'UbuntuMedium' }}>{report.reportName}</Text>
                                            <Text style={{ color: '#A0A0A0', fontFamily: 'UbuntuLightItalic', fontSize: 12 }}>{report.company?.name || 'No Company'}</Text>
                                        </View>
                                    ))}
                                </>
                            )}

                            {userRole !== "CLIENT" && filteredCompanies.length > 0 && (
                                <>
                                        <Text style={{ color: '#E2E4D7', fontFamily: 'UbuntuBold', marginTop: 16, marginBottom: 8, letterSpacing: 1.8, }}>COMPANIES</Text>
                                    {filteredCompanies.map((company, index) => (
                                        <Text key={index} style={{ color: '#E2E4D7', marginBottom: 4, fontFamily: 'UbuntuMedium' }}>{company.name}</Text>
                                    ))}
                                </>
                            )}
                        </>
                    ) : (
                        <Text style={{ color: '#A0A0A0', fontFamily: 'UbuntuLightItalic', marginTop: 32, textAlign: 'center' }}>No Results Found</Text>
                    )}
                </ScrollView>
            )}
        </View>
    );
};

export default SearchPage;
