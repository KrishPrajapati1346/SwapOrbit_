const axios = require('axios');
async function test() {
  const api = axios.create({ baseURL: 'http://localhost:8080', validateStatus: () => true, maxRedirects: 0 });
  const params = new URLSearchParams();
  params.append('username', 'testuser123');
  params.append('password', 'password123');
  const res = await api.post('/login', params);
  console.log('Login status:', res.status);
  console.log('Login headers location:', res.headers.location);
  process.exit(0);
}
test();
