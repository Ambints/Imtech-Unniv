const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'Imtech_SaaS',
  user: 'postgres',
  password: '2007'
});

async function verifyConstraints() {
  const client = await pool.connect();
  
  try {
    console.log('\n🔍 Vérification des contraintes CHECK...\n');
    
    const schemasResult = await client.query(`
      SELECT schema_name 
      FROM information_schema.schemata 
      WHERE schema_name LIKE 'tenant_%'
      ORDER BY schema_name
    `);
    
    for (const { schema_name } of schemasResult.rows) {
      console.log(`📦 ${schema_name}:`);
      
      const constraintResult = await client.query(`
        SELECT conname, pg_get_constraintdef(oid) as definition
        FROM pg_constraint 
        WHERE conrelid = $1::regclass 
        AND contype = 'c'
        AND conname LIKE '%role%'
      `, [`${schema_name}.utilisateur`]);
      
      if (constraintResult.rows.length > 0) {
        for (const constraint of constraintResult.rows) {
          console.log(`  ✅ ${constraint.conname}`);
          const def = constraint.definition;
          
          // Vérifier si contient "enseignant"
          if (def.includes('enseignant')) {
            console.log(`     ✓ Contient "enseignant"`);
          } else {
            console.log(`     ✗ Ne contient PAS "enseignant"`);
          }
          
          // Vérifier si contient encore "professeur"
          if (def.includes('professeur')) {
            console.log(`     ⚠️  Contient encore "professeur"`);
          } else {
            console.log(`     ✓ Ne contient plus "professeur"`);
          }
        }
      } else {
        console.log(`  ⚠️  Aucune contrainte trouvée`);
      }
      console.log('');
    }
    
    console.log('✅ Vérification terminée!\n');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

verifyConstraints();

// Made with Bob
