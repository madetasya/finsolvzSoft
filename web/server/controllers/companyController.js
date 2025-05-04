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

const createCompany = async (req, res, next) => {
  try {
    const { name, profilePicture, user } = req.body;

    let users = [];

    if (user) {
      const existingUser = await UserModel.findById(user);
      if (!existingUser) {
        return next({ name: "NotFound", message: "User not found" });
      }
      users = [req.user._id];
    }

    const newCompany = new Company({
      name,
      profilePicture,
      user: users,
    });

    await newCompany.save();
    res.status(201).json({ message: "Company created successfully", company: newCompany });
  } catch (error) {
    next({ name: "Error", message: "Internal Server Error" });
  }
};

export const getCompanies = async (req, res) => {
  try {
    const companies = await Company.find().populate("user", "_id name"); // <<< FIX INI
    res.json(companies);
  } catch (error) {
    res.status(500).json({ message: error.message });
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

    const { id } = req.params; // <-- sudah bener ini
    const { name, user } = req.body;

    let users = [];
    if (user) {
      if (Array.isArray(user)) {
        users = user;
      } else {
        users = [user];
      }
    }

    const company = await Company.findById(id);
    if (!company) {
      throw { name: "NotFound", message: "Company not found" };
    }

    // HANDLE UPLOAD GAMBAR
    let profilePicture = company.profilePicture;
    if (req.file) {
      try {
        const uploaded = await cloudinary.uploader.upload(req.file.path, {
          folder: "CompanyLogo",
        });
        profilePicture = uploaded.secure_url;
      } catch (uploadError) {
        // console.log("UPLOAD GAGAL >>>>", uploadError);
        return res.status(500).json({
          message: "Cloudinary upload failed",
          error: uploadError,
        });
      }
    }

    // UPDATE FIELD
    if (name) company.name = name;
    company.profilePicture = profilePicture;
    if (users.length > 0) company.user = users;

    await company.save();

    await redis.del(`company:${id}`);
    await redis.del(`company:name:${company.name}`);

    res.status(200).json({
      message: "Success",
      company,
    });
  } catch (error) {
    next(error);
  }
};

const deleteCompany = async (req, res, next) => {
  try {
    if (req.user.role !== "SUPER_ADMIN") {
      throw { name: "Forbidden" };
    }

    const { id } = req.params; // <-- ganti ke id

    const deletedCompany = await Company.findByIdAndDelete(id);
    if (!deletedCompany) {
      throw { name: "NotFound" };
    }

    await redis.del(`company:${id}`);
    await redis.del(`company:name:${deletedCompany.name}`);

    res.json({ message: "Company deleted successfully", company: deletedCompany });
  } catch (error) {
    next(error);
  }
};


export default { createCompany, getCompanies, getCompanyById, getCompanyByName, getUserCompanies, updateCompany, deleteCompany };
