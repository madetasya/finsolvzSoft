import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image, Dimensions } from "react-native";
import { ActivityIndicator } from "react-native";

const screenWidth = Dimensions.get('window').width;

interface Report {
    reportName: string;
    company?: { name: string };
}

interface ReportListProps {
    reports: Report[];
    loading: boolean;
    onPressReport: (report: Report) => void;
    // onPressSeeMore: () => void;
    onPressCreateReport: () => void;
    searchQuery: string;
    userRole: string | null;
}

const ITEMS_PER_PAGE = 4;

const ReportList: React.FC<ReportListProps> = ({ reports, loading, onPressReport,  onPressCreateReport, searchQuery, userRole }) => {
    const [page, setPage] = useState(0);

    const filteredReports = reports.filter((item) => {
        if (searchQuery.trim() === '') return true;
        return item.reportName.toLowerCase().includes(searchQuery.toLowerCase());
    });

    const totalPages = Math.ceil(filteredReports.length / ITEMS_PER_PAGE);

    const currentReports = filteredReports.slice(
        page * ITEMS_PER_PAGE,
        page * ITEMS_PER_PAGE + ITEMS_PER_PAGE
    );

    return (
        <View style={{ width: '100%', alignItems: 'center' }}>
            {/* Header */}
            <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                width: '86%',
                marginBottom: 20,
            }}>
                <Text style={{
                    fontSize: 30,
                    color: '#E2E4D7',
                    fontFamily: 'UbuntuMedium',
                }}>
                    Report List
                </Text>

                {userRole === "SUPER_ADMIN" && (
                    <TouchableOpacity
                        style={{
                            backgroundColor: '#E2E4D7',
                            borderRadius: 20,
                            paddingVertical: 8,
                            paddingHorizontal: 16,
                        }}
                        onPress={onPressCreateReport}
                    >
                        <Text style={{ color: '#0D241F', fontFamily: 'UbuntuBold' }}>+ Create Report</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Card Container */}
            <View style={{
                width: screenWidth * 0.9,
                height: 400,
                borderRadius: 20,
                overflow: 'hidden',
                backgroundColor: '#1B3935',
                position: 'relative',
                marginBottom: 20,
            }}>
                {/* Background Image */}
                <Image
                    source={require("../assets/image/CardReport.png")}
                    style={{
                        width: '100%',
                        height: '100%',
                        resizeMode: 'cover',
                        position: 'absolute',
                    }}
                />

                <View style={{ flex: 1, padding: 16, justifyContent: 'space-between' }}>

                    {/* Report List */}
                    <View style={{ flexGrow: 1 }}>
                        {loading ? (
                            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                <ActivityIndicator size="large" color="#E2E4D7" />
                            </View>
                        ) : (
                            currentReports.map((item, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={{
                                        backgroundColor: '#112725',
                                        borderRadius: 8,
                                        padding: 16,
                                        marginBottom: 12,
                                        elevation: 5,
                                 
                                    }}
                                    onPress={() => onPressReport(item)}
                                >
                                    <Text style={{ color: '#E2E4D7', fontSize: 16, fontFamily: 'UbuntuBold' }}>{item.reportName}</Text>
                                    <Text style={{ color: '#A0A0A0', paddingTop: 8, fontSize: 14, fontFamily: 'UbuntuLight' }}>{item.company?.name || 'No Company'}</Text>
                                </TouchableOpacity>
                            ))
                        )}
                    </View>

                    {/* Pagination & See More */}
                    <View style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginTop: 16,
                    }}>
                        {/* Prev Button */}
                        <TouchableOpacity
                            onPress={() => setPage(Math.max(0, page - 1))}
                            disabled={page === 0}
                            style={{
                                backgroundColor: page === 0 ? '#666' : '#112725',
                                borderRadius: 20,
                                paddingVertical: 6,
                                paddingHorizontal: 16,
                                borderWidth: 1,
                                borderColor: '#E2E4D7',
                            }}
                        >
                            <Text style={{ color: '#E2E4D7', fontFamily: 'UbuntuBold' }}>{"<"}</Text>
                        </TouchableOpacity>

                        {/* See More */}
                        {/* <TouchableOpacity
                            style={{
                                backgroundColor: '#112725',
                                borderWidth: 1,
                                borderColor: '#E2E4D7',
                                borderRadius: 20,
                                paddingVertical: 8,
                                paddingHorizontal: 20,
                            }}
                            onPress={onPressSeeMore}
                        >
                            <Text style={{ color: '#E2E4D7', fontFamily: 'UbuntuBold' }}>See More {'>>'}</Text>
                        </TouchableOpacity> */}

                        {/* Next Button */}
                        <TouchableOpacity
                            onPress={() => setPage(Math.min(totalPages - 1, page + 1))}
                            disabled={page === totalPages - 1}
                            style={{
                                backgroundColor: page === totalPages - 1 ? '#666' : '#112725',
                                borderRadius: 20,
                                paddingVertical: 6,
                                paddingHorizontal: 16,
                                borderWidth: 1,
                                borderColor: '#E2E4D7',
                            }}
                        >
                            <Text style={{ color: '#E2E4D7', fontFamily: 'UbuntuBold' }}>{">"}</Text>
                        </TouchableOpacity>
                    </View>

                </View>

                </View>
            </View>
    );
};

export default ReportList;
