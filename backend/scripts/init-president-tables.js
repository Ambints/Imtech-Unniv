const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'imtech_university',
});

async function initPresidentTables() {
  try {
    await client.connect();
    console.log('✅ Connecté à la base de données');

    // Récupérer tous les tenants
    const tenantsResult = await client.query(`
      SELECT id, nom, schema FROM public.tenant WHERE schema IS NOT NULL
    `);

    console.log(`\n📋 ${tenantsResult.rows.length} tenant(s) trouvé(s)\n`);

    for (const tenant of tenantsResult.rows) {
      console.log(`\n🔧 Traitement du tenant: ${tenant.nom} (${tenant.schema})`);

      try {
        // Créer les tables du module président
        await client.query(`
          -- Table pour les actions d'audit du président
          CREATE TABLE IF NOT EXISTS ${tenant.schema}.president_audit (
            id SERIAL PRIMARY KEY,
            utilisateur_id INTEGER REFERENCES ${tenant.schema}.utilisateur(id),
            action VARCHAR(100) NOT NULL,
            entite VARCHAR(100) NOT NULL,
            entite_id INTEGER,
            details JSONB,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );

          -- Table pour les délégations de signature
          CREATE TABLE IF NOT EXISTS ${tenant.schema}.president_delegation (
            id SERIAL PRIMARY KEY,
            utilisateur_id INTEGER REFERENCES ${tenant.schema}.utilisateur(id),
            delegue_a_id INTEGER REFERENCES ${tenant.schema}.utilisateur(id),
            types_actes TEXT[] NOT NULL,
            date_debut DATE NOT NULL,
            date_fin DATE NOT NULL,
            statut VARCHAR(20) DEFAULT 'active' CHECK (statut IN ('active', 'revoquee', 'expiree')),
            motif_revocation TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );

          -- Index pour améliorer les performances
          CREATE INDEX IF NOT EXISTS idx_president_audit_utilisateur 
            ON ${tenant.schema}.president_audit(utilisateur_id);
          CREATE INDEX IF NOT EXISTS idx_president_audit_created 
            ON ${tenant.schema}.president_audit(created_at DESC);
          CREATE INDEX IF NOT EXISTS idx_president_delegation_statut 
            ON ${tenant.schema}.president_delegation(statut);
        `);

        console.log(`  ✅ Tables président créées avec succès`);

        // Vérifier si les tables de base existent
        const tablesCheck = await client.query(`
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = $1 
          AND table_name IN ('etudiant', 'paiement', 'contrat_personnel', 'incident', 'diplome')
        `, [tenant.schema]);

        const existingTables = tablesCheck.rows.map(r => r.table_name);
        console.log(`  📊 Tables existantes: ${existingTables.join(', ') || 'aucune'}`);

        if (existingTables.length === 0) {
          console.log(`  ⚠️  Attention: Aucune table de base trouvée. Le module président ne pourra pas fonctionner correctement.`);
        }

      } catch (error) {
        console.error(`  ❌ Erreur pour ${tenant.name}:`, error.message);
      }
    }

    console.log('\n✅ Initialisation terminée!');

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await client.end();
  }
}

initPresidentTables();

// Made with Bob
