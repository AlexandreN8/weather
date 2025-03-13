const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { createUser, findUser, findUserByUsername } = require('../model/userModel');

// fonction qui permet d'enregistrer un nouvel utilisateur
async function register(req, res) {
  const { email, username, password } = req.body;
  
  // Vérifier que les champs requis sont fournis
  if (!email || !username || !password) {
    return res.status(400).json({ error: "Email, username et password sont requis." });
  }
  
  try {
    // Vérifier si un utilisateur existe déjà (par email ou username)
    const existingUser = await findUser(email, username);
    if (existingUser) {
      return res.status(400).json({ error: "Un utilisateur avec cet email ou username existe déjà." });
    }
    
    // Hacher le mot de passe
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Créer l'utilisateur dans la base de données
    const newUser = await createUser(email, username, hashedPassword);
    
    // On ne retourne pas le mot de passe
    delete newUser.password;
    return res.status(201).json({ message: "Utilisateur créé avec succès.", user: newUser });
  } catch (err) {
    console.error("Erreur lors de l'inscription :", err);
    return res.status(500).json({ error: "Erreur interne du serveur." });
  }
}

// fonction qui permet de vérifier la connexion d'un utilisateur
async function login(req, res) {
  const { username, password } = req.body;
  
  // Vérifier que les champs sont fournis
  if (!username || !password) {
    return res.status(400).json({ error: "Le nom d'utilisateur et le mot de passe sont requis." });
  }
  
  try {
    // Recherche l'utilisateur par son nom d'utilisateur
    const user = await findUserByUsername(username);
    
    // Si l'utilisateur n'existe pas
    if (!user) {
      return res.status(401).json({ error: "Identifiants invalides." });
    }
    
    // Vérification du mot de passe
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Identifiants invalides." });
    }
    
    // Générer un token JWT (assurez-vous d'avoir défini JWT_SECRET dans vos variables d'environnement)
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    // Supprimer le mot de passe de l'objet user avant de l'envoyer dans la réponse
    delete user.password;
    
    return res.status(200).json({ message: "Connexion réussie.", user, token });
  } catch (err) {
    console.error("Erreur lors de la connexion :", err);
    return res.status(500).json({ error: "Erreur interne du serveur." });
  }
}
module.exports = { register, login };
