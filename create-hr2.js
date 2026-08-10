import bcrypt from 'bcryptjs';
import { User } from './models/User.js';
import { sequelize } from './models/db.js';

async function createHR2Account() {
  try {
    await sequelize.sync();

    // Remove existing if present
    await User.destroy({ where: { email: 'hr2@huntjob.com' } });

    const email = 'hr2@huntjob.com';
    const password = 'HR2345678';

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      email: email,
      password: hashedPassword,
      firstName: 'HR',
      lastName: 'Two',
      userType: 'hr_admin',
      isActive: true,
      isVerified: true
    });

    console.log('\n✓ HR 2 account created!');
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

createHR2Account();
