import Category from "../models/CategoryModel.js";
import redis from "../config/redis.js";

const getAllCategories = async (req, res) => {
  const cache = await redis.get("categories");
  if (cache) return res.json(JSON.parse(cache));

  const categories = await Category.find();
   await redis.set("categories", JSON.stringify(categories));
  res.json(categories);
};

const getCategoryById = async (req, res) => {
  const { id } = req.params;
  const cache = await redis.get(`category:${id}`);
  if (cache) return res.json(JSON.parse(cache));

  const category = await Category.findById(id);
  if (!category) return res.status(404).json({ name: "NotFound" });

  await redis.set(`category:${id}`, JSON.stringify(category));
  res.json(category);
};

const getCategoriesByReportType = async (req, res) => {
  const { reportTypeId } = req.params;
  const cache = await redis.get(`categories:${reportTypeId}`);
  if (cache) return res.json(JSON.parse(cache));

  const categories = await Category.find({ reportType: reportTypeId });
  await redis.set(`categories:${reportTypeId}`, JSON.stringify(categories));
  res.json(categories);
};

const getCategoryByName = async (req, res) => {
  const { name } = req.params;
  const cache = await redis.get(`category:${name}`);
  if (cache) return res.json(JSON.parse(cache));

  const category = await Category.findOne({ name: { $regex: new RegExp(`^${name}$`, "i") } }).populate("reportType", "name");
  if (!category) return res.status(404).json({ name: "NotFound", message: "Category not found" });

  await redis.set(`category:${name}`, JSON.stringify(category));

  res.json(category);
};



const createCategory = async (req, res, next) => {
  try {
    const { name, reportType } = req.body;

    if (!name || !reportType) {
      return res.status(400).json({ name: "ValidationError", message: "Name and ReportTypeId are required" });
    }
    //sudah save ke category
    const category = new Category({ name, reportType });
    await category.save();

    //cuma buat liat report type name for postman purpose
    const data = await Category.findById(category._id).populate("reportType", "name");

    await redis.del("categories");
    await redis.del(`categories:${reportType}`);
    res.status(201).json(data);
    // res.status(201).json(category);
  } catch (error) {
    next(errorHandler(error));
  }
};


const updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  const category = await Category.findByIdAndUpdate(id, { name }, { new: true });
  if (!category) return res.status(404).json({ name: "NotFound" });

  await redis.del("categories");
  await redis.del(`category:${id}`);
  await redis.del(`categories:${category.reportType}`);
  res.json(category);
};

const deleteCategory = async (req, res) => {
  const { id } = req.params;
  const category = await Category.findByIdAndDelete(id);
  if (!category) return res.status(404).json({ name: "NotFound" });

  await redis.del("categories");
  await redis.del(`category:${id}`);
  await redis.del(`categories:${category.reportType}`);
  res.json({ message: "Deleted Successfully" });
};

export default { getAllCategories, getCategoryById, getCategoriesByReportType, getCategoryByName,createCategory, updateCategory, deleteCategory };