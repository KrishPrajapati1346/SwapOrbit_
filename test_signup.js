const axios = require('axios');
async function test() {
  const api = axios.create({ baseURL: 'http://localhost:8080', validateStatus: () => true, maxRedirects: 0 });
  const params = new URLSearchParams();
  params.append('username', 'newuser1');
  params.append('email', 'newuser1@example.com');
  params.append('password', 'password123');
  params.append('phone', '1234567890');
  params.append('role', 'buyer');
  params.append('newLocation[country]', 'USA');
  params.append('newLocation[state]', 'NY');
  params.append('newLocation[city]', 'New York');
  params.append('newLocation[latitude]', '0');
  params.append('newLocation[longitude]', '0');

  const res = await api.post('/signup', params);
  console.log('Signup status:', res.status);
  console.log('Signup headers location:', res.headers.location);
  process.exit(0);
}
test();
