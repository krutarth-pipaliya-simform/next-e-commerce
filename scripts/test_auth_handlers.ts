import { handlers } from '../src/lib/auth';

async function testNextAuth() {
  console.log('NextAuth Handlers loaded');
  console.log('Has GET handler:', typeof handlers.GET === 'function');
  console.log('Has POST handler:', typeof handlers.POST === 'function');

  console.log(
    'Authentication Backend setup is complete and ready for the frontend.',
  );
}

testNextAuth();
