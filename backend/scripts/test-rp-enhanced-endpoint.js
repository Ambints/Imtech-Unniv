const axios = require('axios');

async function testEndpoint() {
  const baseURL = 'http://localhost:4000/api/v1';
  
  // Remplacez par votre token JWT réel
  const token = 'VOTRE_TOKEN_JWT';
  const tenantId = 'eaceef7f-dd73-46bd-9d77-231896181cca';
  
  console.log('🧪 Test des endpoints rp-enhanced\n');
  console.log('='.repeat(80));
  
  const headers = {
    'Authorization': `Bearer ${token}`,
    'X-Tenant-ID': tenantId,
    'Content-Type': 'application/json'
  };
  
  try {
    // Test 1: GET /rp-enhanced/mes-parcours
    console.log('\n1️⃣ Test GET /rp-enhanced/mes-parcours');
    const parcoursResponse = await axios.get(`${baseURL}/rp-enhanced/mes-parcours`, { headers });
    console.log('✅ Succès:', parcoursResponse.status);
    console.log('   Parcours trouvés:', parcoursResponse.data.length);
    
    // Test 2: GET /rp-enhanced/affectations
    console.log('\n2️⃣ Test GET /rp-enhanced/affectations');
    const affectationsResponse = await axios.get(`${baseURL}/rp-enhanced/affectations`, { headers });
    console.log('✅ Succès:', affectationsResponse.status);
    console.log('   Affectations trouvées:', affectationsResponse.data.length);
    
    // Test 3: POST /rp-enhanced/affectations
    console.log('\n3️⃣ Test POST /rp-enhanced/affectations');
    const postData = {
      enseignantId: 'df99c1d6-092f-4b1e-baf9-074c9480fc0b',
      ueId: 'UNE_UE_ID',
      anneeAcademiqueId: 'UNE_ANNEE_ID',
      typeSeance: 'CM',
      volumePrevu: 30
    };
    
    try {
      const postResponse = await axios.post(`${baseURL}/rp-enhanced/affectations`, postData, { headers });
      console.log('✅ Succès:', postResponse.status);
    } catch (postError) {
      if (postError.response) {
        console.log('❌ Erreur:', postError.response.status, postError.response.statusText);
        console.log('   Message:', postError.response.data.message || postError.response.data);
      } else {
        console.log('❌ Erreur réseau:', postError.message);
      }
    }
    
  } catch (error) {
    if (error.response) {
      console.log('❌ Erreur HTTP:', error.response.status, error.response.statusText);
      console.log('   URL:', error.config.url);
      console.log('   Message:', error.response.data.message || error.response.data);
    } else {
      console.log('❌ Erreur:', error.message);
    }
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('\n💡 Si vous voyez des erreurs 404, le contrôleur n\'est pas chargé correctement.');
  console.log('💡 Si vous voyez des erreurs 401, le token JWT n\'est pas valide.');
  console.log('💡 Si vous voyez des erreurs 400/500, l\'endpoint existe mais il y a un problème avec les données.');
}

testEndpoint();

// Made with Bob
