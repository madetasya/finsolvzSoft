import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();

const generateToken = (user) => {
  return jwt.sign({ _id: user._id.toString(), role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (error) {
    throw error;
  }
};

export { generateToken, verifyToken };
