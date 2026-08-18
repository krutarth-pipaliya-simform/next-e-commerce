import { registerUser } from '../src/actions/auth';
import { db } from '../src/lib/db';

async function main() {
  console.log('Testing User Registration...');

  const testEmail = `test_${Date.now()}@example.com`;
  const testPassword = 'securepassword123';

  console.log(`Registering user: ${testEmail}`);
  const result = await registerUser(testEmail, testPassword, 'Test User');

  console.log('Registration Result:', result);

  if (result.success && result.user) {
    const userInDb = await db.user.findUnique({
      where: { email: testEmail },
    });
    console.log('Verified User in DB:', userInDb ? 'YES' : 'NO');
    if (userInDb) {
      console.log(`User Name: ${userInDb.name}, Role: ${userInDb.role}`);
    }
  }

  process.exit(0);
}

main().catch((e) => {
  console.error('Test failed:', e);
  process.exit(1);
});
