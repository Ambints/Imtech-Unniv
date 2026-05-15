const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: '2007',
  database: 'Imtech_SaaS'
});

(async () => {
  try {
    // Vérifier les schémas tenants
    const schemas = await pool.query(`
      SELECT schema_name 
      FROM information_schema.schemata 
      WHERE schema_name LIKE 'tenant_%'
      ORDER BY schema_name
    `);
    
    console.log('\n📋 SCHÉMAS TENANTS TROUVÉS:');
    schemas.rows.forEach(s => console.log('  -', s.schema_name));
    
    // Pour chaque schéma, vérifier les utilisateurs
    for (const schema of schemas.rows) {
      const schemaName = schema.schema_name;
      console.log(`\n🔍 SCHÉMA: ${schemaName}`);
      
      // Vérifier si la table utilisateur existe
      const tableExists = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = '${schemaName}' 
          AND table_name = 'utilisateur'
        )
      `);
      
      if (!tableExists.rows[0].exists) {
        console.log('  ⚠️ Table utilisateur n\'existe pas');
        continue;
      }
      
      // Lister les rôles disponibles
      await pool.query(`SET search_path TO ${schemaName}, public`);
      
      const roles = await pool.query(`
        SELECT DISTINCT role, COUNT(*) as count
        FROM utilisateur
        WHERE actif = true
        GROUP BY role
        ORDER BY role
      `);
      
      console.log('  📊 Rôles disponibles:');
      if (roles.rows && roles.rows.length > 0) {
        roles.rows.forEach(r => console.log(`    - ${r.role}: ${r.count} utilisateur(s)`));
      } else {
        console.log('    ⚠️ Aucun utilisateur actif trouvé');
      }
      
      // Vérifier si table enseignant existe
      const enseignantExists = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables
          WHERE table_schema = '${schemaName}'
          AND table_name = 'enseignant'
        )
      `);
      
      if (enseignantExists.rows[0].exists) {
        const enseignants = await pool.query(`
          SELECT COUNT(*) as count FROM enseignant
        `);
        console.log(`  👨‍🏫 Enseignants existants: ${enseignants.rows[0].count}`);
        
        // Lister quelques enseignants
        const sample = await pool.query(`
          SELECT e.matricule, e.nom, e.prenom, u.role
          FROM enseignant e
          LEFT JOIN utilisateur u ON u.id = e.utilisateur_id
          LIMIT 5
        `);
        
        if (sample.rows && sample.rows.length > 0) {
          console.log('  📝 Exemples d\'enseignants:');
          sample.rows.forEach(e => console.log(`    - ${e.matricule}: ${e.nom} ${e.prenom} (role: ${e.role || 'N/A'})`));
        }
      } else {
        console.log('  ⚠️ Table enseignant n\'existe pas');
      }
      
      // Chercher des utilisateurs qui pourraient être professeurs
      const potentialProfs = await pool.query(`
        SELECT id, nom, prenom, email, role
        FROM utilisateur
        WHERE actif = true
        AND (
          role ILIKE '%prof%'
          OR role ILIKE '%enseignant%'
          OR role ILIKE '%teacher%'
        )
        LIMIT 10
      `);
      
      if (potentialProfs.rows && potentialProfs.rows.length > 0) {
        console.log('  🎓 Utilisateurs potentiellement professeurs:');
        potentialProfs.rows.forEach(u => console.log(`    - ${u.nom} ${u.prenom} (${u.email}) - role: ${u.role}`));
      } else {
        console.log('  ⚠️ Aucun utilisateur avec rôle contenant "prof", "enseignant" ou "teacher"');
      }
    }
    
    await pool.end();
    console.log('\n✅ Diagnostic terminé');
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
})();

// Made with Bob
