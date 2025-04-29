import { useState, useEffect } from "react"
import * as XLSX from "xlsx"
import { Input } from "@/components/ui/input"
// import {
//     Table, TableBody, TableCell,
//     TableHead, TableHeader, TableRow
// } from "@/components/ui/table"
import styled from "styled-components"

const InputStyled = styled.input`
  width: 100%;
  height: 100%;
  padding: 0 0.5rem;
  margin: 0;
  border: 1px solid transparent;
  outline: none;
  font-size: inherit;
  background: transparent;
  display: block;
  box-sizing: border-box;
  border-radius: 4px;
`


export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
`

export const TableHeader = styled.thead`
  background-color: #f9f9f9;
`

export const TableBody = styled.tbody``

export const TableRow = styled.tr`
  &:hover {
    background-color: #f3f4f6;
  }
`

export const TableHead = styled.th`
    padding: 8px;
    border: 1px solid #e5e7eb;
    text-align: left;
    font-weight: 600;
    font-size: 16px;
    background-color: #f1f5f9;
    height: 40px;
    box-sizing: border-box;
`

export const TableCell = styled.td`
    padding: 8px;
    border: 1px solid #e5e7eb;
    font-size: 16px;
    height: 40px;
    vertical-align: middle;
    box-sizing: border-box;
    position: relative;
