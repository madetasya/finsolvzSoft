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

    const emailBody = `Greetings! \n\nLooks like you forgot your password. \n\nClick the link below to reset your password:\n\n ${resetLink} \n\nThis link expires in 1 hour. ⏳\n\nIf you didn’t request this, either someone’s trying to hack you, or you’re just forgot about it. Either way, ignore this email.\n\nStay safe,\nFinsolvz by Adviz`;

    await sendEmail(user.email, "Finsolvz Password Reset Request", emailBody);

    res.status(200).json({ message: "Password reset link sent to your email" });
  } catch (error) {
    next({ name: "Error", error });
  }
};
