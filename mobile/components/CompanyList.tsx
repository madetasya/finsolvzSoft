import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from "react-native";

const screenWidth = Dimensions.get('window').width;
const cardWidth = screenWidth - 32; // Full width minus padding

interface CompanyItem {
    _id: string;
    name: string;
}

interface CompanyListProps {
    companies: CompanyItem[];
    onPressCompany: (company: CompanyItem) => void; 
    onAddCompany: () => void; 
    userRole: string | null;
}

const ITEMS_PER_PAGE = 4;

const CompanyList: React.FC<CompanyListProps> = ({ companies, onPressCompany, onAddCompany, userRole }) => {
    const [companyCreateModalVisible, setCompanyCreateModalVisible] = useState(false);
    const [page, setPage] = useState(0);

    const totalPages = Math.ceil(companies.length / ITEMS_PER_PAGE);

    const currentCompanies = companies.slice(
        page * ITEMS_PER_PAGE,
        page * ITEMS_PER_PAGE + ITEMS_PER_PAGE
    );

    return (
        <View style={styles.wrapper}>
            {/* Header */}
            <View style={styles.headerRow}>
                <Text style={styles.sectionTitle}>Company List</Text>
                {userRole === "SUPER_ADMIN" && (
                    <View style={styles.buttonRow}>
                        <TouchableOpacity style={styles.addButton} onPress={onAddCompany}>
                            <Text style={styles.addButtonText}>+ Add Company</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            {/* Company List */}
            <View style={styles.companyBox}>
                {currentCompanies.map((company) => (
                    <TouchableOpacity
                        key={company._id}
                        style={styles.companyCard}
                        onPress={() => onPressCompany(company)}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.companyName} numberOfLines={1} ellipsizeMode="tail">
                            {company.name}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Pagination Fixed */}
            <View style={styles.paginationWrapper}>
                <TouchableOpacity
                    style={[styles.paginationButton, page === 0 && styles.disabledButton]}
                    onPress={() => setPage(Math.max(0, page - 1))}
                    disabled={page === 0}
                >
                    <Text style={styles.paginationButtonText}>{"<"}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.paginationButton, page === totalPages - 1 && styles.disabledButton]}
                    onPress={() => setPage(Math.min(totalPages - 1, page + 1))}
                    disabled={page === totalPages - 1}
                >
                    <Text style={styles.paginationButtonText}>{">"}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        marginTop:80,
        width: '100%',
        minHeight: Dimensions.get('window').height - 280,
        backgroundColor: '#011414',
        paddingHorizontal: 16,
        paddingTop: 20,
        paddingBottom: 80, 
        position: 'relative',
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 56,
        marginTop:8
    },
    sectionTitle: {
        color: '#E2E4D7',
        fontFamily: 'UbuntuMedium',
        fontSize: 32,
    },
    buttonRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    addButton: {
        backgroundColor: '#E2E4D7',
        borderRadius: 20,
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    addButtonText: {
        color: '#0D241F',
        fontFamily: 'UbuntuBold',
        fontSize: 14,
    },
    seeMoreButton: {
        backgroundColor: '#112725',
        borderWidth: 1,
        borderColor: '#E2E4D7',
        borderRadius: 20,
        paddingVertical: 8,
        paddingHorizontal: 20,
    },
    seeMoreButtonText: {
        color: '#E2E4D7',
        fontFamily: 'UbuntuBold',
        fontSize: 14,
    },
    companyBox: {
        gap: 12,
    },
    companyCard: {
        width: '100%',
        height: 60,
        backgroundColor: '#314E4A',
        borderRadius: 8,
        justifyContent: 'center',
        paddingHorizontal: 12,
    },
    companyName: {
        color: '#E2E4D7',
        fontFamily: 'UbuntuBold',
        fontSize: 14,
    },
    paginationWrapper: {
        position: 'absolute',
        right: 16,
        bottom: 16,
        flexDirection: 'row',
        gap: 12,
    },
    paginationButton: {
        backgroundColor: '#1B3935',
        paddingVertical: 6,
        paddingHorizontal: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#4B7F76',
    },
    paginationButtonText: {
        color: '#E2E4D7',
        fontFamily: 'UbuntuBold',
        fontSize: 16,
    },
    disabledButton: {
        backgroundColor: '#666',
        borderColor: '#999',
    },
});

export default CompanyList;
