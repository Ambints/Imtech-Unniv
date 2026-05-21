require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'Imtech_SaaS',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '2007',
});

async function diagnoseNiveauxAuth() {
  const client = await pool.connect();
  
  try {
    console.log('\n🔍 DIAGNOSTIC: Authentification et Permissions pour Niveaux d\'Études\n');
    console.log('='.repeat(80));

    // 1. Vérifier les utilisateurs admin du tenant
    console.log('\n📋 1. Utilisateurs Admin du Tenant:');
    const tenantId = 'eaceef7f-dd73-46bd-9d77-231896181cca';
    
    const admins = await client.query(`
      SELECT 
        u.id,
        u.email,
        u.nom,
        u.prenom,
        u.role,
        u.actif,
        u.tenant_id,
        t.nom as tenant_nom
      FROM public.utilisateur u
      LEFT JOIN public.tenant t ON u.tenant_id = t.id
      WHERE u.tenant_id = $1 AND u.role IN ('admin', 'president')
      ORDER BY u.role, u.email
    `, [tenantId]);

    if (admins.rows.length === 0) {
      console.log('❌ Aucun admin trouvé pour ce tenant!');
    } else {
      console.log(`✅ ${admins.rows.length} admin(s) trouvé(s):`);
      admins.rows.forEach(admin => {
        console.log(`   - ${admin.email} (${admin.role}) - ${admin.actif ? '✅ Actif' : '❌ Inactif'}`);
        console.log(`     ID: ${admin.id}`);
        console.log(`     Nom: ${admin.prenom} ${admin.nom}`);
        console.log(`     Tenant: ${admin.tenant_nom} (${admin.tenant_id})`);
      });
    }

    // 2. Vérifier le schéma du tenant
    console.log('\n📋 2. Schéma du Tenant:');
    const tenant = await client.query(`
      SELECT id, nom, slug, schema_name, actif
      FROM public.tenant
      WHERE id = $1
    `, [tenantId]);

    if (tenant.rows.length === 0) {
      console.log('❌ Tenant non trouvé!');
    } else {
      const t = tenant.rows[0];
      console.log(`✅ Tenant trouvé:`);
      console.log(`   Nom: ${t.nom}`);
      console.log(`   Slug: ${t.slug}`);
      console.log(`   Schema: ${t.schema_name}`);
      console.log(`   Actif: ${t.actif ? '✅ Oui' : '❌ Non'}`);

      // 3. Vérifier si la table niveau_etude existe dans le schéma
      console.log('\n📋 3. Table niveau_etude dans le schéma:');
      const tableExists = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = $1 
          AND table_name = 'niveau_etude'
        )
      `, [t.schema_name]);

      if (tableExists.rows[0].exists) {
        console.log(`✅ Table niveau_etude existe dans ${t.schema_name}`);
        
        // Compter les niveaux
        const count = await client.query(`
          SELECT COUNT(*) as count FROM ${t.schema_name}.niveau_etude
        `);
        console.log(`   Nombre de niveaux: ${count.rows[0].count}`);

        // Lister les niveaux
        const niveaux = await client.query(`
          SELECT id, code, libelle, ordre, type_diplome, actif
          FROM ${t.schema_name}.niveau_etude
          ORDER BY ordre
        `);
        
        if (niveaux.rows.length > 0) {
          console.log('\n   Niveaux existants:');
          niveaux.rows.forEach(n => {
            console.log(`   - ${n.code}: ${n.libelle} (ordre: ${n.ordre}, ${n.actif ? '✅' : '❌'})`);
          });
        }
      } else {
        console.log(`❌ Table niveau_etude n'existe PAS dans ${t.schema_name}`);
      }
    }

    // 4. Vérifier les tokens JWT actifs (si table existe)
    console.log('\n📋 4. Tokens JWT (dernières connexions):');
    const tokensExist = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'refresh_token'
      )
    `);

    if (tokensExist.rows[0].exists) {
      const tokens = await client.query(`
        SELECT 
          rt.id,
          rt.user_id,
          u.email,
          u.role,
          rt.expires_at,
          rt.created_at,
          CASE 
            WHEN rt.expires_at > NOW() THEN 'Valide'
            ELSE 'Expiré'
          END as statut
        FROM public.refresh_token rt
        JOIN public.utilisateur u ON rt.user_id = u.id
        WHERE u.tenant_id = $1
        ORDER BY rt.created_at DESC
        LIMIT 5
      `, [tenantId]);

      if (tokens.rows.length > 0) {
        console.log(`✅ ${tokens.rows.length} token(s) trouvé(s):`);
        tokens.rows.forEach(t => {
          console.log(`   - ${t.email} (${t.role})`);
          console.log(`     Statut: ${t.statut}`);
          console.log(`     Expire: ${t.expires_at}`);
          console.log(`     Créé: ${t.created_at}`);
        });
      } else {
        console.log('⚠️ Aucun token trouvé (aucune connexion récente)');
      }
    } else {
      console.log('⚠️ Table refresh_token n\'existe pas');
    }

    // 5. Recommandations
    console.log('\n📋 5. Recommandations:');
    console.log('─'.repeat(80));
    
    if (admins.rows.length === 0) {
      console.log('❌ PROBLÈME: Aucun admin trouvé pour ce tenant');
      console.log('   Solution: Créer un utilisateur admin pour ce tenant');
    } else {
      const inactiveAdmins = admins.rows.filter(a => !a.actif);
      if (inactiveAdmins.length > 0) {
        console.log('⚠️ ATTENTION: Certains admins sont inactifs');
        console.log('   Solution: Activer les comptes admin');
      }
    }

    if (tenant.rows.length > 0 && !tenant.rows[0].actif) {
      console.log('❌ PROBLÈME: Le tenant est inactif');
      console.log('   Solution: Activer le tenant');
    }

    console.log('\n✅ Pour tester l\'authentification:');
    console.log('   1. Se connecter avec un compte admin du tenant');
    console.log('   2. Vérifier que le token JWT est valide (non expiré)');
    console.log('   3. Vérifier que le header Authorization contient: Bearer <token>');
    console.log('   4. Vérifier que le header X-Tenant-ID contient:', tenantId);
    
    console.log('\n✅ Endpoints à tester:');
    console.log(`   GET  /api/v1/admin/${tenantId}/niveaux-etude`);
    console.log(`   POST /api/v1/admin/${tenantId}/niveaux-etude`);
    
    console.log('\n✅ Rôles autorisés pour ces endpoints:');
    console.log('   - admin');
    console.log('   - president');

  } catch (error) {
    console.error('\n❌ Erreur:', error.message);
    console.error(error);
  } finally {
    client.release();
    await pool.end();
  }
}

diagnoseNiveauxAuth().catch(console.error);

// Made with Bob
