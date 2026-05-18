const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:2007@localhost:5432/Imtech_SaaS'
});

async function checkStatut() {
  try {
    await client.connect();
    
    const result = await client.query(`
      SELECT statut, COUNT(*) as count 
      FROM tenant_ispm.inscription 
      GROUP BY statut
    `);
    
    console.log('Statuts dans la table inscription:');
    result.rows.forEach(row => {
      console.log(`  ${row.statut || 'NULL'}: ${row.count} inscription(s)`);
    });
    
    // Afficher un exemple d'inscription
    const sample = await client.query(`
      SELECT id, etudiant_id, parcours_id, statut, date_inscription
      FROM tenant_ispm.inscription
      LIMIT 1
    `);
    
    console.log('\nExemple d\'inscription:');
    console.log(sample.rows[0]);
    
  } catch (error) {
    console.error('Erreur:', error.message);
  } finally {
    await client.end();
  }
}

checkStatut();

// Made with Bob
