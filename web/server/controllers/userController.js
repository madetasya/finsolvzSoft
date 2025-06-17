import dotenv from "dotenv";
dotenv.config();
import bcrypt from "bcrypt";
import crypto from "crypto";
import send from "../helpers/nodemailer.js";
import { hashPassword, comparePassword } from "../helpers/bcrypt.js";
import { generateToken } from "../helpers/jwt.js";
import User from "../models/UserModel.js";
import jwt from "jsonwebtoken";

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
    if (req.user.role !== "SUPER_ADMIN" && req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Access denied" });
    }

    const users = await User.find();
    res.json(users);
  } catch (error) {
    next(error);
  }
};

const getUserById = async (req, res, next) => {
  try {
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
    const user = await User.findOne({ email: req.params.email });
    if (!user) {
      throw { name: "NotFound" };
    }
    res.json(user);
  } catch (error) {
    next(error);
  }
};

const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    if (!req.user || req.user.role !== "SUPER_ADMIN") {
      throw { name: "Forbidden", message: "Only SUPER_ADMIN can register user" };
    }

    if (!name || !email || !password || !role) {
      throw { name: "ValidationError", message: "All fields are required" };
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw { name: "ExistingData", message: "Email already registered" };
    }

    const hashedPassword = await hashPassword(password);

    const newUser = new User({ name, email, password: hashedPassword, role, company: [] });
    await newUser.save();

    res.status(201).json({ message: "Success", newUser });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    let { email, password } = req.body;

    if (!email || !password) {
      throw { name: "ValidationError", message: "Email and password are required" };
    }

    const findUser = await User.findOne({ email }).select("+password");

    if (!findUser) {
      throw { name: "NotFound", message: "User not found" };
    }

    const isMatch = comparePassword(password, findUser.password);

    if (!isMatch) {
      throw { name: "InvalidEmailOrPassword", message: "Invalid email or password" };
    }

    const payload = {
      _id: findUser._id.toString(),
      role: findUser.role,
    };

    const access_token = generateToken(payload);

    res.status(200).json({ access_token });
  } catch (error) {
    next(error);
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
    next(error);
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const newPassword = crypto.randomBytes(6).toString("hex");
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    await user.save();

    await send({
      to: email,
      subject: "Your New Finsolvz Account Password",
      text: `Dear ${user.name},\n\nWe have received a request to reset your password for your Finsolvz account.\n\nHere is your new password:\nPassword: ${newPassword}\n\nPlease use this password to log in to your account. For security reasons, we recommend changing your password after logging in.\n\nIf you did not request this change, please contact our support team immediately.\n\nBest regards,\nFinsolvz Team`,
      html: `
        <div style="font-family: sans-serif; line-height: 1.6;">
          <p>Dear <strong>${user.name}</strong>,</p>
          <p>We have received a request to reset your password for your <strong>Finsolvz</strong> account.</p>
          <p>Here is your new password:</p>
          <p style="font-size: 18px; font-weight: bold;">${newPassword}</p>
          <p>Please use this password to log in to your account. For security reasons, we strongly recommend changing your password after logging in.</p>
          <p>If you did not request this change, please contact our support team immediately.</p>
          <p style="margin-top: 24px;">Best regards,<br/>Finsolvz</p>
        </div>
      `,
    });

    return res.json({ message: "New password has been sent to your email" });
  } catch (error) {
    next(error);
  }
};

const changePassword = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: "Unauthorized" });

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded._id;

    const { newPassword, confirmPassword } = req.body;

    if (!newPassword || !confirmPassword) {
      return res.status(400).json({ message: "All fields required" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.findByIdAndUpdate(userId, { password: hashedPassword });

    res.status(200).json({ message: "Password successfully changed" });
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) throw { name: "ValidationError", message: "Token or new password are required" };

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

    return res.status(200).json({ message: "Success", user });
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    const { id } = req.params;

    const loginUser = req.user;

    const userData = await User.findById(id);
    if (!userData) {
      return next({ name: "NotFound", message: "User not found" });
    }

    if (loginUser.role !== "SUPER_ADMIN") {
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

    if (name) userData.name = name;
    if (email) userData.email = email;
    if (password) userData.password = await hashPassword(password);
    if (loginUser.role === "SUPER_ADMIN" && role) {
      userData.role = role;
    }

    await userData.save();

    res.status(200).json({
      message: "User updated",
      updatedUser: userData,
    });
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const requester = req.user;

    if (requester.role !== "SUPER_ADMIN") {
      throw { name: "Forbidden", message: "Not authorized to delete user" };
    }

    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) throw { name: "NotFound" };

    res.json({ message: "Success", user: deletedUser });
  } catch (error) {
    next(error);
  }
};

const getLatestVersion = (req, res) => {
  res.json({
    version: "1.0.2",
    apkUrl: "http://159.89.194.251:8787/finsolvz-v1.0.2.apk",
  });
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
  changePassword,
  resetPassword,
  updateRole,
  updateUser,
  deleteUser,
  getLatestVersion,
};
