import { User } from "../model/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { generateApiKey } from "../utils/generateApiKey.js";



export const RegisterUser = async (req, res) => {
    try {
        const { name, email, password, avatar, credits, role } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Please fill all the fields",
                success: false
            })
        }
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                message: "user already exists",
                success: false
            })
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            avatar: avatar || "",
            credits: 0,
            role: "user"
        });


        return res.status(201).json({
            message: `welcome ${user.name}`,
            success: true,
            user
        })
    } catch (error) {
        return res.status(500).json({
            message: "Internal Server Error",
            error: error.message,
            success: false
        })
    }
}




export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        message: "Please fill all the fields",
        success: false
      });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message: "User not found",
        success: false
      });
    }

    // Validate password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        message: "Invalid password",
        success: false
      });
    }

    // Create JWT token
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
        credits: user.credits
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // Send token as HTTP-only cookie
    res
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // HTTPS only in production
        sameSite: "Strict", // adjust if frontend is on a different domain
        maxAge: 24 * 60 * 60 * 1000 // 1 day
      })
      .status(200)
      .json({
        message: `Welcome back ${user.name}`,
        success: true,
        ...(process.env.NODE_ENV !== "production" && { token }),
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          credits: user.credits,
          apiKey,
        }
      });

  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
      success: false
    });
  }
};

export const logoutUser = (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict"
    });
    return res.status(200).json({
      message: "Logged out successfully",
      success: true
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
      success: false
    });
  }
}




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
