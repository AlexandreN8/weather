const pool = require('../config/db');

// fonction qui permet de récupérer le nombre total d'utilisateurs
async function getUserCount() {
  const query = 'SELECT COUNT(*) FROM users';
  const result = await pool.query(query);
  return parseInt(result.rows[0].count, 10);
}

// fonction qui permet de récupérer une liste de 5 utilisateurs
async function getUsersPaginated(offset = 0, limit = 5) {
  const query = `
    SELECT id, nom, prenom, status, created_at, role
    FROM users 
    ORDER BY id ASC 
    LIMIT $1 OFFSET $2
  `;
  const result = await pool.query(query, [limit, offset]);
  return result.rows;
}

// fonction qui permet de mettre à jour le rôle d'un utilisateur
async function updateUserRole(userId, newRole) {
  const query = `
    UPDATE users 
    SET role = $1
    WHERE id = $2 
    RETURNING id, email, nom, prenom, role, created_at
  `;
  const result = await pool.query(query, [newRole, userId]);
  return result.rows[0];
}

// fonction qui permet de récupérer les demandes de rôle en attente
async function getOpenRoleRequests() {
  const query = `
    SELECT id, id_user, lname, fname, desired_role, status, created_at, updated_at 
    FROM role_request 
    WHERE status = 'pending'
    ORDER BY created_at ASC
  `;
  const result = await pool.query(query);
  return result.rows;
}


// fonction qui permet de mettre à jour le statut d'une demande de rôle
async function updateRoleRequest(requestId, newStatus) {
  const query = `
    UPDATE role_request
    SET status = $1, updated_at = CURRENT_TIMESTAMP
    WHERE id = $2
    RETURNING id, id_user, lname, fname, desired_role, status, created_at, updated_at
  `;
  const result = await pool.query(query, [newStatus, requestId]);
  return result.rows[0]; 
}

// fonction qui permet de récupérer tous les utilisateurs
/*
async function getAllUsers() {
  const query = 'SELECT id, email, nom, prenom, role, created_at FROM users';
  const result = await pool.query(query);
  return result.rows;
}
*/


module.exports = {  getUsersPaginated, getUserCount, updateUserRole, getOpenRoleRequests, updateRoleRequest };