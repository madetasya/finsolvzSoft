import jwt from "jsonwebtoken";

const authorization = (...roles) => { 
  return (req, res, next) => {
    console.log("🔍 Checking Authorization for user:", req.user);
    console.log("🔍 Allowed roles:", roles);

    if (!req.user) {
      console.log("❌ No user found in request");
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!roles.includes(req.user.role)) {
      console.log("❌ User does not have permission:", req.user.role);
      return res.status(403).json({ error: "Forbidden" });
    }

    console.log("✅ Authorization successful for:", req.user.role);
    next();
  };
};

const registerUser = (req, res, next) => {
  if (!req.user || req.user.role !== "SUPER_ADMIN") {
    return res.status(403).json({ error: "Forbidden" });
  }
  next();
};
export { authorization, registerUser };
