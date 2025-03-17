import { ReportData, MonthData } from "../types/reportType";

const formatExcel = (rawData: (string | number)[][]): ReportData => {
    const monthHeaders = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    return {
        categories: rawData.slice(1).map(row => {
            const category = String(row[0]) || "Unknown";
            const subcategory = String(row[1]) || "Unknown"; 


            const data: MonthData = monthHeaders.reduce((acc, month, index) => {
                acc[month] = Number(row[index + 5]) || 0;
                return acc;
            }, {} as MonthData);

            return { category, subcategory, data };
        })
    };
};

export default formatExcel;
