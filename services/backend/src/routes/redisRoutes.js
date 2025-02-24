// src/routes/redisRoutes.js
const express = require('express');
const router = express.Router();
const redisClient = require('../config/redis');

// route pour ajouter des données dans redis
router.post('/update', async (req, res) => {
  try {
    // Supposons que le corps de la requête contient les données de la station
    const newData = req.body;
    
    // Utilisez validity_time si fourni, sinon la date actuelle
    const timestamp = newData.validity_time || new Date().toISOString();
    
    // Créer un objet formaté avec le timestamp et les données
    const formattedData = {
      timestamp: timestamp,
      data: newData
    };

    // Stocker la donnée sous la clé 'latestData'
    await redisClient.set('latestData', JSON.stringify(formattedData));

    // Publier un message sur le canal 'data_updates'
    await redisClient.publish('data_updates', JSON.stringify(formattedData));

    res.status(200).json({ message: "Donnée mise à jour et publiée", data: formattedData });
  } catch (err) {
    console.error("Erreur lors de la mise à jour de Redis:", err);
    res.status(500).json({ error: "Erreur lors de la mise à jour de Redis" });
  }
});
  
  // Route déjà existante pour récupérer les données
router.get('/data', async (req, res) => {
    try {
      const keys = await redisClient.keys('*');
      const results = {};
  
      for (const key of keys) {
        const type = await redisClient.type(key);
        let value;
        switch (type) {
          case 'string':
            // Tente de parser la valeur JSON, sinon retourne la valeur brute
            try {
              value = JSON.parse(await redisClient.get(key));
            } catch (e) {
              value = await redisClient.get(key);
            }
            break;
          case 'list':
            value = await redisClient.lRange(key, 0, -1);
            break;
          case 'hash':
            value = await redisClient.hGetAll(key);
            break;
          case 'set':
            value = await redisClient.sMembers(key);
            break;
          case 'zset':
            value = await redisClient.zRangeWithScores(key, 0, -1);
            break;
          default:
            value = `Type ${type} non géré`;
        }
        results[key] = value;
      }
      
      res.json(results);
    } catch (err) {
      console.error('Erreur lors de la récupération des données Redis:', err);
      res.status(500).json({ error: 'Erreur lors de la récupération des données depuis Redis', details: err.message });
    }
  });
  

module.exports = router;
