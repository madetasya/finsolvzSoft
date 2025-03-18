import React, { useEffect, useState } from "react";
import axios from "axios";
import styled from "styled-components";

const Card = styled.div`
  background: #2c2c2c;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  color: white;
  width: 600px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
`;

const Row = styled.div`
  display: flex;
  width: 100%;
  gap: 16px;
`;

const Column = styled.div`
  flex: 1;
`;

const Label = styled.label`
  display: block;
  font-size: 14px;
  margin-bottom: 5px;
`;

const Input = styled.input`
  width: 100%;
  padding: 8px;
  border-radius: 5px;
  border: none;
  background: #444;
  color: white;
`;

const Select = styled.select`
  width: 100%;
  padding: 8px;
  border-radius: 5px;
  border: none;
  background: #444;
  color: white;
`;

const BoxList = styled.div`
  height: 150px;
  background: #444;
  border-radius: 5px;
  padding: 8px;
  overflow-y: auto;
`;

const ListItem = styled.div<{ selected: boolean }>`
  padding: 8px;
  background: ${(props) => (props.selected ? "#555" : "transparent")};
  border-radius: 5px;
  cursor: pointer;
  &:hover {
    background: #666;
  }
`;

const Note = styled.p`
  font-size: 12px;
  margin-top: -2px;
  color: #f4f4f4;
`;

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
    const API_URL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        const token = localStorage.getItem("token");

        axios
            .get(`${API_URL}/company`, { headers: { Authorization: `Bearer ${token}` } })
            .then((res) => setCompanies(Array.isArray(res.data) ? res.data : []))
            .catch(() => setCompanies([]));

        axios
            .get(`${API_URL}/reportTypes`, { headers: { Authorization: `Bearer ${token}` } })
            .then((res) => setReportTypes(Array.isArray(res.data) ? res.data : []))
            .catch(() => setReportTypes([]));

        axios
            .get(`${API_URL}/users`, { headers: { Authorization: `Bearer ${token}` } })
            .then((res) => setUsers(Array.isArray(res.data) ? res.data : []))
            .catch(() => setUsers([]));
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
            <Input type="text" value={reportName} onChange={(e) => setReportName(e.target.value)} placeholder="Report Name" />

            <Input type="text" value={currency} onChange={(e) => setCurrency(e.target.value)} placeholder="Currency" />

            <Row>
                <Column>
                    <Label>Report Type</Label>
                    <Select value={selectedReportType} onChange={(e) => setSelectedReportType(e.target.value)}>
                        <option value="">Select report type</option>
                        {reportTypes.map((type) => (
                            <option key={type._id} value={type._id}>
                                {type.name}
                            </option>
                        ))}
                    </Select>
                </Column>

                <Column>
                    <Label>Year</Label>
                    <Input type="number" value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))} />
                </Column>
            </Row>

            <Row>
                <Column>
                    <Label>Company</Label>
                    <BoxList>
                        {companies.map((company) => (
                            <ListItem
                                key={company._id}
                                selected={selectedCompany === company._id}
                                onClick={() => setSelectedCompany(company._id)}
                            >
                                {company.name}
                            </ListItem>
                        ))}
                    </BoxList>
                </Column>

                <Column>
                    <Label>User Access</Label>
                    <BoxList>
                        {users.map((user) => (
                            <ListItem
                                key={user._id}
                                selected={selectedUsers.includes(user._id)}
                                onClick={() => {
                                    if (selectedUsers.includes(user._id)) {
                                        setSelectedUsers(selectedUsers.filter((id) => id !== user._id));
                                    } else {
                                        setSelectedUsers([...selectedUsers, user._id]);
                                    }
                                }}
                            >
                                {user.name}
                            </ListItem>
                        ))}
                    </BoxList>
                    <Note>Press Ctrl to choose more users</Note>
                </Column>
            </Row>
        </Card>
    );
};

export default ReportDetailCard;
