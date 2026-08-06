import bcrypt from 'bcrypt';
import { User } from './models/User.js';
import { sequelize } from './models/db.js';

async function fixHRAccount() {
  try {
    await sequelize.sync();

    // Delete old account
    await User.destroy({ where: { email: 'newhrmanager@huntjob.com' } });
    console.log('Deleted old account');

    // Create with new password
    const email = 'newhrmanager@huntjob.com';
    const password = 'Password123!';

    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Hashed password:', hashedPassword);

    const user = await User.create({
      email: email,
      password: hashedPassword,
      firstName: 'HR',
      lastName: 'Manager',
      userType: 'hr_admin',
      isActive: true,
      isVerified: true
    });

    console.log('\n✓ HR Manager account recreated!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('Role:', 'HR Administrator');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // Verify by fetching
    const fetched = await User.findOne({ where: { email } });
    console.log('\nVerification:');
    console.log('User found:', fetched.email);
    console.log('User type:', fetched.userType);
    console.log('Is active:', fetched.isActive);

    // Test password match
    const match = await bcrypt.compare(password, fetched.password);
    console.log('Password matches:', match);

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

fixHRAccount();
