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
    // if ((req.user.role !== "SUPER_ADMIN" && req.user.role !== "ADMIN") || !req.user) {
    //   throw { name: "Forbidden" };
    // }

    const cachedUsers = await redis.get("users");
    if (cachedUsers) {
      return res.json(JSON.parse(cachedUsers));
    }

    const users = await User.find();
    await redis.set("users", JSON.stringify(users));

    res.json(users);
  } catch (error) {
    next(error);
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
    next(error);
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
    next(error);
  }
};

const register = async (req, res, next) => {
  try {
    const { name, email, password, role, company } = req.body;

    if (!req.user || req.user.role !== "SUPER_ADMIN") {
      throw { name: "Forbidden" };
    }

    if (!name || !email || !password || !role) {
      throw { name: "ValidationError", message: "Name, email, password, and role are required" };
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw { name: "ExistingUser", message: "User with this email already exists" };
    }

    const hashedPassword = await hashPassword(password);

    const newUser = new User({ name, email, password: hashedPassword, role, company });

    await newUser.save();
    await redis.del("users");

    return res.status(201).json({ message: "Success", newUser });
  } catch (error) {
    next(error);
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

    const isMatch = await comparePassword(password, findUser.password);

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
    console.error("❌ Error in login function:", error);
    next(error);
  }
};

const logout = async (req, res) => {
  try {
    const { authorization } = req.headers;
    if (!authorization || !authorization.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized - Invalid Token Format" });
    }

    const token = authorization.split(" ")[1];

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(401).json({ error: "Unauthorized - User Not Found" });
    }

    user.tokens = user.tokens.filter((t) => t.token !== token);
    await user.save();

    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) throw { name: "ValidationError", message: "Email is required" };

    const user = await User.findOne({ email });
    if (!user) throw { name: "NotFound", message: "User not found" };

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000;

    await user.save();

    const resetLink = `${req.protocol}://${req.get("host")}/reset-password/${resetToken}`;

    const emailBody = `Greetings! \n\nLooks like you forgot your password.\nToo bad this feature still under development. Sorry for the inconvenience. \n\nIf you didn’t request this, either someone’s trying to hack you, or you’re just forgot about it. Either way, ignore this email.\n\nStay safe,\nFinsolvz by Adviz`;
    // const emailBody = `Greetings! \n\nLooks like you forgot your password. \n\nClick the link below to reset your password:\n\n ${resetLink} \n\nThis link expires in 1 hour. ⏳\n\nIf you didn’t request this, either someone’s trying to hack you, or you’re just forgot about it. Either way, ignore this email.\n\nStay safe,\nFinsolvz by Adviz`;

    await sendEmail(user.email, "Finsolvz Password Reset Request", emailBody);

    res.status(200).json({ message: "Password reset link sent to your email" });
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) throw { name: "ValidationError", message: "Token and new password are required" };

    const user = await User.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } });
    if (!user) throw { name: "InvalidToken", message: "Invalid or expired token" };

    user.password = hashPassword(newPassword);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.status(200).json({ message: "Password successfully reset" });
  } catch (error) {
    next(error);
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
    next(error);
  }
};
const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { password, company } = req.body;
    const loggedInUser = req.user;

    if (loggedInUser.role === "CLIENT" || loggedInUser.role === "ADMIN") {
      if (loggedInUser._id.toString() !== id) {
        return res.status(403).json({ error: "You can only update your own account" });
      }
    }

    const updateData = {};

    if (company === null || company === "") {
      updateData.$unset = { company: "" };
    } else if (company) {
      const companyExists = await Company.findOne({ name: company });
      if (!companyExists) {
        return res.status(400).json({ error: "Invalid company. Please select a valid company." });
      }
      updateData.company = company;
    }

    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true });

    return res.status(200).json({ message: "Success", data: updatedUser });
  } catch (error) {
    next(error);
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
    next(error);
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
