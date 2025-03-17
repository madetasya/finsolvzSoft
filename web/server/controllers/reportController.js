import { Report } from "../models/ReportModel.js";
import redis from "../config/redis.js";
import { calculateCategoryTotal } from "../helpers/categoryTotalValue.js";
import xlsx from "xlsx";
import mongoose from "mongoose";
import ReportTypeModel from "../models/ReportTypeModel.js";

export const importExcel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rawData = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: "" });

    if (rawData.length < 2) {
      return res.status(400).json({ error: "Excel file is empty or incorrectly formatted." });
    }
    const headers = rawData[0].map((h) => (h || "").trim());
    const monthStartIndex = headers.findIndex((h) =>
      ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].includes(h)
    );
    if (monthStartIndex === -1) {
      return res.status(400).json({ error: "No month columns found in the Excel file." });
    }
    const monthHeaders = headers.slice(monthStartIndex);
    const categories = [];
    let currentCategory = null;
    rawData.slice(1).forEach((row) => {
      const categoryName = row[0]?.trim() || currentCategory;
      const subcategories = row.slice(1, monthStartIndex).filter((s) => s.trim() !== "");

      const data = monthHeaders.reduce((acc, month, index) => {
        acc[month] = Number(row[monthStartIndex + index]) || 0;
        return acc;
      }, {});

      if (categoryName && subcategories.length > 0) {
        categories.push({
          categories: categoryName,
          subcategories,
          data,
        });
        currentCategory = categoryName;
      }
    });

    res.status(200).json({ categories });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getAllReports = async (req, res) => {
  const cache = await redis.get("reports");
  if (cache) return res.json(JSON.parse(cache));
  
  const reports = await Report.find().populate("reportType", "name");
  await redis.set("reports", JSON.stringify(reports));
  res.json(reports);
};


const getReportById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid report ID format" });
    }
     const report = await Report.findById(id)
       .populate("reportType", "name") 
       .populate("company", "name");
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }
    res.json(report);
  } catch (error) {
    console.error("Error fetching report:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getReportByName = async (req, res) => {
  const { name } = req.params;
  const cache = await redis.get(`report:name:${name}`);
  if (cache) return res.json(JSON.parse(cache));

  const reports = await Report.find({ reportName: name });
  if (!reports.length) return res.status(404).json({ name: "NotFound" });

  await redis.set(`report:name:${name}`, JSON.stringify(reports));
  res.json(reports);
};

const getReportByCompany = async (req, res) => {
  try {
    const { companyId } = req.params;
    const reports = await Report.find({ company: companyId })
      .populate("reportType", "name")
      .populate("company", "name")
      .select("reportName reportType company year monthData updatedAt");

    res.status(200).json(reports);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch reports" });
  }
};

const getReportByReportType = async (req, res) => {
  try {
    const { reportType } = req.params; 
    const reportTypeData = await ReportTypeModel.findOne({ name: reportType });

    if (!reportTypeData) {
      return res.status(404).json({ error: "Report type not found" });
    }
    const reports = await Report.find({ reportType: reportTypeData._id }).populate("reportType", "name");

    if (!reports.length) {
      return res.status(404).json({ error: "No reports found for this report type" });
    }
    res.status(200).json(reports);
  } catch (error) {
    console.error("Error fetching reports by reportType:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
const createReport = async (req, res) => {
  try {
    const { reportName, reportType, year, company, currency, userAccess, categories, subcategories, monthData } = req.body;

    if (!reportName || !reportType || !year || !company || !currency) {
      return res.status(400).json({ error: "All required fields must be filled." });
    }
    const formattedSubcategories = Array.isArray(subcategories) ? subcategories.flat().map((sub) => sub || "") : [];
    const parsedMonthData = {};
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    months.forEach((month) => {
      parsedMonthData[month] = Array.isArray(monthData[month])
        ? monthData[month].map((item) => ({
            category: item?.category || "Unknown",
            value: item?.value !== undefined ? Number(item.value.toString().replace(",", ".")) : 0,
          }))
        : [];
    });
    console.log("data sebelum ke backend ==>", JSON.stringify(parsedMonthData, null, 2));

    const newReport = new Report({
      reportName,
      reportType,
      year,
      company,
      currency,
      userCreated: req.user._id,
      userAccess: userAccess || [],
      categories,
      subcategories: formattedSubcategories,
      monthData: parsedMonthData,
    });

    await newReport.save();
    await redis.del("reports");
    res.status(201).json({ message: "Report created successfully", report: newReport });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateReport = async (req, res) => {
  const { id } = req.params;
  const { reportName, reportType, year, company, currency, userAccess, categories, subcategories, monthData } = req.body;

  const report = await Report.findByIdAndUpdate(
    id,
    { reportName, reportType, year, company, currency, userAccess, categories, subcategories, monthData },
    { new: true }
  );

  if (!report) return res.status(404).json({ name: "NotFound" });

  await redis.del("reports");
  await redis.del(`report:${id}`);
  res.json(report);
};

const deleteReport = async (req, res) => {
  const { id } = req.params;
  const report = await Report.findByIdAndDelete(id);
  if (!report) return res.status(404).json({ name: "NotFound" });

  await redis.del("reports");
  await redis.del(`report:${id}`);
  res.json({ message: "Deleted Successfully" });
};

export default {
  importExcel,
  getAllReports,
  getReportById,
  getReportByName,
  getReportByCompany,
  getReportByReportType,
  createReport,
  updateReport,
  deleteReport,
};
// reference: https://mongoosejs.com/docs/6.x/docs/queries.html
