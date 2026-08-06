import bcrypt from 'bcrypt';
import { User } from './models/User.js';
import { sequelize } from './models/db.js';

async function createMorinAdmin() {
  try {
    await sequelize.sync();

    const email = 'morin@huntjob.com';
    const password = 'Morin@2026';

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      console.log('✓ Admin account already exists:', email);
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({
      email,
      password: hashedPassword,
      firstName: 'Morin',
      lastName: 'Administrator',
      userType: 'sys_admin',
      isActive: true,
      isVerified: true
    });

    console.log('✓ Morin admin account created successfully!');
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('Role: System Administrator');
    console.log('⚠️  Please change the password after first login!');
  } catch (error) {
    console.error('Error creating Morin admin account:', error.message);
  } finally {
    await sequelize.close();
  }
}

createMorinAdmin();
