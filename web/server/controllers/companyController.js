import dotenv from "dotenv";
import Company from "../models/CompanyModel.js";
import UserModel from "../models/UserModel.js";
import { v2 as cloudinary } from "cloudinary";
import redis from "../config/redis.js";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const createCompany = async (req, res) => {
  try {
    const { name, profilePicture, user } = req.body;
    if (user) {
      const existingUser = await UserModel.findById(user);
      if (!existingUser) {
        return res.status(400).json({ error: "User Not Found!" });
      }
    }

    const newCompany = new Company({
      name,
      profilePicture,
      user: user || null,
    });

    await newCompany.save();
    res.status(201).json({ message: "Company created successfully", company: newCompany });
  } catch (error) {
    console.error("Error creating company:", error);
    res.status(500).json({ error: error.message });
  }
};

const getCompanies = async (req, res, next) => {
  try {
    console.log("🔍 Fetching companies from database...");

    const companies = await Company.find();
    console.log("✅ Companies found in DB:", companies);

    if (!companies || companies.length === 0) {
      console.log("⚠️ No companies found in database.");
      return res.status(200).json([]);
    }

    res.json(companies);
  } catch (error) {
    console.error("❌ Error fetching companies:", error);
    next(error);
  }
};

const getCompanyById = async (req, res, next) => {
  try {
    const cachedCompany = await redis.get(`company:${req.params.id}`);
    if (cachedCompany) {
      return res.json(JSON.parse(cachedCompany));
    }

    const company = await Company.findById(req.params.id).lean();
    if (!company) {
      throw { name: "NotFound" };
    }

    if (company.profilePicture) {
      company.profilePicture = company.profilePicture.startsWith("http") ? company.profilePicture : `http://152.42.172.219:8787${company.profilePicture}`;
    }

    await redis.set(`company:${req.params.id}`, JSON.stringify(company));
    res.json(company);
  } catch (error) {
    next(error);
  }
};

const getCompanyByName = async (req, res, next) => {
  try {
    const cachedCompany = await redis.get(`company:name:${req.params.name}`);
    if (cachedCompany) {
      return res.json(JSON.parse(cachedCompany));
    }

    const company = await Company.findOne({ name: req.params.name }).lean();
    if (!company) {
      throw { name: "NotFound" };
    }

    if (company.profilePicture) {
      company.profilePicture = company.profilePicture.startsWith("http") ? company.profilePicture : `http://152.42.172.219:8787${company.profilePicture}`;
    }

    await redis.set(`company:name:${req.params.name}`, JSON.stringify(company));
    res.json(company);
  } catch (error) {
    next(error);
  }
};

const getUserCompanies = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const companies = await Company.find({ user: userId });

    res.json(companies);
  } catch (error) {
    next(error);
  }
};

const updateCompany = async (req, res, next) => {
  try {
    if (req.user.role !== "SUPER_ADMIN") {
      throw { name: "Forbidden" };
    }

    const { companyId } = req.params;
    const { name, user } = req.body;
    let profilePicture = req.body.profilePicture; // URL

    // LIBRARY IMAGE
    if (req.file) {
      try {
        const uploadedResponse = await cloudinary.uploader.upload(req.file.path, { folder: "CompanyLogo" });
        profilePicture = uploadedResponse.secure_url;
      } catch (uploadError) {
        console.error("Cloudinary upload failed:", uploadError);
        return res.status(500).json({ message: "Cloudinary upload failed", error: uploadError });
      }
    }

    if (user) {
      const existingUser = await UserModel.findById(user);
      if (!existingUser) {
        throw { name: "NotFound", message: "User not found" };
      }
    }

    const updatedCompany = await Company.findByIdAndUpdate(companyId, { $set: { name, profilePicture, user } }, { new: true, runValidators: true });

    if (!updatedCompany) {
      throw { name: "NotFound", message: "Company not found" };
    }

    await redis.del(`company:${companyId}`, JSON.stringify(updatedCompany));
    await redis.del(`company:name:${updatedCompany.name}`, JSON.stringify(updatedCompany));

    return res.status(200).json({ message: "Success", company: updatedCompany });
  } catch (error) {
    next(error);
  }
};

const deleteCompany = async (req, res, next) => {
  try {
    if (req.user.role !== "SUPER_ADMIN") {
      throw { name: "Forbidden" };
    }

    const { companyId } = req.params;
    const deletedCompany = await Company.findByIdAndDelete(companyId);
    if (!deletedCompany) {
      throw { name: "NotFound" };
    }
    await redis.del(`company:${companyId}`);
    await redis.del(`company:name:${deletedCompany.name}`);

    res.json({ message: "Company deleted successfully", company: deletedCompany });
  } catch (error) {
    next(error);
  }
};

export default { createCompany, getCompanies, getCompanyById, getCompanyByName, getUserCompanies, updateCompany, deleteCompany };
