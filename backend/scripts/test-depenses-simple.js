const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'imtech_university',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

async function testDepenses() {
  const client = await pool.connect();
  
  try {
    // Set schema
    await client.query('SET search_path TO tenant_test');
    console.log('✅ Schema set to tenant_test');
    
    // Test simple query
    const result = await client.query(`
      SELECT 
        d.id,
        d.libelle,
        d.montant,
        d.date_depense,
        d.fournisseur,
        d.statut
      FROM depense d
      ORDER BY d.date_depense DESC
      LIMIT 5
    `);
    
    console.log('\n✅ Query successful!');
    console.log(`Found ${result.rows.length} depenses:`);
    result.rows.forEach((row, i) => {
      console.log(`\n${i + 1}. ${row.libelle}`);
      console.log(`   Montant: ${row.montant}`);
      console.log(`   Statut: ${row.statut}`);
      console.log(`   Date: ${row.date_depense}`);
    });
    
    // Test with JOIN
    const result2 = await client.query(`
      SELECT 
        d.id,
        d.libelle,
        d.montant,
        CONCAT(u1.nom, ' ', u1.prenom) as demandeur
      FROM depense d
      LEFT JOIN utilisateur u1 ON d.demande_par = u1.id
      LIMIT 3
    `);
    
    console.log('\n✅ Query with JOIN successful!');
    console.log(`Found ${result2.rows.length} depenses with demandeur:`);
    result2.rows.forEach((row, i) => {
      console.log(`\n${i + 1}. ${row.libelle}`);
      console.log(`   Demandeur: ${row.demandeur || 'N/A'}`);
    });
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    client.release();
    await pool.end();
  }
}

testDepenses();

// Made with Bob
