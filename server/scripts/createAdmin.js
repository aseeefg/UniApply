// One-time script to create an admin account.
// Run with: node scripts/createAdmin.js
// Safe to delete after use, or keep for creating additional admins later.

import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import connectDB from "../config/db.js";
import User from "../models/User.js";

dotenv.config();

const ADMIN_NAME = "Admin";
const ADMIN_EMAIL = "admin@uniapply.com";
const ADMIN_PASSWORD = "ChangeThisPassword123!"; // change this before running

const run = async () => {
  await connectDB();

  const existing = await User.findOne({ email: ADMIN_EMAIL });
  if (existing) {
    console.log("Admin already exists with this email.");
    process.exit(0);
  }

  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
  await User.create({
    name: ADMIN_NAME,
    email: ADMIN_EMAIL,
    password: hashedPassword,
    role: "admin",
  });

  console.log(`Admin created: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
