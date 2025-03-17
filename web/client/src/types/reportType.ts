interface MonthData {
    [key: string]: number;
    January: number;
    February: number;
    March: number;
    April: number;
    May: number;
    June: number;
    July: number;
    August: number;
    September: number;
    October: number;
    November: number;
    December: number;
}

interface CategoryData {
    category: string;
    subcategory: string;
    data: MonthData;
}

interface ReportData {
    categories: CategoryData[];
}

interface TableRow {
    category: string;
    subcategories: string[];
    monthlyValues: string[];
    [key: string]: string | number | string[];
}
export type { ReportData, CategoryData, MonthData, TableRow };