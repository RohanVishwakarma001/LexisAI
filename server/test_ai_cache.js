const axios = require('axios');

async function runTest() {
  try {
    console.log("1. Attempting login...");
    const loginRes = await axios.post('http://localhost:5000/api/v1/auth/login', {
      email: 'rohanvishwakarma8261@gmail.com',
      password: 'password123'
    });
    
    const cookies = loginRes.headers['set-cookie'];
    const authHeader = {
      Cookie: cookies ? cookies.map(c => c.split(';')[0]).join('; ') : ''
    };

    console.log("2. Sending First AI query (should hit sandbox engine and store in cache)...");
    const t0 = Date.now();
    const res1 = await axios.post('http://localhost:5000/api/v1/ai/chat', {
      message: 'can u explain article 302 from india'
    }, { headers: authHeader });
    const d1 = Date.now() - t0;
    
    console.log(`First Query Time: ${d1}ms | Response Live: ${res1.data.data.live} | Cached: ${res1.data.data.cached}`);

    console.log("\n3. Sending Second AI query (SAME QUERY - should instantly hit LRU cache)...");
    const t1 = Date.now();
    const res2 = await axios.post('http://localhost:5000/api/v1/ai/chat', {
      message: 'can u explain article 302 from india'
    }, { headers: authHeader });
    const d2 = Date.now() - t1;

    console.log(`Second Query Time: ${d2}ms | Response Live: ${res2.data.data.live} | Cached: ${res2.data.data.cached}`);

    if (res2.data.data.cached === true) {
      console.log("\n🎉 TEST SUCCESSFUL! Caching layers and smart routing is functioning at a Senior-Developer tier!");
    } else {
      console.error("\n❌ TEST FAILED: Second query was not cached!");
    }

  } catch (err) {
    console.error("Test execution failed:", err.message);
    if (err.response) {
      console.error("Response Details:", err.response.status, err.response.data);
    }
  }
}

runTest();
