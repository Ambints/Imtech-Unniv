const { Client } = require('pg');

async function checkPaiementInscriptionData() {
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

    const tenantId = 'eaceef7f-dd73-46bd-9d77-231896181cca';
    
    // Récupérer le schéma du tenant
    const tenantResult = await client.query(
      'SELECT schema_name, nom FROM public.tenant WHERE id = $1',
      [tenantId]
    );

    if (tenantResult.rows.length === 0) {
      console.log('❌ Tenant non trouvé!');
      return;
    }

    const { schema_name: schemaName, nom: tenantName } = tenantResult.rows[0];
    console.log(`📋 Tenant: ${tenantName}`);
    console.log(`📋 Schéma: ${schemaName}\n`);

    // Définir le search_path
    await client.query(`SET search_path TO "${schemaName}", public`);

    // Vérifier si la table existe
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = $1 
        AND table_name = 'paiement_inscription'
      )
    `, [schemaName]);

    console.log('📋 Table paiement_inscription existe:', tableCheck.rows[0].exists);

    if (tableCheck.rows[0].exists) {
      // Compter les paiements
      const countResult = await client.query(`
        SELECT 
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE statut = 'en_attente') as en_attente,
          COUNT(*) FILTER (WHERE statut = 'valide') as valides,
          COUNT(*) FILTER (WHERE statut = 'rejete') as rejetes
        FROM "${schemaName}".paiement_inscription
      `);

      console.log('\n📊 Statistiques des paiements:');
      console.log('   Total:', countResult.rows[0].total);
      console.log('   En attente:', countResult.rows[0].en_attente);
      console.log('   Validés:', countResult.rows[0].valides);
      console.log('   Rejetés:', countResult.rows[0].rejetes);

      // Afficher quelques paiements
      const paiements = await client.query(`
        SELECT 
          pi.id,
          pi.montant,
          pi.statut,
          pi.methode_paiement,
          e.nom,
          e.prenom,
          e.matricule
        FROM "${schemaName}".paiement_inscription pi
        JOIN "${schemaName}".etudiant e ON e.id = pi.etudiant_id
        ORDER BY pi.created_at DESC
        LIMIT 5
      `);

      if (paiements.rows.length > 0) {
        console.log('\n📋 Derniers paiements:');
        paiements.rows.forEach(p => {
          console.log(`   - ${p.nom} ${p.prenom} (${p.matricule}): ${p.montant} Ar - ${p.statut}`);
        });
      } else {
        console.log('\n⚠️  Aucun paiement trouvé dans la table');
      }
    }

    console.log('\n✅ Vérification terminée!');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.error(error);
  } finally {
    await client.end();
  }
}

checkPaiementInscriptionData();

// Made with Bob
