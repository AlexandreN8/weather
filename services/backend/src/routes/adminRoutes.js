const express = require('express');
const { isAdmin } = require('../middleware/authMiddleware');
const router = express.Router();

// Route d'accueil de l'espace admin
router.get('/', isAdmin, (req, res) => {
  res.json({ message: 'Bienvenue dans l\'espace administrateur.' });
});



module.exports = router;
