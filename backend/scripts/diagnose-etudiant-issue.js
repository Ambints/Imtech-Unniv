const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'Imtech_SaaS',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
});

async function diagnoseEtudiantIssue() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 DIAGNOSTIC: Pourquoi les étudiants n\'apparaissent pas\n');
    console.log('='.repeat(70) + '\n');
    
    // Récupérer le tenant actif
    const tenants = await client.query(
      "SELECT id, nom, schema_name FROM public.tenant WHERE actif = true ORDER BY nom"
    );
    
    for (const tenant of tenants.rows) {
      console.log(`\n📊 TENANT: ${tenant.nom} (${tenant.schema_name})`);
      console.log('-'.repeat(70));
      
      await client.query(`SET search_path TO "${tenant.schema_name}", public`);
      
      // 1. Vérifier si la table etudiant existe
      console.log('\n1️⃣  Vérification de la table etudiant:');
      const tableExists = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = '${tenant.schema_name}'
          AND table_name = 'etudiant'
        );
      `);
      
      if (!tableExists.rows[0].exists) {
        console.log('   ❌ La table etudiant N\'EXISTE PAS dans ce schéma!');
        console.log('   💡 Solution: Créer la table etudiant');
        continue;
      }
      console.log('   ✅ La table etudiant existe');
      
      // 2. Compter les étudiants dans la table
      console.log('\n2️⃣  Nombre d\'étudiants dans la table:');
      const countEtudiants = await client.query(`SELECT COUNT(*) as count FROM etudiant`);
      const nbEtudiants = parseInt(countEtudiants.rows[0].count);
      console.log(`   📊 ${nbEtudiants} étudiant(s) dans la table etudiant`);
      
      if (nbEtudiants === 0) {
        console.log('   ⚠️  La table etudiant est VIDE!');
      }
      
      // 3. Vérifier la structure de la table
      console.log('\n3️⃣  Structure de la table etudiant:');
      const columns = await client.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_schema = '${tenant.schema_name}'
        AND table_name = 'etudiant'
        ORDER BY ordinal_position
      `);
      
      columns.rows.forEach(col => {
        console.log(`   - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`);
      });
      
      // 4. Vérifier les utilisateurs avec role='etudiant'
      console.log('\n4️⃣  Utilisateurs avec role=\'etudiant\':');
      const utilisateursEtudiants = await client.query(`
        SELECT COUNT(*) as count FROM utilisateur WHERE role = 'etudiant'
      `);
      const nbUtilisateurs = parseInt(utilisateursEtudiants.rows[0].count);
      console.log(`   📊 ${nbUtilisateurs} utilisateur(s) avec role='etudiant'`);
      
      // 5. Vérifier la correspondance entre utilisateur et etudiant
      console.log('\n5️⃣  Correspondance utilisateur ↔ etudiant:');
      const correspondance = await client.query(`
        SELECT 
          u.id as utilisateur_id,
          u.nom,
          u.prenom,
          u.email,
          u.role,
          e.id as etudiant_id,
          e.matricule
        FROM utilisateur u
        LEFT JOIN etudiant e ON e.utilisateur_id = u.id
        WHERE u.role = 'etudiant'
        ORDER BY u.nom, u.prenom
      `);
      
      if (correspondance.rows.length === 0) {
        console.log('   ⚠️  Aucun utilisateur avec role=\'etudiant\' trouvé');
      } else {
        correspondance.rows.forEach(row => {
          if (row.etudiant_id) {
            console.log(`   ✅ ${row.nom} ${row.prenom} → etudiant.id=${row.etudiant_id} (${row.matricule})`);
          } else {
            console.log(`   ❌ ${row.nom} ${row.prenom} → PAS d'entrée dans etudiant!`);
          }
        });
      }
      
      // 6. Lister les étudiants existants
      if (nbEtudiants > 0) {
        console.log('\n6️⃣  Étudiants existants dans la table:');
        const etudiants = await client.query(`
          SELECT 
            e.id,
            e.matricule,
            e.utilisateur_id,
            u.nom,
            u.prenom,
            e.statut_inscription
          FROM etudiant e
          LEFT JOIN utilisateur u ON u.id = e.utilisateur_id
          ORDER BY e.created_at DESC
          LIMIT 10
        `);
        
        etudiants.rows.forEach(etud => {
          const userName = etud.nom && etud.prenom ? `${etud.nom} ${etud.prenom}` : 'UTILISATEUR MANQUANT';
          console.log(`   - ${etud.matricule}: ${userName} (statut: ${etud.statut_inscription || 'N/A'})`);
        });
      }
      
      // 7. Diagnostic final
      console.log('\n7️⃣  DIAGNOSTIC:');
      if (nbEtudiants === 0 && nbUtilisateurs > 0) {
        console.log('   🔴 PROBLÈME: Vous avez des utilisateurs avec role=\'etudiant\'');
        console.log('      mais AUCUNE entrée dans la table etudiant!');
        console.log('\n   💡 SOLUTION:');
        console.log('      Créez des entrées dans la table etudiant pour chaque utilisateur:');
        console.log(`      
      INSERT INTO etudiant (utilisateur_id, matricule, statut_inscription)
      SELECT 
        u.id,
        'ETU' || LPAD(ROW_NUMBER() OVER (ORDER BY u.created_at)::TEXT, 6, '0'),
        'actif'
      FROM utilisateur u
      WHERE u.role = 'etudiant'
      AND NOT EXISTS (SELECT 1 FROM etudiant e WHERE e.utilisateur_id = u.id);
      `);
      } else if (nbEtudiants > 0 && nbUtilisateurs === 0) {
        console.log('   🔴 PROBLÈME: Vous avez des étudiants dans la table');
        console.log('      mais AUCUN utilisateur avec role=\'etudiant\'!');
        console.log('\n   💡 SOLUTION:');
        console.log('      Vérifiez que les utilisateurs ont le bon rôle.');
      } else if (nbEtudiants === 0 && nbUtilisateurs === 0) {
        console.log('   🔴 PROBLÈME: Aucun étudiant trouvé nulle part!');
        console.log('\n   💡 SOLUTION:');
        console.log('      1. Créez d\'abord un utilisateur avec role=\'etudiant\'');
        console.log('      2. Puis créez une entrée correspondante dans etudiant');
      } else {
        const orphelins = correspondance.rows.filter(r => !r.etudiant_id).length;
        if (orphelins > 0) {
          console.log(`   ⚠️  ${orphelins} utilisateur(s) sans entrée etudiant`);
          console.log('      Exécutez la requête SQL ci-dessus pour les créer.');
        } else {
          console.log('   ✅ Tout semble correct!');
          console.log('      Si les étudiants n\'apparaissent toujours pas,');
          console.log('      vérifiez le frontend et l\'endpoint API.');
        }
      }
    }
    
    console.log('\n' + '='.repeat(70));
    console.log('✅ Diagnostic terminé\n');
    
  } catch (error) {
    console.error('\n❌ ERREUR:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    client.release();
    await pool.end();
  }
}

console.log('🚀 Démarrage du diagnostic...\n');
diagnoseEtudiantIssue()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  });

// Made with Bob
