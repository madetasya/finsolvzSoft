import Report from "../models/ReportModel.js";
import mongoose from "mongoose";

const createReport = async (req, res, next) => {
  try {
    const { reportName, reportType, year, company, currency, createBy, userAccess, reportData } = req.body;

    const report = new Report({
      reportName,
      reportType: new mongoose.Types.ObjectId(reportType),
      year,
      company: new mongoose.Types.ObjectId(company),
      currency,
      createdBy: new mongoose.Types.ObjectId(createBy),
      userAccess: userAccess.map((id) => new mongoose.Types.ObjectId(id)),
      reportData,
    });

    await report.save();
    res.status(201).json(report);
  } catch (error) {
    next(error);
  }
};

const updateReport = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid report ID" });
  }

  try {
    const updated = await Report.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return res.status(404).json({ error: "Report not found" });
    }

    res.json(updated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const deleteReport = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Report.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ name: "NotFound" });
    }
    res.status(200).json({ message: "Report berhasil dihapus" });
  } catch (err) {
    res.status(500).json({ message: "Gagal hapus report" });
  }
};

//GET

const getAllReports = async (req, res) => {
  try {
    const reports = await Report.find().populate("company reportType createdBy");
    res.status(200).json(reports);
  } catch (err) {
    // console.error("GET ALL REPORTS ERROR >>>", err);
    res.status(500).json({ message: "Gagal ambil semua report" });
  }
};

const getReportById = async (req, res) => {
  try {
    const { id } = req.params;
    const report = await Report.findById(id).populate("company reportType createdBy");
    if (!report) return res.status(404).json({ message: "Report tidak ditemukan" });
    res.status(200).json(report);
  } catch (err) {
    // console.error("GET REPORT BY ID ERROR >>>", err);
    res.status(500).json({ message: "Failed to fetch data by id" });
  }
};

const getReportByName = async (req, res) => {
  try {
    const { name } = req.params;
    const report = await Report.findOne({ reportName: name }).populate("company reportType createdBy");
    if (!report) return res.status(404).json({ message: "Report tidak ditemukan" });
    res.status(200).json(report);
  } catch (err) {
    // console.error("GET REPORT BY NAME ERROR >>>", err);
    res.status(500).json({ message: "Failed to fetch data by name" });
  }
};

const getReportByCompany = async (req, res) => {
  try {
    const { companyId } = req.params;
    const reports = await Report.find({ company: companyId }).populate("company reportType createdBy");
    res.status(200).json(reports);
  } catch (err) {
    // console.error("GET REPORT BY COMPANY ERROR >>>", err);
    res.status(500).json({ message: "Failed to fetch data by company" });
  }
};

const getReportsByCompanies = async (req, res) => {
  try {
    const { companyIds } = req.body; 
    if (!Array.isArray(companyIds)) {
      return res.status(400).json({ message: "Need 2 or more company" });
    }

    const reports = await Report.find({
      company: { $in: companyIds },
    }).populate("company reportType createdBy");

    res.status(200).json(reports);
  } catch (err) {
    // console.error("GET MULTI COMPANY REPORTS ERROR >>>", err);
    res.status(500).json({ message: "Failed to fetch companies" });
  }
};

const getReportByReportType = async (req, res) => {
  try {
    const { reportType } = req.params;
    const reports = await Report.find({ reportType }).populate("company reportType createdBy");
    res.status(200).json(reports);
  } catch (err) {
    // console.error("GET REPORT BY REPORT TYPE ERROR >>>", err);
    res.status(500).json({ message: "Failed to fetch data by reportType" });
  }
};

const getReportByUserAccess = async (req, res) => {
  try {
    const { userId } = req.params;
    const reports = await Report.find({ userAccess: userId }).populate("company reportType createdBy");
    res.status(200).json(reports);
  } catch (err) {
    // console.error("GET REPORT BY USER ACCESS ERROR >>>", err);
    res.status(500).json({ message: "Failed to fetch data by userAccess" });
  }
};

const getReportByCreatedBy = async (req, res) => {
  try {
    const { userId } = req.params;
    const reports = await Report.find({ createdBy: userId }).populate("company reportType createdBy");
    res.status(200).json(reports);
  } catch (err) {
    // console.error("GET REPORT BY CREATEDBY ERROR >>>", err);
    res.status(500).json({ message: "Failed to fetch data by createdBy" });
  }
};

export default {
  createReport,
  updateReport,
  deleteReport,
  getAllReports,
  getReportById,
  getReportByName,
  getReportByCompany,
  getReportsByCompanies,
  getReportByReportType,
  getReportByUserAccess,
  getReportByCreatedBy,
};
