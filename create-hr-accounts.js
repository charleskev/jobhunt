import { User } from "./models/index.js";
import bcrypt from "bcryptjs";

async function createAccounts() {
  try {
    // Create 3 HR accounts
    const hrAccounts = [
      {
        firstName: "Maria",
        lastName: "Santos",
        email: "maria.hr@huntjob.com",
        password: await bcrypt.hash("HR@12345", 10),
        userType: "hr_admin",
        isVerified: true,
        isActive: true
      },
      {
        firstName: "John",
        lastName: "Rivera",
        email: "john.hr@huntjob.com",
        password: await bcrypt.hash("HR@12345", 10),
        userType: "hr_admin",
        isVerified: true,
        isActive: true
      },
      {
        firstName: "Angela",
        lastName: "Lopez",
        email: "angela.hr@huntjob.com",
        password: await bcrypt.hash("HR@12345", 10),
        userType: "hr_admin",
        isVerified: true,
        isActive: true
      }
    ];

    // Create 3 Manager accounts
    const managerAccounts = [
      {
        firstName: "Robert",
        lastName: "Garcia",
        email: "robert.manager@huntjob.com",
        password: await bcrypt.hash("Manager@123", 10),
        userType: "dept_manager",
        isVerified: true,
        isActive: true
      },
      {
        firstName: "Lisa",
        lastName: "Fernandez",
        email: "lisa.manager@huntjob.com",
        password: await bcrypt.hash("Manager@123", 10),
        userType: "dept_manager",
        isVerified: true,
        isActive: true
      },
      {
        firstName: "David",
        lastName: "Morales",
        email: "david.manager@huntjob.com",
        password: await bcrypt.hash("Manager@123", 10),
        userType: "dept_manager",
        isVerified: true,
        isActive: true
      }
    ];

    // Create HR accounts
    console.log("Creating HR accounts...");
    for (const hrAccount of hrAccounts) {
      const existing = await User.findOne({ where: { email: hrAccount.email } });
      if (existing) {
        console.log(`HR account ${hrAccount.email} already exists`);
      } else {
        await User.create(hrAccount);
        console.log(`✅ Created HR account: ${hrAccount.email}`);
      }
    }

    // Create Manager accounts
    console.log("\nCreating Manager accounts...");
    for (const managerAccount of managerAccounts) {
      const existing = await User.findOne({ where: { email: managerAccount.email } });
      if (existing) {
        console.log(`Manager account ${managerAccount.email} already exists`);
      } else {
        await User.create(managerAccount);
        console.log(`✅ Created Manager account: ${managerAccount.email}`);
      }
    }

    console.log("\n✅ All accounts created successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error creating accounts:", error);
    process.exit(1);
  }
}

createAccounts();
