const axios = require('axios');

async function testEndpoint() {
  try {
    console.log('🔍 Testing API endpoint directly...\n');
    
    // You'll need to replace this token with a valid JWT token from your login
    const token = 'YOUR_JWT_TOKEN_HERE';
    
    const response = await axios.get('http://localhost:4000/api/v1/economat/depenses', {
      params: {
        page: 1,
        limit: 10
      },
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Success!');
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ Error occurred:');
    console.error('Status:', error.response?.status);
    console.error('Status Text:', error.response?.statusText);
    console.error('Error Data:', JSON.stringify(error.response?.data, null, 2));
    console.error('Error Message:', error.message);
    
    if (error.response?.data?.message) {
      console.error('\n📋 Detailed Error Message:');
      console.error(error.response.data.message);
    }
    
    if (error.response?.data?.stack) {
      console.error('\n📚 Stack Trace:');
      console.error(error.response.data.stack);
    }
  }
}

testEndpoint();

// Made with Bob
