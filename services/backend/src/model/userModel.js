const pool = require('../config/db');

// fonction qui créer un utilisateur dans la base de donnée
async function createUser(email, username, hashedPassword) {
  const query = 'INSERT INTO users (email, username, password) VALUES ($1, $2, $3) RETURNING *';
  const values = [email, username, hashedPassword];
  const result = await pool.query(query, values);
  return result.rows[0];
}

// fonction qui Vérifie si un utilisateur existe déjà par son email ou son username.
 
async function findUser(email, username) {
  const query = 'SELECT * FROM users WHERE email = $1 OR username = $2';
  const result = await pool.query(query, [email, username]);
  return result.rows[0];
}

// fonction qui permet de rechercher un utilisateur dans la base de donnée
async function findUserByUsername(username) {
  const query = 'SELECT * FROM users WHERE username = $1';
  const result = await pool.query(query, [username]);
  return result.rows[0];
}

module.exports = { createUser, findUser, findUserByUsername };