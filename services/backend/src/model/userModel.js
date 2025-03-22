const pool = require('../config/db');

// fonction qui créer un utilisateur dans la base de donnée
async function createUser(email, nom, prenom, hashedPassword) {
  const query = 'INSERT INTO users (email, nom, prenom, password) VALUES ($1, $2, $3, $4) RETURNING *';
  const values = [email, nom, prenom, hashedPassword];
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
/*
async function findUserByUsername(username) {
  const query = 'SELECT * FROM users WHERE username = $1';
  const result = await pool.query(query, [username]);
  return result.rows[0];
}
*/
module.exports = { createUser, findUser };