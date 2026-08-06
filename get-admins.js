import { User } from "./models/index.js";

async function getAdmins() {
  try {
    const admins = await User.findAll({
      where: {
        userType: ['hr_admin', 'sys_admin', 'dept_manager']
      },
      attributes: ['id', 'email', 'firstName', 'lastName', 'userType', 'isActive', 'isVerified', 'createdAt']
    });
    
    console.log("\n=== HR & ADMIN ACCOUNTS ===\n");
    admins.forEach(admin => {
      console.log(`Email: ${admin.email}`);
      console.log(`Name: ${admin.firstName} ${admin.lastName}`);
      console.log(`Role: ${admin.userType}`);
      console.log(`Active: ${admin.isActive ? 'Yes' : 'No'}`);
      console.log(`Verified: ${admin.isVerified ? 'Yes' : 'No'}`);
      console.log(`Created: ${admin.createdAt}`);
      console.log("---");
    });
    
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

getAdmins();
