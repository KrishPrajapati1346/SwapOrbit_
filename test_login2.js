const axios = require('axios');
async function test() {
  const api = axios.create({ baseURL: 'http://localhost:8080', validateStatus: () => true, maxRedirects: 0 });
  
  const res = await api.post('/login', { username: 'testuser123', password: 'password123' });
  console.log('Login status:', res.status);
  console.log('Login headers location:', res.headers.location);
  process.exit(0);
}
test();
