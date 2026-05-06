import bcryptjs from 'bcryptjs';

async function test() {
  const salt = await bcryptjs.genSalt(10);
  const hashed = await bcryptjs.hash('password123', salt);
  console.log('Hashed:', hashed);
  const match = await bcryptjs.compare('password123', hashed);
  console.log('Match:', match);
}

test().catch(console.error);
