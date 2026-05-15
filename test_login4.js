const axios = require('axios');
async function test() {
  const api = axios.create({ baseURL: 'http://localhost:8080', validateStatus: () => true, maxRedirects: 0 });
  const params = new URLSearchParams();
  params.append('username', 'testuser123');
  params.append('password', 'password123');
  const res = await api.post('/login', params);
  const cookie = res.headers['set-cookie'][0];
  
  // Try accessing dashboard/product
  const res2 = await api.get('/product', { headers: { Cookie: cookie } });
  console.log('Product status:', res2.status);
  
  // Look for something in the page that indicates user is logged in
  // like "Sign Out"
  if (res2.data.includes('Sign Out')) {
      console.log('Found Sign Out - User is logged in!');
  } else {
      console.log('No Sign Out - User is NOT logged in.');
  }
  process.exit(0);
}
test();
