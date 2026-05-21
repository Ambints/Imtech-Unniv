const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function applyPaiementInscriptionTable() {
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

    // Lire le fichier SQL
    const sqlFile = path.join(__dirname, 'create-paiement-inscription-table.sql');
    let sql = fs.readFileSync(sqlFile, 'utf8');

    // Remplacer les noms de tables pour utiliser le schéma du tenant
    sql = sql.replace(/CREATE TABLE IF NOT EXISTS /g, `CREATE TABLE IF NOT EXISTS "${schemaName}".`);
    sql = sql.replace(/CREATE INDEX IF NOT EXISTS /g, `CREATE INDEX IF NOT EXISTS `);
    sql = sql.replace(/ON paiement_inscription/g, `ON "${schemaName}".paiement_inscription`);
    sql = sql.replace(/REFERENCES inscription/g, `REFERENCES "${schemaName}".inscription`);
    sql = sql.replace(/REFERENCES etudiant/g, `REFERENCES "${schemaName}".etudiant`);
    sql = sql.replace(/REFERENCES utilisateur/g, `REFERENCES "${schemaName}".utilisateur`);

    // Définir le search_path
    await client.query(`SET search_path TO "${schemaName}", public`);

    console.log('🔨 Application de la migration...\n');

    // Exécuter le SQL
    await client.query(sql);

    console.log('✅ Table paiement_inscription créée avec succès!\n');

    // Vérifier la création
    const checkTable = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = $1 AND table_name = 'paiement_inscription'
      ORDER BY ordinal_position
    `, [schemaName]);

    console.log('📋 Structure de la table paiement_inscription:');
    checkTable.rows.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`);
    });

    console.log('\n✅ Migration terminée avec succès!');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.error(error);
  } finally {
    await client.end();
  }
}

applyPaiementInscriptionTable();

// Made with Bob
