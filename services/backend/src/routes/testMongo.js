// routes/testMongo.js
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

router.get('/', async (req, res) => {
    try {
      console.log('État de la connexion Mongo:', mongoose.connection.readyState);
      if (mongoose.connection.readyState !== 1) {
        return res.status(500).json({ error: "Connexion Mongo non établie" });
      }
      
      // Si aucun nom de collection n'est fourni, liste les collections existantes
    if (!req.query.collection) {
        const collections = await mongoose.connection.db.listCollections().toArray();
        return res.json({
          message: "Liste des collections disponibles",
          collections: collections.map(col => col.name)
        });
      }
      
      // Récupère le nom de la collection via une query (ex: /api/test-mongo?collection=maCollection)
      const collectionName = req.query.collection || 'maCollection';
      
      // Accéder à la collection spécifiée
      const collection = mongoose.connection.db.collection(collectionName);
      
      // Récupère tous les documents de la collection
      const documents = await collection.find({}).toArray();
      
      res.json({
        message: `Documents dans la collection ${collectionName}`,
        data: documents
      });
    } catch (error) {
      res.status(500).json({ error: "Erreur lors de la récupération des documents", details: error.message });
    }
  });

module.exports = router;
