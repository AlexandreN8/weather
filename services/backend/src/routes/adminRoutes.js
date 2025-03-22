const express = require('express');
const { isAdmin } = require('../middleware/authMiddleware');
const { getUsersPaginated, getUserCount, updateUserRole, getOpenRoleRequests, updateRoleRequest  } = require('../model/adminModel');
const pool = require('../config/db');


const router = express.Router();

// Route d'accueil de l'espace admin
router.get('/', isAdmin, (req, res) => {
  res.json({ message: 'Bienvenue dans l\'espace administrateur.' });
});

// route pour recuperer le nombre total d'utilisateurs
router.get('/users/count', isAdmin, async (req, res) => {
  try {
    const totalUsers = await getUserCount();
    res.json({ totalUsers });
  } catch (err) {
    console.error('Erreur lors de la récupération du nombre d\'utilisateurs:', err);
    res.status(500).json({ error: "Erreur interne du serveur." });
  }
});

// route pour recuperer la liste d'utlisateurs entre deux bornes
router.get('/users', isAdmin, async (req, res) => {
  try {
    const start = parseInt(req.query.start) || 1; 
    const end = parseInt(req.query.end);
    
    if (!end || end < start) {
      return res.status(400).json({ error: "La borne 'end' doit être spécifiée et supérieure ou égale à 'start'." });
    }
    
    const offset = start - 1; 
    const limit = end - start + 1; 

    const users = await getUsersPaginated(offset, limit);
    res.json({ users });
  } catch (err) {
    console.error('Erreur lors de la récupération des utilisateurs par bornes :', err);
    res.status(500).json({ error: "Erreur interne du serveur." });
  }
});

// route pour mettre à jour le role d'un utilisateur
router.put('/users/:id/role', isAdmin, async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!role) {
    return res.status(400).json({ error: "Le nouveau rôle est requis." });
  }

  try {
    const updatedUser = await updateUserRole(id, role);
    if (!updatedUser) {
      return res.status(404).json({ error: "Utilisateur non trouvé." });
    }
    res.json({ message: "Rôle mis à jour avec succès.", user: updatedUser });
  } catch (err) {
    console.error('Erreur lors de la mise à jour du rôle:', err);
    res.status(500).json({ error: "Erreur interne du serveur." });
  }
}
);

// route pour recuperer les demandes de role en attente
router.get('/role-requests/open', isAdmin, async (req, res) => {
  try{
    const requests = await getOpenRoleRequests();
    res.json({ requests });
  } catch (err) {
    console.error('Erreur lors de la récupération des demandes de rôle:', err);
    res.status(500).json({ error: "Erreur interne du serveur." });
  }
}
);

// route pour mettre à jour le statut d'une demande de role
router.put('/role-requests/:id', isAdmin, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  // Validation : le statut doit être 'accepted' ou 'refused'
  const allowedStatuses = ['accepted', 'refused'];
  if (!status || !allowedStatuses.includes(status)) {
    return res.status(400).json({ error: "Statut non valide. Les valeurs autorisées sont : accepted, refused." });
  }

  try {
    const updatedRequest = await updateRoleRequest(id, status);
    if (!updatedRequest) {
      return res.status(404).json({ error: "Demande non trouvée." });
    }
    res.json({ message: "Demande mise à jour avec succès.", request: updatedRequest });
  } catch (err) {
    console.error("Erreur lors de la mise à jour de la demande :", err);
    res.status(500).json({ error: "Erreur interne du serveur." });
  }
});

module.exports = router;
