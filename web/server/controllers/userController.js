dotenv.config();
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import crypto from "crypto";
import sendEmail from "../helpers/nodemailer.js";
import { hashPassword, comparePassword } from "../helpers/bcrypt.js";
import { generateToken } from "../helpers/jwt.js";
import redis from "../config/redis.js";
import Company from "../models/CompanyModel.js";
import User from "../models/UserModel.js";

const getLoginUser = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).select("-password");

    if (!user) {
      throw { name: "NotFound", message: "User not found" };
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
};

const getUsers = async (req, res, next) => {
  try {
    const cachedUsers = await redis.get("users");
    if (cachedUsers) {
      return res.json(JSON.parse(cachedUsers));
    }

    const users = await User.find();
    await redis.set("users", JSON.stringify(users));
    res.json(users);
  } catch (error) {
    next({ name: "Error", error });
  }
};

const getUserById = async (req, res, next) => {
  try {
    // if ((req.user.role !== "SUPER_ADMIN" && req.user.role !== "ADMIN") || !req.user) {
    //   throw { name: "Forbidden" };
    // }
    const user = await User.findById(req.params.id);
    if (!user) {
      throw { name: "NotFound" };
    }
    res.json(user);
  } catch (error) {
    next({ name: "Error", error });
  }
};

const getUserByName = async (req, res, next) => {
  try {
    // if ((req.user.role !== "SUPER_ADMIN" && req.user.role !== "ADMIN") || !req.user) {
    //   throw { name: "Forbidden" };
    // }

    const cachedUser = await redis.get(`user:${req.params.email}`);
    if (cachedUser) {
      return res.json(JSON.parse(cachedUser));
    }

    const user = await User.findOne({ email: req.params.email });
    if (!user) {
      throw { name: "NotFound" };
    }

    await redis.set(`user:${req.params.email}`, JSON.stringify(user));

    res.json(user);
  } catch (error) {
    next({ name: "Error", error });
  }
};

const register = async (req, res, next) => {
  try {
    const { name, email, password, role, company } = req.body;

    // VALIDASI ROLE
    if (!req.user || req.user.role !== "SUPER_ADMIN") {
      throw { name: "Forbidden" };
    }

    // VALIDASI INPUT
    if (!name || !email || !password || !role || !company) {
      throw {
        name: "ValidationError",
        message: "Name, email, password, role, and company are required",
      };
    }

    let companies = [];
    if (Array.isArray(company)) {
      companies = company;
    } else if (company) {
      companies = [company];
    }

    const existingCompanies = await Company.find({ name: { $in: companies } });
    const companyIds = existingCompanies.map((company) => company._id);

    // VALIDASI USER EXIST
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw {
        name: "ExistingUser",
        message: "User with this email already exists",
      };
    }

    const hashedPassword = await hashPassword(password);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role,
      company: companyIds,
    });

    await newUser.save();
    await redis.del("users");

    return res.status(201).json({ message: "Success", newUser });
  } catch (error) {
    next({ name: "Error", error });
  }
};



