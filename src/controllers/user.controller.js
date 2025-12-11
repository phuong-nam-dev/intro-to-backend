import bcrypt from "bcrypt";

import jwt from "jsonwebtoken";

import User from "../models/user.model.js";

const getJwtSecret = () => (process.env.JWT_SECRET || "").trim();

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

const registerUser = async (req, res) => {
  try {
    const { username, password, email } = req.body;

    if (!username || !password || !email) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const existingUser = await User.findOne({
      username,
      email: email.toLowerCase(),
    });
    if (existingUser) {
      return res
        .status(409)
        .json({ message: "Username or email already exists." });
    }

    const user = await User.create({
      username,
      password,
      email: email.toLowerCase(),
      loggedIn: true,
    });

    const token = generateToken(user._id);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.status(201).json({
      message: "User registered successfully.",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error.", error: error.message });
  }
};

const logginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(400).json({ message: "User not found." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

    user.loggedIn = true;
    await user.save();

    const token = generateToken(user._id);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: "User logged in successfully.",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
      token,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal server error.", error: error.message });
  }
};

const logoutUser = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found." });
    }

    user.loggedIn = false;
    await user.save();

    res.clearCookie("token", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    return res.status(200).json({ message: "User logged out successfully." });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error.", error: error.message });
  }
};

const authMiddleware = async (req, res, next) => {
  try {
    // ưu tiên header Authorization, fallback cookie 'token'
    const authHeader = req.headers.authorization || req.headers.Authorization;
    const tokenFromHeader =
      authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : null;

    const tokenFromCookie = req.cookies?.token || null;

    const token = tokenFromHeader || tokenFromCookie;

    if (!token) {
      return res.status(401).json({ message: "No token provided." });
    }

    let decoded;
    try {
      const secret = getJwtSecret();
      if (!secret) {
        console.error("JWT secret is missing in environment");
        return res
          .status(500)
          .json({ message: "Server JWT misconfiguration." });
      }
      decoded = jwt.verify(token, secret);
    } catch (err) {
      console.error("JWT verify error:", err.name, err.message);
      return res.status(401).json({ message: "Token is invalid or expired." });
    }

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "User not found." });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

const getCurrentUser = async (req, res) => {
  try {
    const user = req.user;

    return res.status(200).json({
      message: "Current user fetched successfully.",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        loggedIn: user.loggedIn ?? undefined,
      },
    });
  } catch (error) {
    console.error("getCurrentUser error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error.", error: error.message });
  }
};

export { registerUser, logginUser, logoutUser, getCurrentUser, authMiddleware };
