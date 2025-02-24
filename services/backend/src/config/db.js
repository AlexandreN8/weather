require('dotenv').config();
const { Pool } = require('pg');



const pool = new Pool({
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  port: process.env.POSTGRES_PORT,
});

// Requête qui effectue la connexion à la base de donnée PostgresSQL
async function testConnection() {
    try {
      const res = await pool.query('SELECT NOW()');
      console.log('Connexion réussie à PostgreSQL:', res.rows[0]);
    } catch (err) {
      console.error('Erreur de connexion à PostgreSQL:', err);
    }
  }
  
testConnection();

module.exports = pool;