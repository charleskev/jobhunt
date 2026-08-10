/*
Test account creation script for HuntJob
Creates a test applicant account to view jobs
*/

import { User } from "./models/index.js";
import bcrypt from "bcryptjs";
import { sequelize } from "./models/db.js";

async function createTestApplicant() {
  try {
    await sequelize.authenticate();
    console.log("✓ Database connected");

    // Check if user already exists
    const existingUser = await User.findOne({
      where: { email: "applicant@example.com" }
    });

    if (existingUser) {
      console.log("✓ Test applicant already exists");
      console.log("📧 Email: applicant@example.com");
      console.log("🔑 Password: TestPass123");
      process.exit(0);
    }

    // Create new applicant
    const hashedPassword = await bcrypt.hash("TestPass123", 10);

    const user = await User.create({
      email: "applicant@example.com",
      password: hashedPassword,
      firstName: "Test",
      lastName: "Applicant",
      userType: "applicant",
      isActive: true,
      isVerified: true
    });

    console.log("✓ Test applicant created successfully!");
    console.log("📧 Email: applicant@example.com");
    console.log("🔑 Password: TestPass123");
    console.log("\nYou can now login and view the jobs page with both:");
    console.log("  • Municipal jobs (created by HR)");
    console.log("  • Department jobs (created by Managers)");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating test applicant:", error.message);
    process.exit(1);
  }
}

createTestApplicant();
