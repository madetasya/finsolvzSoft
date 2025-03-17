import jwt from "jsonwebtoken";
import User from "../models/UserModel.js";

const authentication = async (req, res, next) => {
  try {
    console.log("🔍 Incoming Headers:", req.headers);

    const { authorization } = req.headers;
    if (!authorization || !authorization.startsWith("Bearer ")) {
      console.log("❌ Missing or Invalid Authorization Header");
      return res.status(401).json({ error: "Unauthorized - Invalid Token Format" });
    }

    const token = authorization.split(" ")[1];
    console.log("🔍 Extracted Token:", token);

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("✅ Decoded Token:", decoded);

    if (!decoded._id) {
      console.log("❌ Token does not contain _id!");
      return res.status(401).json({ error: "Invalid Token - Missing User ID" });
    }

    console.log("🔍 Searching for user with ID:", decoded._id);
    const user = await User.findById(decoded._id);

    if (!user) {
      console.log("❌ User not found in DB");
      return res.status(401).json({ error: "Unauthorized - User Not Found" });
    }

    // 🔥 Attach user info to request object
    req.user = { _id: user._id.toString(), role: user.role };
    console.log("✅ User authenticated:", req.user);

    next();
  } catch (error) {
    console.log("❌ Token Verification Failed:", error.message);
    return res.status(401).json({ error: "Invalid Token" });
  }
};

export default authentication;
