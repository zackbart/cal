import * as bcrypt from 'bcrypt';

async function testPassword() {
  const storedHash = '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj8/5Kz9Xv2K';
  const plainPassword = 'password';
  
  console.log('Testing password verification...');
  console.log('Stored hash:', storedHash);
  console.log('Plain password:', plainPassword);
  
  try {
    const isValid = await bcrypt.compare(plainPassword, storedHash);
    console.log('Password valid:', isValid);
    
    if (!isValid) {
      console.log('Creating new hash for comparison...');
      const newHash = await bcrypt.hash(plainPassword, 12);
      console.log('New hash:', newHash);
      
      const newIsValid = await bcrypt.compare(plainPassword, newHash);
      console.log('New hash valid:', newIsValid);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

testPassword();
