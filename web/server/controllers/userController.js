dotenv.config();
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import crypto from "crypto";
import send from "../helpers/nodemailer.js";
import { hashPassword, comparePassword } from "../helpers/bcrypt.js";
import { generateToken } from "../helpers/jwt.js";
import redis from "../config/redis.js";
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
};const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    if (!req.user || req.user.role !== "SUPER_ADMIN") {
      throw { name: "Forbidden" };
    }

    if (!name || !email || !password || !role) {
      throw {
        name: "ValidationError",
        message: "Name, email, password, role are required",
      };
    }

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
      company: [],
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



const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ msg: "Email not found" });
    }

    const token = crypto.randomBytes(20).toString("hex");
    const expires = Date.now() + 3600000; // 1 jamm

    user.resetPasswordToken = token;
    user.resetPasswordExpires = expires;
    await user.save();

    const resetLink = `https://localhost:3000/reset-password?token=${token}`;
    const displayName = user.name ? user.name.charAt(0).toUpperCase() + user.name.slice(1) : "Valued User";

    const messageText = `Dear ${displayName},

We have received a request to reset the password associated with your Finsolvz account.

If you initiated this request, please use the link below to create a new password:

${resetLink}

Please note that this link will expire in 1 hour for security reasons.

If you did not request a password reset, no action is required. However, we recommend updating your password as a precaution.

Sincerely,
The Finsolvz by Adviz Team`;

    const logoURL = "https://res.cloudinary.com/yourcloud/image/upload/v1710000000/finsolvz-logo.png";

    const messageHTML = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px;">
        <div style="text-align: left; margin-bottom: 20px;">
          <img src="${logoURL}" alt="Finsolvz Logo" style="height: 40px;">
        </div>

        <p>Dear ${displayName},</p>

        <p>We have received a request to reset the password associated with your <strong>Finsolvz</strong> account.</p>

        <p>If you initiated this request, please click the button below to create a new password:</p>

        <p style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" 
             style="background-color: #1D4ED8; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
            Reset Password
          </a>
        </p>

        <p><strong>Note:</strong> This link will expire in 1 hour for security reasons.</p>

        <p>If you did not request this password reset, no further action is required. However, we recommend updating your password as a precaution.</p>

        <p>If you have any questions or need assistance, please do not hesitate to contact our support team.</p>

        <p style="margin-top: 40px;">Sincerely,<br/>The Finsolvz by Adviz Team</p>
      </div>
    `;

    await send.sendMail({
      from: process.env.NODEMAILER_EMAIL,
      to: user.email,
      subject: "Reset Your Password - Finsolvz",
      text: messageText,
      html: messageHTML,
    });

    res.json({ msg: "Password reset link sent to your email." });
  } catch (err) {
    console.error("ERROR SENDING RESET EMAIL >>>", err);
    res.status(500).json({ msg: "Failed to send reset email." });
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
    const { name, email, password, role, } = req.body;
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

    if (loginUser.role !== "SUPER_ADMIN" ) {
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

    // let companyNames = [];
    // if (Array.isArray(company)) {
    //   companyNames = company;
    // } else if (company) {
    //   companyNames = [company];
    // }

    if (name) userData.name = name;
    if (email) userData.email = email;
    if (password) userData.password = await hashPassword(password);
    if (loginUser.role === "SUPER_ADMIN" && role) {
      userData.role = role;
    }
    // if (companyNames.length > 0) {
    //   userData.company = companyNames;
    // }

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
