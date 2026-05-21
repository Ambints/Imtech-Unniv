const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'Imtech_SaaS',
  user: 'postgres',
  password: '2007'
});

async function fixRoleConstraint() {
  const client = await pool.connect();
  
  try {
    console.log('\n🔍 Vérification des contraintes CHECK sur la colonne role...\n');
    
    // Récupérer tous les schémas tenant
    const schemasResult = await client.query(`
      SELECT schema_name 
      FROM information_schema.schemata 
      WHERE schema_name LIKE 'tenant_%'
      ORDER BY schema_name
    `);
    
    console.log(`✅ ${schemasResult.rows.length} schéma(s) tenant trouvé(s)\n`);
    
    for (const { schema_name } of schemasResult.rows) {
      console.log(`📦 Traitement: ${schema_name}`);
      
      // Vérifier si la contrainte existe
      const constraintResult = await client.query(`
        SELECT conname, pg_get_constraintdef(oid) as definition
        FROM pg_constraint 
        WHERE conrelid = $1::regclass 
        AND contype = 'c'
        AND conname LIKE '%role%'
      `, [`${schema_name}.utilisateur`]);
      
      // D'abord, supprimer la contrainte
      if (constraintResult.rows.length > 0) {
        for (const constraint of constraintResult.rows) {
          console.log(`  📋 Contrainte trouvée: ${constraint.conname}`);
          console.log(`  📝 Définition: ${constraint.definition}`);
          
          await client.query(`
            ALTER TABLE ${schema_name}.utilisateur
            DROP CONSTRAINT IF EXISTS ${constraint.conname}
          `);
          console.log(`  ❌ Contrainte supprimée`);
        }
      }
      
      // Ensuite, mettre à jour les données
      const updateResult = await client.query(`
        UPDATE ${schema_name}.utilisateur
        SET role = 'enseignant'
        WHERE role = 'professeur'
      `);
      console.log(`  🔄 ${updateResult.rowCount} utilisateur(s) mis à jour`);
      
      // Enfin, créer la nouvelle contrainte avec "enseignant" et les bons noms de rôles
      await client.query(`
        ALTER TABLE ${schema_name}.utilisateur
        ADD CONSTRAINT utilisateur_role_check
        CHECK (role IN (
          'admin', 'resp_pedagogique', 'secretaire_parcours',
          'scolarite', 'caissier', 'economat', 'rh', 'logistique',
          'entretien', 'communication', 'president', 'surveillant_general',
          'etudiant', 'parent', 'enseignant'
        ))
      `);
      console.log(`  ✅ Nouvelle contrainte créée avec "enseignant"\n`);
    }
    
    console.log('✅ Toutes les contraintes ont été mises à jour!\n');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

fixRoleConstraint().catch(console.error);

// Made with Bob
