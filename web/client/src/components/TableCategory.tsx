import React, { useState } from "react";
import styled from "styled-components";

const TableWrapper = styled.div`
    width: 100%;
  
    border: 1px solid #ccc;
     ::-webkit-scrollbar {
    display: none;
  }
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE & Edge */
`;

const StyledTable = styled.table`
    width: 100%;
    border-collapse: collapse;
    background: transparent;
    color: white;
`;

const TableHeader = styled.th`
    border: 1px solid #ccc;
    padding: 32px;
    background: #2c2c2c;
    color: white;
    text-align: center;
    position: sticky;
    top: 0;
    z-index: 2;
`;

const TableCell = styled.td`
    border: 1px solid #ccc;
    padding: 12px;
    min-width: 150px;
    text-align: left;
    position: relative;
`;

const InputField = styled.input`
    width: 100%;
    border: none;
    outline: none;
    background: transparent;
    color: white;
    text-align: left;
    appearance: none;
`;

const ContextMenu = styled.div`
    position: absolute;
    background: #333;
    color: white;
    border: 1px solid #555;
    padding: 5px;
    display: flex;
    flex-direction: column;
    z-index: 1000;
    cursor: pointer;
`;

const ContextMenuItem = styled.div`
    padding: 5px 10px;
    &:hover {
        background: #444;
    }
`;

interface TableCategoryProps {
    tableData: string[][];
    subCategoryCount: number;
    onDataChange: (subCategoryCount: number, tableData: string[][]) => void;
    onAddRow: () => void;
}

const TableCategory: React.FC<TableCategoryProps> = ({
    tableData,
    subCategoryCount,
    onDataChange,
    onAddRow
}) => {
    const [contextMenu, setContextMenu] = useState<{ x: number; y: number; rowIndex: number; colIndex: number } | null>(null);

    const handleInputChange = (rowIndex: number, colIndex: number, value: string) => {
        const newData = tableData.map((row, idx) => (idx === rowIndex ? [...row.slice(0, colIndex), value, ...row.slice(colIndex + 1)] : row));
        onDataChange(subCategoryCount, newData);
    };

    const handleAddColumn = () => {
        const newSubCategoryCount = subCategoryCount + 1;
        const newData = tableData.map(row => [...row, ""]);
        onDataChange(newSubCategoryCount, newData);
    };

    const handleDeleteColumn = (colIndex: number) => {
        const newSubCategoryCount = subCategoryCount - 1;
        const newData = tableData.map(row => row.filter((_, idx) => idx !== colIndex));
        onDataChange(newSubCategoryCount, newData);
    };

    const handleContextMenu = (event: React.MouseEvent, rowIndex: number, colIndex: number) => {
        event.preventDefault();
        setContextMenu({ x: event.clientX, y: event.clientY, rowIndex, colIndex });
    };

    const handleCloseContextMenu = () => {
        setContextMenu(null);
    };

    return (
        <TableWrapper onClick={handleCloseContextMenu}>
            <StyledTable onContextMenu={(e) => handleContextMenu(e, -1, -1)}>
                <thead>
                    <tr>
                        <TableHeader>Category</TableHeader>
                        {Array.from({ length: subCategoryCount }).map((_, index) => (
                            <TableHeader key={index}>Subcategory {index + 1}</TableHeader>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {tableData.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                            {row.map((cell, colIndex) => (
                                <TableCell key={colIndex}>
                                    <InputField type="text" value={cell} onChange={(e) => handleInputChange(rowIndex, colIndex, e.target.value)} />
                                </TableCell>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </StyledTable>
            {contextMenu && (
                <ContextMenu style={{ top: contextMenu.y, left: contextMenu.x }}>
                    <ContextMenuItem onClick={onAddRow}>Add Row</ContextMenuItem>
                    <ContextMenuItem onClick={() => handleAddColumn()}>Add Column</ContextMenuItem>
                    {contextMenu.colIndex > 0 &&
                        <ContextMenuItem onClick={() => handleDeleteColumn(contextMenu.colIndex)}>
                            Delete Column
                        </ContextMenuItem>
                    }
                </ContextMenu>
            )}
        </TableWrapper>
    );
};

export default TableCategory;