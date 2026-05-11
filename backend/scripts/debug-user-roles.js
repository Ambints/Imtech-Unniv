/**
 * Script pour déboguer les rôles des utilisateurs
 * Exécuter avec: node debug-user-roles.js <tenant_schema>
 * Exemple: node debug-user-roles.js tenant_ispm
 */

const { DataSource } = require('typeorm');

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'imtech',
  schema: 'public',
  synchronize: false,
});

async function checkUserRoles() {
  const schemaName = process.argv[2] || 'tenant_ispm';
  
  try {
    await dataSource.initialize();
    console.log(`✅ Connecté à la base de données\n`);
    
    // Vérifier tous les rôles distincts
    console.log(`📊 Rôles distincts dans le schéma "${schemaName}":`);
    const rolesResult = await dataSource.query(
      `SELECT DISTINCT role, COUNT(*) as count 
       FROM "${schemaName}".utilisateur 
       GROUP BY role 
       ORDER BY count DESC`
    );
    
    if (rolesResult.length === 0) {
      console.log('   ⚠️ Aucun utilisateur trouvé dans ce schéma');
    } else {
      rolesResult.forEach(r => {
        console.log(`   - "${r.role}": ${r.count} utilisateur(s)`);
      });
    }
    
    // Vérifier les utilisateurs avec rôle contenant 'sec'
    console.log(`\n🔍 Utilisateurs avec rôle contenant 'sec':`);
    const secUsers = await dataSource.query(
      `SELECT id, email, nom, prenom, role, actif 
       FROM "${schemaName}".utilisateur 
       WHERE LOWER(role) LIKE '%sec%'
       ORDER BY role, nom`
    );
    
    if (secUsers.length === 0) {
      console.log('   ⚠️ Aucun utilisateur trouvé');
    } else {
      secUsers.forEach(u => {
        console.log(`   - ${u.prenom} ${u.nom} (${u.email}) → role: "${u.role}"`);
      });
    }
    
    // Afficher tous les utilisateurs pour référence
    console.log(`\n👥 Tous les utilisateurs (${schemaName}):`);
    const allUsers = await dataSource.query(
      `SELECT id, email, nom, prenom, role, actif 
       FROM "${schemaName}".utilisateur 
       ORDER BY role, nom 
       LIMIT 10`
    );
    
    allUsers.forEach(u => {
      const status = u.actif ? '✅' : '❌';
      console.log(`   ${status} ${u.prenom} ${u.nom} (${u.email}) → "${u.role}"`);
    });
    
    if (allUsers.length >= 10) {
      console.log(`   ... et ${allUsers.length - 10} autres`);
    }
    
    await dataSource.destroy();
    console.log(`\n✅ Terminé`);
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

checkUserRoles();