`

const defaultHeader = [
    "Category", "Subcategory1", "Subcategory2", "Subcategory3",

]

const CreateReport = () => {
    const [jsonHeader, setJsonHeader] = useState<string[]>(defaultHeader.map(String))
    const [jsonData, setJsonData] = useState<(string | number | null)[][]>([])
    const [editingCell, setEditingCell] = useState<{ row: number; col: number } | null>(null);
    const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
    const [editingHeaderIndex, setEditingHeaderIndex] = useState<number | string | null>(null);

    const [initialJsonData, setInitialJsonData] = useState<(string | number | null)[][]>([]);
    const isDataModified = JSON.stringify(jsonData) !== JSON.stringify(initialJsonData)


    useEffect(() => {

        if (jsonData.length === 0) {
            const defaultRows = Array.from({ length: 3 }, () => Array(jsonHeader.length).fill(""));
            setJsonData(defaultRows);
            setInitialJsonData(JSON.parse(JSON.stringify(defaultRows)));
        }
    }, [jsonData.length, jsonHeader.length]);

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file)
            return

        const reader = new FileReader()
        reader.onload = (event) => {
            const data = event.target?.result
            const workbook = XLSX.read(data, { type: "binary" })
            const sheetName = workbook.SheetNames[0]
            const worksheet = workbook.Sheets[sheetName]
            const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 })

            console.log("THIS IS JSON >>>>>>", json)

            const [headerRow, ...bodyRow] = json as (string | number | null)[][]
            const headers = headerRow.map(cell => String(cell ?? ""))
            const bodyTable = bodyRow.map((row: (string | number | null)[]) =>
                Array.from({ length: headerRow.length }, (_, i) =>
                    row[i] === undefined ? "" : row[i]
                )
            )

            console.log("THIS IS HEADEEEERRRR>>>>>>", headers)
            console.log("THIS IS BODY >>>>>>", bodyTable)

            setJsonHeader(headers.map(String))
            setJsonData(bodyTable)
            setInitialJsonData(JSON.parse(JSON.stringify(bodyTable)))


        }

        reader.readAsBinaryString(file)
    }
    const fallbackSelectedCell = {
        row: jsonData.length - 1,
        col: jsonHeader.length - 1,
    };

    const addRow = (position: "above" | "below") => {
        const { row } = selectedCell ?? fallbackSelectedCell;
        const rowLength = jsonHeader.length;
        const newRow = Array(rowLength).fill("");
        const updated = [...jsonData];

        const insertIndex = position === "above" ? row : row + 1;
        updated.splice(insertIndex, 0, newRow);

        setJsonData(updated);
    };


    const addColumn = (position: "left" | "right") => {
        const { col } = selectedCell ?? fallbackSelectedCell;
        const updatedHeader = [...jsonHeader];
        const newHeader = "";

        const insertIndex = position === "left" ? col : col + 1;
        updatedHeader.splice(insertIndex, 0, newHeader);

        const updatedData = jsonData.map((row) => {
            const newRow = [...row];
            newRow.splice(insertIndex, 0, "");
            return newRow;
        });

        setJsonHeader(updatedHeader.map(String));
        setJsonData(updatedData);
    };

    const deleteRow = () => {
        if (!selectedCell) return;
        if (jsonData.length <= 1) 
            return alert("You can't do that >:(");

        const updated = [...jsonData];
        updated.splice(selectedCell.row, 1);
        setJsonData(updated);
        setSelectedCell(null);
    };

    const deleteColumn = () => {
        if (!selectedCell) return;
        if (jsonHeader.length <= 1) return alert("You can't do that >:(");

        const updatedHeader = [...jsonHeader];
        updatedHeader.splice(selectedCell.col, 1);

        const updatedData = jsonData.map((row) => {
            const newRow = [...row];
            newRow.splice(selectedCell.col, 1);
            return newRow;
        });

        setJsonHeader(updatedHeader);
        setJsonData(updatedData);
        setSelectedCell(null);
    };


    return (
        <div>
            <h1 className="text-xl font-bold mb-4">Create Report</h1>

            <Input id="xlsx" type="file" accept=".xlsx" onChange={handleFile} className="mb-4" />

            {isDataModified && (
                <button
                    onClick={() => {
                        console.log("Data yang disimpan:", jsonData)
                        // TODO: Tambahkan save ke backend
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded mb-4"
                >
                    Save
                </button>
            )}

            <div className="flex flex-wrap gap-2 mb-4">
                <button onClick={() => addRow("above")} className="px-3 py-1 bg-gray-100 text-amber-100 rounded border">
                    ➕ Add Row Above
                </button>
                <button onClick={() => addRow("below")} className="px-3 py-1 bg-gray-100  text-amber-100 rounded border">
                    ➕ Add Row Below
                </button>
                <button onClick={() => addColumn("left")} className="px-3 py-1 bg-gray-100  text-amber-100 rounded border">
                    ➕ Add Column Left
                </button>
                <button onClick={() => addColumn("right")} className="px-3 py-1 bg-gray-100  text-amber-100 rounded border">
                    ➕ Add Column Right
                </button>
                <button
                    onClick={deleteRow}
                    disabled={!selectedCell}
                    className="px-3 py-1 bg-red-100 text-red-800 rounded border"
                >
                    🗑️ Delete Row
                </button>
                <button
                    onClick={deleteColumn}
                    disabled={!selectedCell}
                    className="px-3 py-1 bg-red-100 text-red-800 rounded border"
                >
                    🗑️ Delete Column
                </button>

            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        {jsonHeader.map((_, i) => (
                            <TableHead
                                key={i}
                                onClick={() => setEditingHeaderIndex(i)}
                                className="cursor-pointer"
                            >
                                {editingHeaderIndex === i ? (
                                    <InputStyled

                                        autoFocus
                                        value={jsonHeader[i] ?? ""}
                                        onBlur={() => setEditingCell(null)}
                                        onChange={(e) => {
                                            const updatedHeader = [...jsonHeader];
                                            updatedHeader[i] = e.target.value;
                                            setJsonHeader(updatedHeader);
                                        }}
                                    />

                                ) : (
                                    jsonHeader[i] ?? ""
                                )}
                            </TableHead>

                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {(jsonData.length === 0 ? [Array(jsonHeader.length).fill("")] : jsonData).map((row, rowIndex) => (
                        <TableRow key={rowIndex}>
                            {row.map((cell, cellIndex) => {
                                const isEditing = editingCell?.row === rowIndex && editingCell?.col === cellIndex;

                                return (
                                    <TableCell
                                        key={cellIndex}
                                        onClick={() => {
                                            setEditingCell({ row: rowIndex, col: cellIndex });
                                            setSelectedCell({ row: rowIndex, col: cellIndex });
                                        }}
                                        style={{
                                            padding: 0,
                                            border: isEditing ? "2px solid rgba(0,0,0,0.2)" : "1px solid #e5e7eb",
                                        }}
                                    >
                                        {isEditing ? (
                                            <InputStyled
                                                autoFocus
                                                value={String(cell ?? "")}
                                                onBlur={() => setEditingCell(null)}
                                                onChange={(e) => {
                                                    const updatedData = [...jsonData];
                                                    updatedData[rowIndex][cellIndex] = e.target.value;
                                                    setJsonData(updatedData);
                                                }}
                                            />
                                        ) : (
                                            cell ?? ""
                                        )}
                                    </TableCell>
                                );
                            })}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}

export default CreateReport
