const axios = require('axios');

async function testDepensesEndpoint() {
  try {
    console.log('🔍 Testing /api/v1/economat/depenses endpoint...\n');
    
    // You'll need to replace this with a valid JWT token from your login
    const token = 'YOUR_JWT_TOKEN_HERE';
    
    const response = await axios.get('http://localhost:4000/api/v1/economat/depenses', {
      params: {
        page: 1,
        limit: 10
      },
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Success!');
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error.response?.status, error.response?.statusText);
    console.error('Error data:', error.response?.data);
    console.error('Full error:', error.message);
  }
}

testDepensesEndpoint();

// Made with Bob
