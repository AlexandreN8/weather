const express = require("express");
const redis = require("redis");
require("dotenv").config();

const app = express();
app.use(express.json());

// Connexion Redis
const redisClient = redis.createClient({
  socket: {
    host: "ter_redis",
    port: 6379,
  },
  password: process.env.REDIS_PASSWORD,
});

redisClient.connect()
  .then(() => console.log("Connecté à Redis"))
  .catch((err) => console.error("Redis erreur de co :", err));


// Endpoint pour test la connexion dans redis
app.get("/redis-keys", async (req, res) => {
  try {
    // Récupérer toutes les clés
    const keys = await redisClient.keys("*");
    res.status(200).send({ message: "Clés trouvées :", keys });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// Lancer le serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
