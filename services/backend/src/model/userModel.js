const pool = require('../config/db');

// fonction qui créer un utilisateur dans la base de donnée
async function createUser(email, nom, prenom, hashedPassword, role) {
  const query = 'INSERT INTO users (email, nom, prenom, password, role) VALUES ($1, $2, $3, $4, $5) RETURNING *';
  const values = [email, nom, prenom, hashedPassword, role];
  const result = await pool.query(query, values);
  return result.rows[0];
}

// fonction qui recherche un utilisateur dans la base de donnée
async function findUser(email) {
  const query = 'SELECT * FROM users WHERE email = $1';
  const result = await pool.query(query, [email]);
  return result.rows[0];
}

// fonction qui recherche un utilisateur par son id
async function findUserById(id) {
  const query = 'SELECT * FROM users WHERE id = $1';
  const result = await pool.query(query, [id]);
  return result.rows[0];
}

// fonction qui met à jour le mot de passe d'un utilisateur
async function updateUserPassword(userId, hashedPassword) {
  const query = 'UPDATE users SET password = $1 WHERE id = $2 RETURNING *';
  const result = await pool.query(query, [hashedPassword, userId]);
  return result.rows[0];
}

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


module.exports = { createUser, findUser, updateUserPassword, findUserById, searchUsers };