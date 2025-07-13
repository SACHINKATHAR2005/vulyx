import { User } from "../model/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { generateApiKey } from "../utils/generateApiKey.js";

// ✅ Register Controller
export const RegisterUser = async (req, res) => {
  try {
    const { name, email, password, avatar } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Please fill all the fields",
        success: false,
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
        success: false,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const apiKey = generateApiKey();

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      avatar: avatar || "",
      credits: 50,
      role: "user",
      apiKey,
    });

    return res.status(201).json({
      message: `Welcome ${user.name}`,
      success: true,
      user,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
      success: false,
    });
  }
};

// ✅ Login Controller
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Please fill all the fields",
        success: false,
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message: "User not found",
        success: false,
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        message: "Invalid password",
        success: false,
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
        credits: user.credits,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // Set cookie with proper settings for cross-origin
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      // domain: ".onrender.com", // This is important for the render.com domain
      path: "/",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    return res.status(200).json({
      message: `Welcome back ${user.name}`,
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        credits: user.credits,
        apiKey: user.apiKey,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
      success: false,
    });
  }
};

// ✅ Logout Controller
export const logoutUser = (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: true, // Match with login
      sameSite: "None",
    });
    return res.status(200).json({
      message: "Logged out successfully",
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
      success: false,
    });
  }
};

// ✅ Regenerate API Key
export const regenerateApiKey = async (req, res) => {
  try {
    const newKey = generateApiKey();
    await User.findByIdAndUpdate(req.user.id, { apiKey: newKey });

    res.status(200).json({
      success: true,
      apiKey: newKey,
      message: "API key regenerated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to regenerate API key",
      error: error.message,
    });
  }
};

// ✅ Get API Key
export const getUserApiKey = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("apiKey");

    if (!user || !user.apiKey) {
      return res.status(404).json({
        success: false,
        message: "API key not found",
      });
    }

    return res.status(200).json({
      success: true,
      apiKey: user.apiKey,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch API key",
      error: error.message,
    });
  }
};
