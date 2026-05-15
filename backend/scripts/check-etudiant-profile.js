const { Client } = require('pg');

async function checkEtudiantProfile() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    database: 'Imtech_SaaS',
    user: 'postgres',
    password: '2007',
  });

  try {
    await client.connect();
    console.log('✅ Connecté à la base de données\n');

    const tenantId = process.argv[2] || 'eaceef7f-dd73-46bd-9d77-231896181cca';
    
    const tenantResult = await client.query(
      'SELECT schema_name, nom FROM public.tenant WHERE id = $1',
      [tenantId]
    );

    const { schema_name: schemaName, nom: tenantName } = tenantResult.rows[0];
    console.log(`📋 Tenant: ${tenantName}`);
    console.log(`📋 Schéma: ${schemaName}\n`);

    // 1. Lister tous les utilisateurs étudiants
    console.log('👥 Utilisateurs avec rôle "etudiant":');
    const utilisateurs = await client.query(`
      SELECT id, email, role, actif
      FROM "${schemaName}".utilisateur
      WHERE role = 'etudiant'
      ORDER BY email
    `);

    if (utilisateurs.rows.length === 0) {
      console.log('   ❌ Aucun utilisateur étudiant trouvé!\n');
      return;
    }

    console.log(`   ✅ ${utilisateurs.rows.length} utilisateur(s) étudiant(s) trouvé(s):\n`);
    
    for (const user of utilisateurs.rows) {
      console.log(`   📧 ${user.email} (ID: ${user.id})`);
      console.log(`      Actif: ${user.actif}`);
      
      // Vérifier si cet utilisateur a un profil étudiant
      const etudiant = await client.query(`
        SELECT id, nom, prenom, matricule, utilisateur_id
        FROM "${schemaName}".etudiant
        WHERE utilisateur_id = $1
      `, [user.id]);

      if (etudiant.rows.length === 0) {
        console.log(`      ❌ PAS DE PROFIL ÉTUDIANT dans la table etudiant!`);
        console.log(`      💡 Solution: Créer un profil étudiant pour cet utilisateur\n`);
      } else {
        const etud = etudiant.rows[0];
        console.log(`      ✅ Profil étudiant trouvé:`);
        console.log(`         - Nom: ${etud.prenom} ${etud.nom}`);
        console.log(`         - Matricule: ${etud.matricule}`);
        console.log(`         - ID étudiant: ${etud.id}\n`);
      }
    }

    // 2. Vérifier la structure de la table etudiant
    console.log('📋 Structure de la table etudiant:');
    const columns = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = $1 AND table_name = 'etudiant'
      ORDER BY ordinal_position
    `, [schemaName]);

    const hasUtilisateurId = columns.rows.some(col => col.column_name === 'utilisateur_id');
    
    if (!hasUtilisateurId) {
      console.log('   ❌ La colonne "utilisateur_id" n\'existe PAS dans la table etudiant!');
      console.log('   💡 Cette colonne est nécessaire pour lier l\'utilisateur au profil étudiant\n');
    } else {
      console.log('   ✅ La colonne "utilisateur_id" existe\n');
    }

    // Afficher quelques colonnes importantes
    const importantCols = ['id', 'utilisateur_id', 'nom', 'prenom', 'matricule', 'email'];
    importantCols.forEach(colName => {
      const col = columns.rows.find(c => c.column_name === colName);
      if (col) {
        console.log(`   ✅ ${col.column_name}: ${col.data_type}`);
      } else {
        console.log(`   ❌ ${colName}: MANQUANT`);
      }
    });

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.error(error);
  } finally {
    await client.end();
  }
}

checkEtudiantProfile();

// Made with Bob
