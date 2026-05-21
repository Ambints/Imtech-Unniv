/**
 * Script pour appliquer la migration secretaire_parcours à un tenant spécifique
 * Exécuter avec: node apply-secretaire-migration-to-tenant.js <tenant_schema>
 * Exemple: node apply-secretaire-migration-to-tenant.js tenant_ispm
 */

require('dotenv').config();
const { DataSource } = require('typeorm');

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'imtech',
  schema: 'public',
  synchronize: false,
});

async function applyMigration() {
  const schemaName = process.argv[2] || 'tenant_ispm';
  
  try {
    await dataSource.initialize();
    console.log(`✅ Connecté à la base de données\n`);
    console.log(`🔧 Application de la migration au schéma: "${schemaName}"\n`);
    
    // 1. Créer la table secretaire_parcours
    console.log('1️⃣ Création de la table secretaire_parcours...');
    await dataSource.query(`
      CREATE TABLE IF NOT EXISTS "${schemaName}".secretaire_parcours (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        secretaire_id UUID NOT NULL,
        parcours_id UUID NOT NULL,
        assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        assigned_by UUID,
        actif BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    console.log('   ✅ Table créée');
    
    // 2. Créer les index
    console.log('2️⃣ Création des index...');
    await dataSource.query(`
      CREATE INDEX IF NOT EXISTS idx_secretaire_parcours_secretaire 
      ON "${schemaName}".secretaire_parcours(secretaire_id) WHERE actif = TRUE
    `);
    await dataSource.query(`
      CREATE INDEX IF NOT EXISTS idx_secretaire_parcours_parcours 
      ON "${schemaName}".secretaire_parcours(parcours_id) WHERE actif = TRUE
    `);
    await dataSource.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_secretaire_parcours_unique 
      ON "${schemaName}".secretaire_parcours(secretaire_id, parcours_id) WHERE actif = TRUE
    `);
    console.log('   ✅ Index créés');
    
    // 3. Ajouter la contrainte de clé étrangère
    console.log('3️⃣ Ajout des contraintes...');
    try {
      await dataSource.query(`
        ALTER TABLE "${schemaName}".secretaire_parcours 
        ADD CONSTRAINT fk_secretaire_parcours_parcours 
        FOREIGN KEY (parcours_id) REFERENCES "${schemaName}".parcours(id) ON DELETE CASCADE
      `);
      console.log('   ✅ Contrainte FK ajoutée');
    } catch (err) {
      if (err.message.includes('already exists')) {
        console.log('   ⚠️ Contrainte FK déjà existante');
      } else {
        console.log('   ⚠️ Erreur FK (non bloquante):', err.message);
      }
    }
    
    // 4. Ajouter la colonne created_by_id à emploi_du_temps
    console.log('4️⃣ Ajout de la colonne created_by_id dans emploi_du_temps...');
    await dataSource.query(`
      ALTER TABLE "${schemaName}".emploi_du_temps 
      ADD COLUMN IF NOT EXISTS created_by_id UUID
    `);
    console.log('   ✅ Colonne ajoutée');
    
    // 5. Vérification
    console.log('\n5️⃣ Vérification...');
    const tables = await dataSource.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = '${schemaName}' 
      AND table_name = 'secretaire_parcours'
    `);
    
    if (tables.length > 0) {
      console.log('   ✅ Table secretaire_parcours existe');
      
      const columns = await dataSource.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_schema = '${schemaName}' 
        AND table_name = 'secretaire_parcours'
        ORDER BY ordinal_position
      `);
      
      console.log('   📋 Structure de la table:');
      columns.forEach(col => {
        console.log(`      - ${col.column_name}: ${col.data_type}`);
      });
    } else {
      console.log('   ❌ Table non trouvée');
    }
    
    // Vérifier emploi_du_temps
    const edtCols = await dataSource.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_schema = '${schemaName}' 
      AND table_name = 'emploi_du_temps'
      AND column_name = 'created_by_id'
    `);
    
    if (edtCols.length > 0) {
      console.log('   ✅ Colonne created_by_id existe dans emploi_du_temps');
    } else {
      console.log('   ❌ Colonne created_by_id non trouvée');
    }
    
    await dataSource.destroy();
    console.log(`\n✅ Migration terminée avec succès pour "${schemaName}"`);
    console.log('\n📝 Prochaine étape: Redémarrez le backend pour que TypeORM reconnaisse la nouvelle table');
    
  } catch (error) {
    console.error('\n❌ Erreur:', error.message);
    await dataSource.destroy();
    process.exit(1);
  }
}

applyMigration();
