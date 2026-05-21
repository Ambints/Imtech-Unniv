const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'Imtech_SaaS',
  user: 'postgres',
  password: '2007'
});

async function checkDepenseBudgetLink() {
  try {
    await client.connect();
    console.log('Connected to database');

    // Set schema
    await client.query('SET search_path TO tenant_test');
    
    // Check depenses with their budget links
    const depensesResult = await client.query(`
      SELECT 
        d.id, 
        d.libelle, 
        d.categorie as depense_categorie, 
        d.montant, 
        d.statut, 
        d.budget_id,
        b.categorie as budget_categorie,
        b.montant_prevu,
        b.montant_realise
      FROM depense d 
      LEFT JOIN budget b ON d.budget_id = b.id 
      ORDER BY d.created_at DESC 
      LIMIT 10
    `);
    
    console.log('\n=== DÉPENSES ET LEURS BUDGETS ===');
    console.log(JSON.stringify(depensesResult.rows, null, 2));
    
    // Check budget stats
    const budgetStatsResult = await client.query(`
      SELECT
        categorie,
        montant_prevu,
        montant_realise,
        (montant_prevu - montant_realise) as solde
      FROM budget
      ORDER BY categorie
    `);
    
    console.log('\n=== STATISTIQUES BUDGETS ===');
    console.log(JSON.stringify(budgetStatsResult.rows, null, 2));
    
    // Check total depenses payees
    const totalDepensesResult = await client.query(`
      SELECT 
        COUNT(*) as nombre,
        SUM(montant) as total
      FROM depense 
      WHERE statut = 'paye'
    `);
    
    console.log('\n=== TOTAL DÉPENSES PAYÉES ===');
    console.log(JSON.stringify(totalDepensesResult.rows, null, 2));

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

checkDepenseBudgetLink();

// Made with Bob
