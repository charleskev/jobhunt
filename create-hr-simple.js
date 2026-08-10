import bcrypt from 'bcryptjs';
import { User } from './models/User.js';
import { sequelize } from './models/db.js';

async function createHRAdmin() {
  try {
    await sequelize.sync();

    // Delete if exists
    await User.destroy({ where: { email: 'hr@example.com' } });

    const email = 'hr@example.com';
    const password = 'HR123456';

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      email: email,
      password: hashedPassword,
      firstName: 'HR',
      lastName: 'Admin',
      userType: 'hr_admin',
      isActive: true,
      isVerified: true
    });

    console.log('\n✓ HR Admin account created!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('Role: HR Administrator');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

createHRAdmin();
