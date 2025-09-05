import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/user.models.js";

const router = express.Router();

const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );

  const refreshToken = jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );

  return { accessToken, refreshToken };
};

router.post("/signup", async (req, res) => {
  try {
    const {
      companyName,
      address,
      email,
      primaryNumber,
      gstNumber,
      password,
      alternateNumber,
    } = req.body;
    if (
      !companyName ||
      !address ||
      !primaryNumber ||
      !gstNumber ||
      !email ||
      !password
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      companyName,
      address,
      email,
      primaryNumber,
      alternateNumber,
      gstNumber,
      password: hashedPassword,
    });

    await newUser.save();

    const { accessToken, refreshToken } = generateTokens(newUser);
    newUser.refreshToken = refreshToken;
    await newUser.save();

    res.status(201).json({
      message: "Signup successful",
      user: {
        id: newUser._id,
        companyName: newUser.companyName,
        address: newUser.address,
        email: newUser.email,
        primaryNumber: newUser.primaryNumber,
        alternateNumber: newUser.alternateNumber,
        gstNumber: newUser.gstNumber,
      },
      accessToken,
      refreshToken,
    });
  } catch (err) {
    console.log("Signup failed", err);
    res.status(500).json({ message: "Signup failed" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const { accessToken, refreshToken } = generateTokens(user);

    user.refreshToken = refreshToken;

    await user.save();

    res.json({
      message: "Login successful",
      user: {
        id: user._id,
        companyName: user.companyName,
        address: user.address,
        email: user.email,
        primaryNumber: user.primaryNumber,
        gstNumber: user.gstNumber,
      },
      accessToken,
      refreshToken,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Login failed" });
  }
});

router.post("/logout", async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token required" });
    }

    const user = await User.findOne({ refreshToken });
    if (!user) {
      return res.status(400).json({ message: "Invalid refresh token" });
    }

    user.refreshToken = null;
    await user.save();

    res.status(200).json({ message: "Logged out successfully" });
  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).json({ message: "Server error during logout" });
  }
});

router.post("/refresh", async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ message: "Refresh token required" });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res
        .status(403)
        .json({ message: "Invalid or expired refresh token" });
    }

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);

    user.refreshToken = newRefreshToken;
    await user.save();

    res.json({ accessToken, refreshToken: newRefreshToken });
  } catch (err) {
    return res
      .status(403)
      .json({ message: "Invalid or expired refresh token" });
  }
});

export default router;
