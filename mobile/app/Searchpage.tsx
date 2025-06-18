import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { Searchbar, ActivityIndicator } from "react-native-paper";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTranslation } from "react-i18next";
const API_URL = process.env.EXPO_PUBLIC_API_URL;

const SearchPage = ({ navigation }: any) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [reports, setReports] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [companies, setCompanies] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [accessibleCompanyIds, setAccessibleCompanyIds] = useState<string[]>([]);
    const [companyNameMap, setCompanyNameMap] = useState<Map<string, string>>(new Map())
    const { t } = useTranslation();


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

                const userRes = await axios.get(`${API_URL}/api/loginUser`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                setUserRole(userRes.data.role);
                setUserId(userRes.data._id);

                if (userRes.data.role === "SUPER_ADMIN") {
                    const [allReports, allUsers, allCompanies] = await Promise.all([
                        axios.get(`${API_URL}/api/reports`, { headers: { Authorization: `Bearer ${token}` } }),
                        axios.get(`${API_URL}/api/users`, { headers: { Authorization: `Bearer ${token}` } }),
                        axios.get(`${API_URL}/api/company`, { headers: { Authorization: `Bearer ${token}` } }),
                    ]);
                    setReports(allReports.data);
                    setUsers(allUsers.data);
                    setCompanies(allCompanies.data);
                } else if (userRes.data.role === "ADMIN") {
                    const [userReports, createdReports, allUsers, allCompanies] = await Promise.all([
                        axios.get(`${API_URL}/api/reports/userAccess/${userRes.data._id}`, { headers: { Authorization: `Bearer ${token}` } }),
                        axios.get(`${API_URL}/api/reports/createdBy/${userRes.data._id}`, { headers: { Authorization: `Bearer ${token}` } }),
                        axios.get(`${API_URL}/api/users`, { headers: { Authorization: `Bearer ${token}` } }),
                        axios.get(`${API_URL}/api/company`, { headers: { Authorization: `Bearer ${token}` } }),
                    ]);
                    setReports([...userReports.data, ...createdReports.data]);
                    setUsers(allUsers.data);
                } else if (userRes.data.role === "CLIENT") {
                    const userCompaniesRes = await axios.get(`${API_URL}/api/user/companies`, {
                        headers: { Authorization: `Bearer ${token}` },
                    })

                    const userCompanies = userCompaniesRes.data

                    const companyIds = userCompanies.map((c: any) => c._id)

                    const reportsPromises = companyIds.map((id: string) =>
                        axios.get(`${API_URL}/api/reports/company/${id}`, {
                            headers: { Authorization: `Bearer ${token}` },
                        })
                    )

                    const reportsResponses = await Promise.all(reportsPromises)
                    // console.log("REPORT RESPONSES >>>", reportsResponses.map(r => r.data));

                    const allReports = reportsResponses.flatMap((res) => res.data)

                    const converted = allReports.map((r) => ({
                        ...r,
                        company: r.company && r.company._id ? r.company._id : (typeof r.company === "string" ? r.company : null),
                    }))


                    const companyMap = new Map<string, string>(
                        userCompanies.map((c: any) => [c._id as string, c.name as string])
                    )

                    setReports(converted)
                    setAccessibleCompanyIds(companyIds)
                    setCompanyNameMap(companyMap)
                    setUsers(userCompanies)
                }
            } catch (error) {
                Alert.alert("Oops", "Something went wrong, try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handlePressReport = (report: any) => {
        if (userRole === "CLIENT") {
            if (report.reportType?.name === "Revenue") {
                navigation.navigate("Revenue", { reportId: report._id });
            } else {
                navigation.navigate("BSPLPage", { reportId: report._id });
            }
        } else {
            navigation.navigate("CreateReport", { reportId: report._id });
        }
    };


    const handlePressUser = (user: any) => {
        navigation.navigate("HomePage", {
            openModal: true,
            selectedUser: user,
        });
    };

    const handlePressCompany = (company: any) => {
        navigation.navigate("HomePage", {
            openCompanyModal: true,
            selectedCompany: company
        });
    };




    const filteredReports = reports.filter((item) => {
        const reportName = item.reportName?.toLowerCase() || ""
        const matchName = reportName.includes(searchQuery.toLowerCase())

        if (userRole === "CLIENT") {
            const sameCompany = accessibleCompanyIds.includes(item.company)
            return matchName && sameCompany
        }

        return matchName
    })




    const filteredUsers = users.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredCompanies = companies.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const hasResults = filteredReports.length > 0 || filteredUsers.length > 0 || filteredCompanies.length > 0;

    return (
        <View style={{ flex: 1, backgroundColor: '#314E4A', paddingTop: 40, paddingHorizontal: 16, paddingBottom: 48 }}>
            <Searchbar
                placeholder={t("searchPlaceholder")}
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
                theme={{
                    colors: {
                        text: "#E2E4D7", // teks input
                        placeholder: "#FFFFFF", // placeholder putih
                        primary: "#E2E4D7", 
                    }
                  }}
            />

            {loading ? (
                <ActivityIndicator animating={true} size="large" color="#E2E4D7" />
            ) : (
                <ScrollView>
                    {hasResults ? (
                        <>
                            {userRole !== "CLIENT" && filteredUsers.length > 0 && (
                                <>
                                    <Text style={{ color: '#E2E4D7', fontFamily: 'UbuntuBold', marginBottom: 8, fontSize: 16, letterSpacing: 1.8, }}>{t("USERS")}</Text>
                                    {filteredUsers.map((user) => (
                                        <View key={user._id} style={{ marginBottom: 8 }}>
                                            <TouchableOpacity onPress={() => handlePressUser(user)}>
                                                <Text style={{ color: '#E2E4D7', fontFamily: 'UbuntuMedium' }}>{user.name}</Text>
                                                <Text style={{ color: '#A0A0A0', fontFamily: 'UbuntuLightItalic', fontSize: 12 }}>{user.role}</Text>
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                </>
                            )}

                            {filteredReports.length > 0 && (
                                <>
                                    <Text style={{ color: '#E2E4D7', fontFamily: 'UbuntuBold', marginTop: 16, marginBottom: 8, letterSpacing: 1.8, }}>{t("REPORTS")}</Text>
                                    {filteredReports.map((report) => (
                                        <View key={report._id} style={{ marginBottom: 8 }}>
                                            <TouchableOpacity onPress={() => handlePressReport(report)}>
                                                <Text style={{ color: '#E2E4D7', fontFamily: 'UbuntuMedium' }}>{report.reportName}</Text>
                                                <Text style={{ color: '#A0A0A0', fontFamily: 'UbuntuLightItalic', fontSize: 12 }}>{companyNameMap.get(report.company?.toString()) || 'No Company'}</Text>
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                </>
                            )}

                            {userRole !== "CLIENT" && filteredCompanies.length > 0 && (
                                <>
                                    <Text style={{ color: '#E2E4D7', fontFamily: 'UbuntuBold', marginTop: 16, marginBottom: 8, letterSpacing: 1.8, }}>{t("COMPANIES")}</Text>
                                    {filteredCompanies.map((company) => (
                                        <TouchableOpacity key={company._id} onPress={() => handlePressCompany(company)}>
                                            <Text style={{ color: '#E2E4D7', marginBottom: 4, fontFamily: 'UbuntuMedium' }}>{company.name}</Text>
                                        </TouchableOpacity>
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
