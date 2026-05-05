const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

async function fixSuperAdmin() {
  try {
    console.log('Checking for super admin account...');
    
    const result = await pool.query(
      'SELECT * FROM public.super_admin WHERE email = $1',
      ['superadmin@imtech-university.mg']
    );
    
    if (result.rows.length === 0) {
      console.log('No super admin found. Creating one...');
      const hash = await bcrypt.hash('SuperAdmin@1234', 12);
      await pool.query(
        'INSERT INTO public.super_admin (email, password_hash, nom, prenom, actif) VALUES ($1, $2, $3, $4, $5)',
        ['superadmin@imtech-university.mg', hash, 'Admin', 'Super', true]
      );
      console.log('✓ Super admin created successfully!');
    } else {
      console.log('Super admin found:', {
        id: result.rows[0].id,
        email: result.rows[0].email,
        actif: result.rows[0].actif
      });
      
      const isValid = await bcrypt.compare('SuperAdmin@1234', result.rows[0].password_hash);
      console.log('Password validation:', isValid ? '✓ VALID' : '✗ INVALID');
      
      if (!isValid) {
        console.log('Updating password...');
        const hash = await bcrypt.hash('SuperAdmin@1234', 12);
        await pool.query(
          'UPDATE public.super_admin SET password_hash = $1 WHERE email = $2',
          [hash, 'superadmin@imtech-university.mg']
        );
        console.log('✓ Password updated successfully!');
      }
    }
    
    console.log('\n✓ Login should now work with:');
    console.log('  Email: superadmin@imtech-university.mg');
    console.log('  Password: SuperAdmin@1234');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

fixSuperAdmin();

// Made with Bob
