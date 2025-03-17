import React, { useState } from "react";
import styled from "styled-components";
import * as XLSX from "xlsx";
import axios from "axios";
import Table from "../components/Table";
import ReportDetailCard from "../components/ReportDetailCard";

const Button = styled.button`
  background-color: transparent;
  color: white;
  border: 1px solid #4aa5a5;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  margin-right: 10px;
`;

const FileInput = styled.input`
  display: none;
`;

const Label = styled.label`
  background-color: transparent;
  color: white;
  border: 1px solid #4aa5a5;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  &:hover {
    background-color: #4aa5a5;
    color: #fff;
  }
`;
const API_URL = import.meta.env.VITE_API_URL;
const CreateReport: React.FC = () => {
    const [fileName, setFileName] = useState<string | null>(null);
    const [tableData, setTableData] = useState<Record<string, string | number>[]>([]);
    const [categoryData, setCategoryData] = useState<string[][]>([]);
    const [monthData, setMonthData] = useState<string[][]>([]);

    // State dari ReportDetailCard
    const [reportDetails, setReportDetails] = useState({
        reportName: "",
        selectedCompany: "",
        selectedReportType: "",
        selectedYear: new Date().getFullYear(),
        currency: "",
        selectedUsers: [] as string[],
    });

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            const file = event.target.files[0];
            setFileName(file.name);
            readExcel(file);
        }
    };

    const readExcel = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const data = new Uint8Array(e.target?.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: "array" });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json<Record<string, string | number>>(worksheet);

            setTableData(jsonData);
        };
        reader.readAsArrayBuffer(file);
    };

    const handleSubmit = async () => {
        const token = localStorage.getItem("token");

        const months = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];

        const formattedMonthData = Object.fromEntries(
            months.map((month, monthIndex) => [
                month,
                categoryData.map((row, index) => {
                    const rawValue = monthData[index]?.[monthIndex];
                    const parsedValue = parseFloat(rawValue?.toString().replace(",", ".") || "0");
                    return { category: row[0]?.trim() || "Unknown", value: isNaN(parsedValue) ? 0 : parsedValue };
                }).filter(item => item.category !== "Unknown" || item.value !== 0)
            ])
        );

        const payload = {
            reportName: reportDetails.reportName,
            reportType: reportDetails.selectedReportType,
            year: reportDetails.selectedYear,
            company: reportDetails.selectedCompany,
            currency: reportDetails.currency,
            categories: categoryData.map(row => row[0]?.trim() || "Unknown"),
            subcategories: categoryData.map(row => row.slice(1).map(sub => sub.trim() || "Unknown")).flat(),
            monthData: formattedMonthData,
            userAccess: reportDetails.selectedUsers,
        };

        console.log("🚀 Payload yang dikirim ke backend:", JSON.stringify(payload, null, 2));

        try {
         
            const response = await axios.post(`${API_URL}/reports`, payload, {
            headers: { Authorization: `Bearer ${token}` },
            });

            console.log("✅ Report created successfully:", response.data);
            alert("Report saved successfully!");
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                console.error("❌ Error saving report:", error.response?.data || error.message);
                alert(`Failed to save report: ${error.response?.data?.error || error.message}`);
            } else {
                console.error("❌ Error saving report:", error);
                alert(`Failed to save report: ${error}`);
            }
        }
    };


    return (
        <div>
            <h1>Create Report</h1>
            <ReportDetailCard onDataChange={setReportDetails} />
            <Label htmlFor="file-upload">Upload Excel</Label>
            <FileInput id="file-upload" type="file" accept=".xlsx, .xls" onChange={handleFileChange} />
            {fileName && <p>Uploaded file: {fileName}</p>}
            <Table
                data={tableData}
                onCategoryDataChange={setCategoryData}
                onMonthDataChange={setMonthData}
            />
            <Button onClick={handleSubmit}>Save Report</Button>
        </div>
    );
};

export default CreateReport;
