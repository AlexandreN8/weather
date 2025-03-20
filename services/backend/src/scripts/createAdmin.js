require('dotenv').config();
const pool = require('../config/db'); 
const bcrypt = require('bcrypt');

//SCRIPT POUR CREER UN COMPTE ADMIN

// Récupération des arguments : email, username et password
const [,, email, username, password] = process.argv;

if (!email || !username || !password) {
    console.error("Usage: node createAdmin.js <email> <username> <password>");
    process.exit(1);
}


(async () => {
    try {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        
        
        const query = 'INSERT INTO users (email, username, password, role) VALUES ($1, $2, $3, $4) RETURNING *';
        const values = [email, username, hashedPassword, 'admin'];
        
        const result = await pool.query(query, values);
        console.log("Admin créé avec succès :", result.rows[0]);
        process.exit(0);
    } catch (err) {
        console.error("Erreur lors de la création de l'admin :", err);
        process.exit(1);
    }
})();
