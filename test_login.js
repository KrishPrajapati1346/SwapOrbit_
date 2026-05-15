const axios = require('axios');
async function test() {
  const api = axios.create({ baseURL: 'http://localhost:8080', validateStatus: () => true });
  // Try to signup without photo (might fail if photo is required, wait signup form uses multer)
  // Let's just create a user directly in DB
  const mongoose = require('mongoose');
  require('dotenv').config({ path: '.env' });
  await mongoose.connect(process.env.ATLASDB_URL);
  const User = require('./backend/models/user');
  
  // Create test user
  await User.deleteMany({ username: 'testuser123' });
  const newUser = new User({ username: 'testuser123', email: 'test@example.com', role: 'buyer' });
  await User.register(newUser, 'password123');
  
  // Try to login
  const res = await api.post('/login', { username: 'testuser123', password: 'password123' });
  console.log('Login status:', res.status);
  console.log('Login headers:', res.headers);
  process.exit(0);
}
test();
