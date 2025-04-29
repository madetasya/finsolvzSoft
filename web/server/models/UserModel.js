import mongoose from "mongoose";
// const crypto = require("crypto");

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, match: [/^\S+@\S+\.\S+$/] },
    password: { type: String, required: true, select: false },
    role: { type: String, required: true, enum: ["SUPER_ADMIN", "ADMIN", "CLIENT"] },
    company: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: false,
    }
  ],
    resetPasswordToken: { type: String, required: false },
    resetPasswordExpires: { type: Date, required: false },
  },
  { timestamps: true }
);

export default mongoose.model("User", UserSchema);
