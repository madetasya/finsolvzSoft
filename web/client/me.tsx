import React, { useState, useEffect } from "react";
import styled from "styled-components";
import TableCategory from "./TableCategory";
import TableMonth from "./TableMonth";

const CombinedTableWrapper = styled.div`
  display: flex;
  border: 1px solid #fff;
  width: 100%;
`;

const CategoryContainer = styled.div`
  flex: 0 0 auto;
  min-width: 300px;
  border-right: 1px solid #fff;
`;

const MonthContainer = styled.div`
  flex: 1;
  overflow-x: auto;
`;

interface TableProps {
    data: { [key: string]: string | number }[];
}

const Table: React.FC<TableProps> = ({ data }) => {
    const [, setRowCount] = useState(5);
    const [subCategoryCount, setSubCategoryCount] = useState(4);
    const [categoryData, setCategoryData] = useState<string[][]>(
        Array(5).fill(null).map(() => Array(4).fill(""))
    );

    const [monthData, setMonthData] = useState<string[][]>(
        Array.from({ length: 5 }, () => Array(12).fill(""))
    );

    useEffect(() => {
        if (data.length > 1) {
            console.log("Received Data:", data);

            const processedCategoryData: string[][] = [];
            const processedMonthData: string[][] = [];

            let maxSubcategoryCount = 0; 

            data.slice(1).forEach((item) => {
                const subcategories: string[] = [item.Subcategory?.toString() || ""]; // Tambahkan subkategori pertama dulu
                let monthStartIndex = "";

                const keys = Object.keys(item);

                for (const key of keys) {
                    if (key.startsWith("__EMPTY")) {
                        if (typeof item[key] === "string") {
                            subcategories.push(item[key].toString()); // Tambahkan subkategori lainnya
                        }
                    }
                    if (typeof item[key] === "number" && monthStartIndex === "") {
                        monthStartIndex = key; // Ini jadi titik awal bulan pertama yang ditemukan
                    }
                }

                // Pastikan maxSubcategoryCount update terus
                maxSubcategoryCount = Math.max(maxSubcategoryCount, subcategories.length);

                const categoryRow = [
                    item.Category?.toString() || "",
                    ...subcategories
                ];

                // Ambil 12 bulan dari titik start yang benar
                const monthRow: string[] = [];
                const monthStartIdx = keys.indexOf(monthStartIndex);

                if (monthStartIdx !== -1) {
                    for (let i = 0; i < 12; i++) {
                        const key = keys[monthStartIdx + i];
                        monthRow.push(item[key]?.toString() || ""); // Ambil 12 angka setelah start index
                    }
                }

                processedCategoryData.push(categoryRow);
                processedMonthData.push(monthRow);
            });

            // Pastikan semua kategori punya jumlah subkategori yang sama
            processedCategoryData.forEach((row) => {
                while (row.length < maxSubcategoryCount + 1) { // +1 untuk kolom kategori utama
                    row.push(""); // Tambahkan cell kosong jika kurang
                }
            });

            console.log("Processed Category Data:", processedCategoryData);
            console.log("Processed Month Data:", processedMonthData);

            setCategoryData(processedCategoryData);
            setMonthData(processedMonthData);
            setSubCategoryCount(maxSubcategoryCount); // Update header subkategori sesuai jumlah max
        }
    }, [data]);



    const handleAddRow = () => {
        setRowCount(prevCount => prevCount + 1);

        setCategoryData(prevData => [
            ...prevData,
            Array(subCategoryCount + 1).fill("")
        ]);
        setMonthData(prevData => [
            ...prevData,
            Array(12).fill("")
        ]);
    }

    const handleSubCategoryChange = (newCount: number, newData: string[][]) => {
        setSubCategoryCount(newCount);
        setCategoryData(newData);
    };

    const handleMonthDataChange = (newData: string[][]) => {
        setMonthData(newData);
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
                <TableMonth
                    tableData={monthData}
                    onDataChange={handleMonthDataChange}
                />
            </MonthContainer>
        </CombinedTableWrapper>
    );
};

export default Table;





//spare

// import React, { useState, useEffect } from "react";
// import styled from "styled-components";
// import TableCategory from "./TableCategory";
// import TableMonth from "./TableMonth";

// const CombinedTableWrapper = styled.div`
//   display: flex;
//   border: 1px solid #fff;
//   width: 100%;
// `;

// const CategoryContainer = styled.div`
//   flex: 0 0 auto;
//   min-width: 300px;
//   border-right: 1px solid #fff;
// `;

// const MonthContainer = styled.div`
//   flex: 1;
//   overflow-x: auto;
// `;

// interface TableProps {
//     data: { [key: string]: string | number }[];
// }

// const Table: React.FC<TableProps> = ({ data }) => {
//     const [, setRowCount] = useState(5);
//     const [subCategoryCount, setSubCategoryCount] = useState(4);
//     const [categoryData, setCategoryData] = useState<string[][]>(
//         Array(5).fill(null).map(() => Array(4).fill(""))
//     );

