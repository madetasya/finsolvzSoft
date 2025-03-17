import mongoose from "mongoose";

const SubCategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  children: [{ type: mongoose.Schema.Types.ObjectId, ref: "SubCategory" }],
});

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  subcategories: [{ type: mongoose.Schema.Types.ObjectId, ref: "SubCategory" }],
});

const ReportSchema = new mongoose.Schema(
  {
    reportName: { type: String, required: true, unique: true },
    reportType: { type: mongoose.Schema.Types.ObjectId, ref: "ReportType", required: true },
    year: { type: Number },
    company: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true },
    currency: { type: String },
    userCreated: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    userAccess: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    categories: [{ type: String }],
    subcategories: [{ type: String }],
    monthData: {
      January: [{ category: String, value: { type: mongoose.Schema.Types.Decimal128 } }],
      February: [{ category: String, value: { type: mongoose.Schema.Types.Decimal128 } }],
      March: [{ category: String, value: { type: mongoose.Schema.Types.Decimal128 } }],
      April: [{ category: String, value: { type: mongoose.Schema.Types.Decimal128 } }],
      May: [{ category: String, value: { type: mongoose.Schema.Types.Decimal128 } }],
      June: [{ category: String, value: { type: mongoose.Schema.Types.Decimal128 } }],
      July: [{ category: String, value: { type: mongoose.Schema.Types.Decimal128 } }],
      August: [{ category: String, value: { type: mongoose.Schema.Types.Decimal128 } }],
      September: [{ category: String, value: { type: mongoose.Schema.Types.Decimal128 } }],
      October: [{ category: String, value: { type: mongoose.Schema.Types.Decimal128 } }],
      November: [{ category: String, value: { type: mongoose.Schema.Types.Decimal128 } }],
      December: [{ category: String, value: { type: mongoose.Schema.Types.Decimal128 } }],
    },
  },
  { timestamps: true }
);

export const Category = mongoose.models.Category || mongoose.model("Category", CategorySchema);
export const SubCategory = mongoose.models.SubCategory || mongoose.model("SubCategory", SubCategorySchema);
export const Report = mongoose.models.Report || mongoose.model("Report", ReportSchema);

export default { Category, SubCategory, Report };
