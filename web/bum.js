// import React, { useState } from "react";
// import * as XLSX from "xlsx";
// import styled from "styled-components";
// import Table from "../components/Table";

// const baseURL = import.meta.env.VITE_API_URL;

// const Container = styled.div`
//   width: 100vw;
//   height: 100vh;
//   padding: 20px;
//   background: linear-gradient(180deg, #041417 42.5%, #083339);
//   color: white;
//   display: flex;
//   flex-direction: column;
//   align-items: center;
//   box-sizing: border-box;
// `;

// const Header = styled.h2`
//   font-size: 24px;
//   margin-bottom: 20px;
//   color: #4aa5a5;
//   font-weight: bold;
// `;

// const ButtonContainer = styled.div`
//   display: flex;
//   flex-wrap: wrap;
//   gap: 15px;
//   margin-bottom: 20px;
//   align-items: center;
// `;

// const Button = styled.button<{ disabled?: boolean }>`
//   background: ${({ disabled }) => (disabled ? "#2c3e50" : "#4aa5a5")};
//   border: none;
//   padding: 12px 20px;
//   color: black;
//   font-weight: bold;
//   border-radius: 6px;
//   cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
//   transition: 0.3s;
//   &:hover {
//     background: ${({ disabled }) => (disabled ? "#2c3e50" : "#3a8c8c")};
//   }
// `;

// const HiddenInput = styled.input`
//   display: none;
// `;

// const FileName = styled.span`
//   color: #4aa5a5;
//   font-weight: bold;
// `;

// const TableWrapper = styled.div`
//   width: 80%;
//   max-width: 900px;
//   margin-top: 20px;
// `;

// const JSONOutput = styled.pre`
//   text-align: left;
//   max-width: 900px;
//   width: 100%;
//   background: #1e2a38;
//   color: #d1d1d1;
//   padding: 15px;
//   border-radius: 8px;
//   margin-top: 20px;
//   overflow-x: auto;
//   font-size: 14px;
// `;

// const Input = styled.input<{ $inputColor?: string }>`
//   width: 100%;
//   padding: 12px;
//   border-radius: 8px;
//   border: 1px solid #ccc;
//   outline: none;
//   font-size: 14px;
//   background-color: ${(props) => props.$inputColor || "#f0f0f0"};
//   text-align: left;

//   &:focus {
//     border-color: #4aa5a5;
//   }
// `;

// const ReportInput: React.FC = () => {
//   const [tableData, setTableData] = useState<string[][]>(
//     Array.from({ length: 3 }, () => Array(3).fill(""))
//   );

//   const [jsonData, setJsonData] = useState<object | null>(null);
//   const [inputMethod, setInputMethod] = useState<"manual" | "excel" | null>(null);
//   const [fileName, setFileName] = useState<string>("");

//   const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
//     const file = event.target.files?.[0];
//     if (!file) return;

//     setFileName(file.name);

//     const reader = new FileReader();
//     reader.onload = (e) => {
//       const data = new Uint8Array(e.target?.result as ArrayBuffer);
//       const workbook = XLSX.read(data, { type: "array" });
//       const sheet = workbook.Sheets[workbook.SheetNames[0]];
//       const parsedData: string[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

//       setTableData(parsedData);
//       setInputMethod("excel");
//     };
//     reader.readAsArrayBuffer(file);
//   };

//   const handleProcessData = async () => {
//     if (!tableData || tableData.length === 0) {
//       alert("No data to process!");
//       return;
//     }

//     console.log("📨 Sending rawJson:", { rawJson: tableData });

//     try {
//       const response = await fetch(`${baseURL}/gemini`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${localStorage.getItem("token")}` // Ensure token is added if needed
//         },
//         body: JSON.stringify({ rawJson: tableData }),
//       });

//       if (!response.ok) {
//         const errorData = await response.json();
//         console.error("❌ Server Error:", errorData);
//         throw new Error(`Server Error: ${response.status} ${response.statusText}`);
//       }

//       const data = await response.json();
//       console.log("✅ Processed Data:", data);
//       setJsonData(data);
//       alert("Data processed successfully!");
//     } catch (error) {
//       console.error("❌ Error processing data:", error);
//       alert("Failed to process data.");
//     }
//   };

//   return (
//     <Container>
//       <Header>📊 Report Data Input</Header>

//       <ButtonContainer>
//         <HiddenInput type="file" accept=".xlsx" id="fileUpload" onChange={handleFileUpload} />
//         <Button onClick={() => document.getElementById("fileUpload")?.click()} disabled={inputMethod === "manual"}>
//           📂 Scan Excel File
//         </Button>
//         {fileName && <FileName>{fileName}</FileName>}
//         <Button onClick={() => setInputMethod("manual")} disabled={inputMethod === "excel"}>
//           ✏️ Input Manually
//         </Button>
//       </ButtonContainer>

//       {inputMethod === "manual" && (
//         <TableWrapper>
//           <Table tableData={tableData} setTableData={setTableData} />
//         </TableWrapper>
//       )}

//       <Button onClick={handleProcessData}>🚀 Process Data & Send to Gemini</Button>

//       {jsonData && <JSONOutput>{JSON.stringify(jsonData, null, 2)}</JSONOutput>}
//     </Container>
//   );
// };

// export default ReportInput;