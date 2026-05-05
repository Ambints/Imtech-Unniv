const { DataSource } = require('typeorm');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function fixExpirationDate() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    console.log('Connexion à la base de données PostgreSQL...');
    await dataSource.initialize();
    console.log('✓ Connecté\n');

    // Mettre à jour la date d'expiration pour ISPM (1 an à partir d'aujourd'hui)
    const result = await dataSource.query(
      "UPDATE public.tenant SET date_fin_abonnement = NOW() + INTERVAL '1 year' WHERE slug = 'ispm'"
    );

    console.log('✓ Date d\'expiration mise à jour pour ISPM');
    console.log(`  Lignes affectées: ${result[1]}`);

    // Vérifier la nouvelle date
    const rows = await dataSource.query(
      "SELECT nom, slug, date_fin_abonnement FROM public.tenant WHERE slug = 'ispm'"
    );

    if (rows.length > 0) {
      console.log('\nNouvelle date d\'expiration:');
      console.log(`  Université: ${rows[0].nom}`);
      console.log(`  Date d'expiration: ${rows[0].date_fin_abonnement}`);
    } else {
      console.log('\nAucune université trouvée avec le slug "ispm"');
      
      // Lister toutes les universités
      const allTenants = await dataSource.query(
        "SELECT nom, slug FROM public.tenant"
      );
      console.log('\nUniversités disponibles:');
      allTenants.forEach(t => console.log(`  - ${t.nom} (${t.slug})`));
    }

    await dataSource.destroy();
    console.log('\n✓ Terminé avec succès!');
  } catch (error) {
    console.error('Erreur:', error.message);
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
    process.exit(1);
  }
}

fixExpirationDate();

// Made with Bob
