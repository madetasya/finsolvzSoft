import React, { useState, useEffect } from "react";
import styled from "styled-components";
import TableCategory from "./TableCategory";
import TableMonth from "./TableMonth";

const CombinedTableWrapper = styled.div`
  display: flex;
  border: 1px solid #fff;
  width: 1590px;
   ::-webkit-scrollbar {
    display: none;
  }
  scrollbar-width: none; 
  -ms-overflow-style: none;
`;

const CategoryContainer = styled.div`
  flex: 0 0 auto;
  min-width: 300px;
  border-right: 1px solid #fff;
`;

const MonthContainer = styled.div`
  flex: 1;
  overflow-x: auto;
  position: relative;
`;

interface TableProps {
  data: Record<string, string | number>[];
  onCategoryDataChange: React.Dispatch<React.SetStateAction<string[][]>>;
  onMonthDataChange: React.Dispatch<React.SetStateAction<string[][]>>;
}

const Table: React.FC<TableProps> = ({ data, onCategoryDataChange, onMonthDataChange }) => {
  const [subCategoryCount, setSubCategoryCount] = useState(5);
  const [categoryData, setCategoryData] = useState<string[][]>(Array(5).fill(Array(6).fill("")));
  const [monthData, setMonthData] = useState<string[][]>(Array(5).fill(Array(12).fill("")));

  useEffect(() => {
    if (data.length <= 1) return;

    console.log("Data loaded >>>>>", data);

    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    const headerRow = data[0];
    const monthHeaders = Object.values(headerRow)
      .map(value => {
        if (value !== undefined) {
          return value.toString().trim();
        } else {
          return "";
        }
      })
      .filter(value => {
        if (months.indexOf(value) > -1) {
          return true;
        } else {
          return false;
        }
      });

    const monthIndexMap: { [key: string]: string } = {};
    Object.entries(headerRow).forEach(([key, value]) => {
      let monthName = "";
      if (value !== undefined) {
        monthName = value.toString().trim();
      }
      if (monthHeaders.indexOf(monthName) > -1) {
        monthIndexMap[monthName] = key;
      }
    });

    let maxSubcategoryCount = 0;
    const processedCategoryData: string[][] = [];
    const processedMonthData: string[][] = [];

    data.slice(1).forEach((item) => {
      let category = "";
      if (item.Category !== undefined) {
        category = item.Category.toString().trim();
      }
      const subcategories = Array.from({ length: 5 }, (_, i) => {
        if (item["Subcategory " + (i + 1)] !== undefined) {
          return item["Subcategory " + (i + 1)].toString().trim();
        } else {
          return "";
        }
      });

      if (subcategories.every(sub => sub === "")) {
        // Jika semua kosong, gunakan string kosong
        for (let i = 0; i < subcategories.length; i++) {
          subcategories[i] = "";
        }
      }

      if (subcategories.length > maxSubcategoryCount) {
        maxSubcategoryCount = subcategories.length;
      }
      processedCategoryData.push([category, ...subcategories]);

      const monthRow = monthHeaders.map(month => {
        const monthKey = monthIndexMap[month];
        if (monthKey) {
          if (item[monthKey] !== undefined) {
            return item[monthKey].toString().trim();
          } else {
            return "";
          }
        } else {
          return "0";
        }
      });

      // Pastikan data bulan berbentuk string
      const convertedRow: string[] = [];
      for (let i = 0; i < monthRow.length; i++) {
        convertedRow[i] = monthRow[i].toString();
      }
      processedMonthData.push(convertedRow);
    });

    console.log("Category Data:", processedCategoryData);
    console.log("Month Data:", processedMonthData);

    setCategoryData(processedCategoryData);
    setMonthData(processedMonthData);
    setSubCategoryCount(maxSubcategoryCount);

    // Kirim data ke parent melalui callback
    onCategoryDataChange(processedCategoryData);
    onMonthDataChange(processedMonthData);
  }, [data, onCategoryDataChange, onMonthDataChange]);

  const handleAddRow = () => {
    const newCategoryData = [...categoryData, Array(subCategoryCount + 1).fill("")];
    const newMonthData = [...monthData, Array(12).fill("")];
    setCategoryData(newCategoryData);
    setMonthData(newMonthData);
    onCategoryDataChange(newCategoryData);
    onMonthDataChange(newMonthData);
  };

  const handleSubCategoryChange = (newCount: number, newData: string[][]) => {
    setSubCategoryCount(newCount);
    setCategoryData(newData);
    onCategoryDataChange(newData);
  };

  const handleMonthDataChange = (newData: string[][]) => {
    setMonthData(newData);
    onMonthDataChange(newData);
  };

  return (
    <CombinedTableWrapper>
      <CategoryContainer>
        <TableCategory
          tableData={categoryData}
          subCategoryCount={subCategoryCount}
          onDataChange={handleSubCategoryChange}
          onAddRow={handleAddRow}
        />
      </CategoryContainer>

      <MonthContainer>
        <TableMonth tableData={monthData} onDataChange={handleMonthDataChange} />
      </MonthContainer>
    </CombinedTableWrapper>
  );
};

export default Table;
