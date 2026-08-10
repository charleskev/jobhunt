
 import bcrypt from 'bcryptjs';
import { User } from './models/User.js';
import { sequelize } from './models/db.js';

async function createAdmin() {
  try {
    // Sync database
    await sequelize.sync();
    
    const adminEmail = 'admin@gmail.com';
    const adminPassword = 'Admin@123456';
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ where: { email: adminEmail } });
    
    if (existingAdmin) {
      console.log('✓ Admin account already exists:', adminEmail);
      return;
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    
    // Create admin user
    const admin = await User.create({
      email: adminEmail,
      password: hashedPassword,
      firstName: 'System',
      lastName: 'Administrator',
      userType: 'sys_admin',
      isActive: true,
      isVerified: true
    });
    
    console.log('✓ Admin account created successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Email:', adminEmail);
    console.log('Password:', adminPassword);
    console.log('Role:', 'System Administrator');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n⚠️  Please change the password after first login!');
    
  } catch (error) {
    console.error('Error creating admin account:', error.message);
  } finally {
    await sequelize.close();
  }
}

createAdmin();