const login = async (req, res, next) => {
  try {
    let { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const findUser = await User.findOne({ email }).select("+password");

    if (!findUser) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const isMatch = comparePassword(password, findUser.password);

    if (!isMatch) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const payload = {
      _id: findUser._id.toString(),
      role: findUser.role,
    };

    const access_token = generateToken(payload);

    res.status(200).json({ access_token });
  } catch (error) {
    console.error("SUMTHIGN WONG DUDE=========:", error);
     next({ name: "Error", error });
  }
};

const logout = async (req, res) => {
  try {
    const { authorization } = req.headers;
    if (!authorization || !authorization.startsWith("Bearer ")) {
      throw { name: "Unauthorized", message: "Invalid Token" };
    }

    const token = authorization.split(" ")[1];

    const user = await User.findById(req.user._id);

    if (!user) {
    throw { name: "NotFound", message: "User not found" };
    }

    user.tokens = user.tokens.filter((t) => t.token !== token);
    await user.save();

    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
     next({ name: "Error", error });
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) 
      throw { name: "ValidationError", message: "Email is required" };

    const user = await User.findOne({ email });
    if (!user) 
      throw { name: "NotFound", message: "User not found" };

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000;

    await user.save();

    const resetLink = `${req.protocol}://${req.get("host")}/reset-password/${resetToken}`;

    const emailBody = `Greetings! \n\nLooks like you forgot your password. \n\nClick the link below to reset your password:\n\n ${resetLink} \n\nThis link expires in 1 hour. ⏳\n\nIf you didn’t request this, either someone’s trying to hack you, or you’re just forgot about it. Either way, ignore this email.\n\nStay safe,\nFinsolvz by Adviz`;

    await sendEmail(user.email, "Finsolvz Password Reset Request", emailBody);

    res.status(200).json({ message: "Password reset link sent to your email" });
  } catch (error) {
    next({ name: "Error", error });
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) 
      throw { name: "ValidationError", message: "Token or new password are required" };
    
    const user = await User.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } });
    if (!user) throw { name: "InvalidToken", message: "Invalid or expired token" };

    user.password = hashPassword(newPassword);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.status(200).json({ message: "Password successfully reset" });
  } catch (error) {
    next({ name: "Error", error });
  }
};

const updateRole = async (req, res, next) => {
  try {
    const { userId, newRole } = req.body;
    const user = await User.findById(userId);
    if (!user) throw { name: "NotFound" };

    user.role = newRole;
    await user.save();

    await redis.del("users");
    await redis.del(`user:${user.email}`);

    return res.status(200).json({ message: "Success", user });
  } catch (error) {
     next({ name: "Error", error }); next({ name: "Error", error });
  }
};

const updateUser = async (req, res, next) => {
  try {
    const { name, email, password, role, company } = req.body;
    const { id } = req.params;

    const loginUser = req.user;

    const userData = await User.findById(id);
    if (!userData) {
      return next({ name: "NotFound", message: "User not found" });
    }

    if (loginUser.role !== "SUPER_ADMIN") {
      return next({
        name: "Forbidden",
        message: "You can only update your own data",
      });
    }

    if (loginUser.role !== "SUPER_ADMIN" && role && role !== userData.role) {
      return next({
        name: "Forbidden",
        message: "You are not allowed to change your role",
      });
    }

    if (email && email !== userData.email) {
      const emailUsed = await User.findOne({ email });
      if (emailUsed) {
        return next({
          name: "ExistingUser",
          message: "Email already used by another user",
        });
      }
    }

    let companyNames = [];
    if (Array.isArray(company)) {
      companyNames = company;
    } else if (company) {
      companyNames = [company];
    }

    if (name) userData.name = name;
    if (email) userData.email = email;
    if (password) userData.password = await hashPassword(password);
    if (loginUser.role === "SUPER_ADMIN" && role) {
      userData.role = role;
    }
    if (companyNames.length > 0) {
      userData.company = companyNames;
    }

    await userData.save();
    await redis.del("users");

    res.status(200).json({
      message: "User updated",
      updatedUser: userData,
    });
  } catch (error) {
    next({ name: "Error", error });
  }
};



const deleteUser = async (req, res, next) => {
  try {
    const { userId } = req.body;
    const requester = req.user;

    if (requester.role !== "SUPER_ADMIN") {
      throw { name: "Forbidden" };
    }

    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) throw { name: "NotFound" };

    await redis.del("users");
    await redis.del(`user:${deletedUser.email}`);

    res.json({ message: "Success", user: deletedUser });
  } catch (error) {
     next({ name: "Error", error });
  }
};

export default {
  login,
  logout,
  getLoginUser,
  getUsers,
  getUserById,
  getUserByName,
  register,
  forgotPassword,
  resetPassword,
  updateRole,
  updateUser,
  deleteUser,
};
