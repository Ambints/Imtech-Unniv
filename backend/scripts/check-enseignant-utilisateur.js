const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'Imtech_SaaS',
  user: 'postgres',
  password: '2007'
});

async function checkEnseignant() {
  try {
    await client.connect();
    console.log('✅ Connecté à la base de données\n');

    // Vérifier les enseignants dans tenant_ispm
    await client.query(`SET search_path TO tenant_ispm`);
    
    const result = await client.query(`
      SELECT
        e.id,
        e.nom,
        e.prenom,
        e.utilisateur_id,
        u.email,
        u.tenant_id
      FROM enseignant e
      LEFT JOIN utilisateur u ON u.id = e.utilisateur_id
      WHERE e.actif = true
    `);

    console.log('📋 Enseignants actifs dans tenant_ispm:');
    console.log(JSON.stringify(result.rows, null, 2));

    if (result.rows.length === 0) {
      console.log('\n⚠️  Aucun enseignant actif trouvé');
    } else {
      result.rows.forEach(ens => {
        console.log(`\n👤 ${ens.nom} ${ens.prenom}`);
        console.log(`   ID: ${ens.id}`);
        console.log(`   Utilisateur ID: ${ens.utilisateur_id || 'NULL ❌'}`);
        console.log(`   Email: ${ens.email || 'NULL ❌'}`);
        console.log(`   Tenant ID: ${ens.tenant_id || 'NULL ❌'}`);
      });
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await client.end();
  }
}

checkEnseignant();

// Made with Bob
