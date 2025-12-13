import bcrypt from "bcrypt";

import jwt from "jsonwebtoken";

import User from "../models/user.model.js";
import { signAccessToken, signRefreshToken } from "../utils/jwt.js";
import { refreshCookieOptions } from "../utils/cookie.js";

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
      tokenVersion: 0,
    });

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);

    user.refreshToken = refreshToken;
    await user.save();

    res.cookie("refreshToken", refreshToken, refreshCookieOptions);

    return res.status(201).json({
      message: "User registered successfully.",
      user: { id: user._id, username, email: user.email },
      accessToken,
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

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);

    user.refreshToken = refreshToken;
    await user.save();

    res.cookie("refreshToken", refreshToken, refreshCookieOptions);

    return res.status(200).json({
      message: "User logged in successfully.",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
      accessToken,
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

    const token = req.cookies?.refreshToken;

    if (token) {
      const user = await User.findOne({ refreshToken: token });
      user.refreshToken = null;
      user.tokenVersion += 1;
      await user.save();
    }

    res.clearCookie("refreshToken", refreshCookieOptions);

    return res.status(200).json({ message: "User logged out successfully." });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error.", error: error.message });
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
      },
    });
  } catch (error) {
    console.error("getCurrentUser error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error.", error: error.message });
  }
};

const refreshToken = async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (!token) return res.sendStatus(401);

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch {
    return res.sendStatus(401);
  }

  const user = await User.findById(payload.id);
  if (!user || user.refreshToken !== token) {
    user && (user.tokenVersion += 1);
    user && (user.refreshToken = null);
    user && (await user.save());
    res.clearCookie("refreshToken", refreshCookieOptions);
    return res.sendStatus(401);
  }

  const newAccess = signAccessToken(user);
  const newRefresh = signRefreshToken(user);

  user.refreshToken = newRefresh;
  await user.save();

  res.cookie("refreshToken", newRefresh, refreshCookieOptions);

  return res.json({
    message: "Token refreshed successfully.",
    accessToken: newAccess,
    user: { id: user._id, username: user.username, email: user.email },
  });
};

const verifyAccessToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer "))
    return res.status(401).json({ message: "No token" });

  try {
    const token = authHeader.split(" ")[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(payload.id);
    if (!user || user.tokenVersion !== payload.tokenVersion)
      return res.sendStatus(401);

    req.user = user;
    next();
  } catch {
    return res.sendStatus(401);
  }
};

export {
  registerUser,
  logginUser,
  logoutUser,
  getCurrentUser,
  refreshToken,
  verifyAccessToken,
};
