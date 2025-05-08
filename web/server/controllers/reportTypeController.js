import ReportType from "../models/reportTypeModel.js";
import redis from "../config/redis.js";
import errorHandler from "../helpers/error.js";

const getReportTypes = async (req, res, next) => {
  try {
    const cache = await redis.get("reportTypes");
    if (cache) return res.status(200).json(JSON.parse(cache));

    const reportTypes = await ReportType.find();
    await redis.set("reportTypes", JSON.stringify(reportTypes));
    res.status(200).json(reportTypes);
  } catch (error) {
    next(errorHandler(error));
  }
};

const getReportTypeById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const cache = await redis.get(`reportType:${id}`);
    if (cache) return res.status(200).json(JSON.parse(cache));

    const reportType = await ReportType.findById(id);
    if (!reportType) return res.status(404).json({ name: "NotFound", message: "Report Type not found" });

    await redis.set(`reportType:${id}`, JSON.stringify(reportType));
    res.status(200).json(reportType);
  } catch (error) {
    next(errorHandler(error));
  }
};

const getReportTypeByName = async (req, res, next) => {
  try {
    const { name } = req.params;
    const cache = await redis.get(`reportType:${name}`);
    if (cache) return res.status(200).json(JSON.parse(cache));

    const reportType = await ReportType.findOne({ name });
    if (!reportType) return res.status(404).json({ name: "NotFound", message: "Report Type not found" });

    await redis.set(`reportType:${name}`, JSON.stringify(reportType));
    res.status(200).json(reportType);
  } catch (error) {
    next(errorHandler(error));
  }
};

const addReportType = async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ name: "ValidationError", message: "Name is required" });
    }

    const existReportType = await ReportType.findOne({ name });
    if (existReportType) {
      return res.status(409).json({ name: "ExistingData", message: "Report type already exists" });
    }

    const reportType = new ReportType({ name });
    await reportType.save();

    await redis.del("reportTypes");
    res.status(201).json({ message: "Report type added successfully", reportType });
  } catch (error) {
    next(errorHandler(error));
  }
};

const updateReportType = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const reportType = await ReportType.findByIdAndUpdate(id, { name }, { new: true });
    if (!reportType) return res.status(404).json({ name: "NotFound", message: "Report type not found" });

    await redis.del("reportTypes");
    await redis.del(`reportType:${id}`);
    res.status(200).json({ message: "Report Type updated successfully", reportType });
  } catch (error) {
    next(errorHandler(error));
  }
};

const deleteReportType = async (req, res, next) => {
  try {
    const { id } = req.params;
    const reportType = await ReportType.findByIdAndDelete(id);
    if (!reportType) return res.status(404).json({ name: "NotFound", message: "Report type not found" });

    await redis.del("reportTypes");
    await redis.del(`reportType:${id}`);
    res.status(204).send();
  } catch (error) {
    next(errorHandler(error));
  }
};

export default {
  getReportTypes,
  getReportTypeById,
  getReportTypeByName,
  addReportType,
  updateReportType,
  deleteReportType,
};
