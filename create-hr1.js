import bcrypt from 'bcryptjs';
import { User } from './models/User.js';
import { sequelize } from './models/db.js';

async function createHR1Account() {
  try {
    await sequelize.sync();

    // Delete if exists
    await User.destroy({ where: { email: 'hr1@huntjob.com' } });

    const email = 'hr1@huntjob.com';
    const password = 'HR1234567';

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      email: email,
      password: hashedPassword,
      firstName: 'HR',
      lastName: 'One',
      userType: 'hr_admin',
      isActive: true,
      isVerified: true
    });

    console.log('\n✓ HR 1 account created!');
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

createHR1Account();