//     const [monthData, setMonthData] = useState<string[][]>(
//         Array.from({ length: 5 }, () => Array(12).fill(""))
//     );

//     useEffect(() => {
//         if (data.length > 1) { // Skip baris pertama yang hanya daftar bulan
//             console.log("Received Data:", data);

//             const processedCategoryData: string[][] = [];
//             const processedMonthData: string[][] = [];

//             let maxSubcategoryCount = 0; // Untuk mencari subkategori terbanyak

//             data.slice(1).forEach((item) => {
//                 // Cari batas akhir subkategori
//                 const mainCategory = item.Category?.toString() || "";
//                 const subcategories: string[] = [item.Subcategory?.toString() || ""]; // Tambahkan subkategori pertama dulu
//                 let monthStartIndex = "";

//                 const keys = Object.keys(item);
//                 let hasEmpty = false;


//                 for (const key of keys) {

//                     //subcategory
//                     if (item.Subcategory && !!key.startsWith("__EMPTY_") && !!key.startsWith("__EMPTY_1")) {
//                         if (typeof item[key] === "string") {
//                             subcategories.push(item[key].toString());
//                             subcategories.push("")
//                             hasEmpty = true;
//                         }
//                     }

//                     //subsubcategory
//                     if (key.startsWith("__EMPTY_1")) {
//                         if (hasEmpty) {
//                             subcategories.push(item[key].toString());
//                         }
//                     }


//                     if (typeof item[key] === "number" && monthStartIndex === "") {
//                         monthStartIndex = key;
//                     }
//                 }

//                 const filteredSubcategories = subcategories.filter(sub => sub !== mainCategory);

//                 maxSubcategoryCount = Math.max(maxSubcategoryCount, filteredSubcategories.length);

//                 // Susun data kategori + subkategori
//                 // const categoryRow = [
//                 //   mainCategory,
//                 //   ...filteredSubcategories
//                 // ];

//                 const monthRow: string[] = [];
//                 const monthStartIdx = keys.indexOf(monthStartIndex);

//                 if (monthStartIdx !== -1) {
//                     for (let i = 0; i < 12; i++) {
//                         const key = keys[monthStartIdx + i];
//                         monthRow.push(item[key]?.toString() || "");
//                     }
//                 }

//                 processedCategoryData.push([mainCategory, ...filteredSubcategories]);
//                 processedMonthData.push(monthRow);
//             });

//             // Pastikan semua kategori punya jumlah subkategori yang sama
//             processedCategoryData.forEach((row) => {
//                 while (row.length < maxSubcategoryCount + 1) { // +1 untuk kolom kategori utama
//                     row.push("");
//                 }
//             });

//             console.log("Processed Category Data:", processedCategoryData);
//             console.log("Processed Month Data:", processedMonthData);

//             setCategoryData(processedCategoryData);
//             setMonthData(processedMonthData);
//             setSubCategoryCount(maxSubcategoryCount); // Update header subkategori sesuai jumlah max
//         }
//     }, [data]);



//     const handleAddRow = () => {
//         setRowCount(prevCount => prevCount + 1);

//         setCategoryData(prevData => [
//             ...prevData,
//             Array(subCategoryCount + 1).fill("")
//         ]);
//         setMonthData(prevData => [
//             ...prevData,
//             Array(12).fill("")
//         ]);
//     }

//     const handleSubCategoryChange = (newCount: number, newData: string[][]) => {
//         setSubCategoryCount(newCount);
//         setCategoryData(newData);
//     };

//     const handleMonthDataChange = (newData: string[][]) => {
//         setMonthData(newData);
//     };

//     return (
//         <CombinedTableWrapper>
//             <CategoryContainer>
//                 <TableCategory
//                     tableData={categoryData}
//                     subCategoryCount={subCategoryCount}
//                     onDataChange={handleSubCategoryChange}
//                     onAddRow={handleAddRow}
//                 />
//             </CategoryContainer>
//             <MonthContainer>
//                 <TableMonth
//                     tableData={monthData}
//                     onDataChange={handleMonthDataChange}
//                 />
//             </MonthContainer>
//         </CombinedTableWrapper>
//     );
// };

// export default Table;


useEffect(() => {
    axios.get("http://localhost:5000/api/import-excel")  // Sesuaikan dengan backend API-mu
        .then((response) => {
            console.log("Data JSON dari backend:", response.data);

            // Konversi data ke format yang digunakan TableCategory & TableMonth
            const processedCategoryData = response.data.categories.map((item) => [
                item.category,
                ...item.subcategories
            ]);

            const processedMonthData = response.data.categories.map((item) =>
                Object.values(item.data)
            );

            setCategoryData(processedCategoryData);
            setMonthData(processedMonthData);
        })
        .catch((error) => console.error("Error fetching data:", error));
}, []);