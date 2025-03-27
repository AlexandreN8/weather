const pool = require('../config/db');

// fonction qui créer un utilisateur dans la base de donnée
async function createUser(email, nom, prenom, hashedPassword, role) {
  const query = 'INSERT INTO users (email, nom, prenom, password, role) VALUES ($1, $2, $3, $4, $5) RETURNING *';
  const values = [email, nom, prenom, hashedPassword, role];
  const result = await pool.query(query, values);
  return result.rows[0];
}

// Recherche d'un utilisateur par email
async function findUser(email) {
  const query = 'SELECT * FROM users WHERE email = $1';
  const result = await pool.query(query, [email]);
  return result.rows[0];
}

// fonction qui permet de rechercher un utilisateur dans la base de donnée
// par nom, prénom ou email
async function searchUsers(queryStr) {
  const searchQuery = `%${queryStr.toLowerCase()}%`;
  const sql = `
    SELECT id, nom, prenom, status, created_at, role
    FROM users
    WHERE LOWER(nom) LIKE $1 OR LOWER(prenom) LIKE $1 OR LOWER(email) LIKE $1
    ORDER BY id ASC
  `;
  const result = await pool.query(sql, [searchQuery]);
  return result.rows;
}

module.exports = { createUser, findUser, searchUsers };