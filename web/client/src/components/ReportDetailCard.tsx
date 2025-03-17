import React, { useEffect, useState } from "react";
import axios from "axios";
import styled from "styled-components";

const Card = styled.div`
  background: #2c2c2c;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  color: white;
  width: 400px;
`;

const Title = styled.h2`
  margin-bottom: 24px;
  color: #fff;
`;

const Label = styled.label`
  display: block;
  margin-top: 10px;
  font-size: 14px;
  padding-top: 16px;
`;

const Select = styled.select`
  width: 96%;
  padding: 8px;
  margin-top: 5px;
  border-radius: 5px;
  border: none;
  background: #444;
  color: white;
`;

const Input = styled.input`
  width: 90%;
  padding: 8px;
  margin-top: 5px;
  border-radius: 5px;
  border: none;
  background: #444;
  color: white;
`;

// const Button = styled.button`
//   margin-top: 20px;
//   width: 100%;
//   padding: 10px;
//   background: #06272b;
//   border: none;
//   border-radius: 5px;
//   cursor: pointer;
//   color: white;
//   font-weight: bold;
//   &:hover {
//     background: #4a54e1;
//   }
// `;

interface ReportType {
    _id: string;
    name: string;
}

interface Company {
    _id: string;
    name: string;
}

interface User {
    _id: string;
    name: string;
}

// 🛠️ Tambahkan interface untuk props
interface ReportDetailCardProps {
    onDataChange: (data: {
        reportName: string;
        selectedCompany: string;
        selectedReportType: string;
        selectedYear: number;
        currency: string;
        selectedUsers: string[];
    }) => void;
}

const ReportDetailCard: React.FC<ReportDetailCardProps> = ({ onDataChange }) => {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [reportTypes, setReportTypes] = useState<ReportType[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [reportName, setReportName] = useState("");
    const [selectedCompany, setSelectedCompany] = useState("");
    const [selectedReportType, setSelectedReportType] = useState("");
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [currency, setCurrency] = useState("");
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const API_URL = import.meta.env.VITE_API_URL 
    useEffect(() => {
        const token = localStorage.getItem("token")


        axios.get(`${API_URL}/company`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => {
                console.log("API Response Data Type:", typeof res.data);
                console.log("API Response:", res.data);

                if (typeof res.data !== "object") {
                    console.error("Unexpected API Response:", res.data);
                    setCompanies([]);
                } else {
                    setCompanies(res.data);
                }
            })
            .catch((error) => {
                console.error("Error fetching companies:", error);
                setCompanies([]);
            });

        axios.get(`${API_URL}/reportTypes`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => {
                console.log("Report Type API Response:", res.data); 
                setReportTypes(Array.isArray(res.data) ? res.data : []);
            })
            .catch((error) => {
                console.error("Error fetching report types:", error);
                setReportTypes([]);
            });

        axios.get(`${API_URL}/users`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => {
                console.log("Users API Response:", res.data); 
                setUsers(Array.isArray(res.data) ? res.data : []);
            })
            .catch((error) => {
                console.error("Error fetching users:", error);
                setUsers([]);
            });

    }, [API_URL]);


    useEffect(() => {
        onDataChange({
            reportName,
            selectedCompany,
            selectedReportType,
            selectedYear,
            currency,
            selectedUsers,
        });
    }, [reportName, selectedCompany, selectedReportType, selectedYear, currency, selectedUsers, onDataChange]);

    return (
        <Card>
            <Title>Create Report</Title>

            <Label>Report Name</Label>
            <Input
                type="text"
                value={reportName}
                onChange={(e) => setReportName(e.target.value)}
                placeholder="Enter report name"
            />

            <Label>Company</Label>
            <Select value={selectedCompany} onChange={(e) => setSelectedCompany(e.target.value)}>
                <option value="">Select a company</option>
                {Array.isArray(companies) ? (
                    companies.map((company) => (
                        <option key={company._id} value={company._id}>{company.name}</option>
                    ))
                ) : (
                    <option disabled>Loading companies...</option>
                )}
            </Select>


            <Label>Report Type</Label>
            <Select value={selectedReportType} onChange={(e) => setSelectedReportType(e.target.value)}>
                <option value="">Select report type</option>
                {reportTypes.map((type) => (
                    <option key={type._id} value={type._id}>{type.name}</option>
                ))}
            </Select>

            <Label>Year</Label>
            <Input type="number" value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))} />

            <Label>Currency</Label>
            <Input
                type="text"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                placeholder="e.g., USD, EUR, IDR"
            />

            <Label>User Access</Label>
            <Select multiple value={selectedUsers} onChange={(e) => {
                const selectedValues = Array.from(e.target.selectedOptions, (option) => option.value);
                setSelectedUsers(selectedValues);
            }}>
                {users.map((user) => (
                    <option key={user._id} value={user._id}>{user.name}</option>
                ))}
            </Select>
            <p>Press Ctrl to choose more user</p>
        </Card>
    );
};

export default ReportDetailCard;
