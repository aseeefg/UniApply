import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

// @route POST /api/auth/register
export const register = async (req, res) => {
  try {
    const { name, email, password, role, universityProfile } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    if (!["student", "university"].includes(role)) {
      return res.status(400).json({ message: "Invalid role for self-registration" });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      universityProfile: role === "university" ? universityProfile : undefined,
    });

    res.status(201).json({
      message:
        role === "university"
          ? "Registered. Your account is pending admin verification."
          : "Registered successfully.",
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });

    if (!user.isActive) {
      return res.status(403).json({ message: "Account has been deactivated" });
    }
    if (user.role === "university" && user.verificationStatus !== "approved") {
      return res.status(403).json({
        message: `University account is ${user.verificationStatus}. Await admin approval.`,
      });
    }

    const token = generateToken(user._id);
    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/auth/me
export const getMe = async (req, res) => {
  res.json(req.user);
};
