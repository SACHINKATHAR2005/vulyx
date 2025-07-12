import { User } from "../model/user.model.js"

export const verifyApiKey = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Missing token" });
  }

  const token = authHeader.split(" ")[1];

  const user = await User.findOne({ apiKey: token });

  if (!user) {
    return res.status(403).json({ success: false, message: "Invalid API key" });
  }

  // Track usage (increase scan count)
  await User.findByIdAndUpdate(user._id, { $inc: { scanCount: 1 } });

  req.user = user;
  next();
};
