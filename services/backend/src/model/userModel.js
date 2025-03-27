const pool = require('../config/db');

// fonction qui créer un utilisateur dans la base de donnée
async function createUser(email, nom, prenom, hashedPassword) {
  const query = 'INSERT INTO users (email, nom, prenom, password) VALUES ($1, $2, $3, $4) RETURNING *';
  const values = [email, nom, prenom, hashedPassword];
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


module.exports = { createUser, findUser, updateUserPassword, findUserById };