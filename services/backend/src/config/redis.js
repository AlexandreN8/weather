const redis = require("redis");

// Connexion Redis
const client = redis.createClient({
  socket: {
    host: "ter_redis",
    port: 6379,
  },
  password: process.env.REDIS_PASSWORD,
});

// Se connecter à Redis
client.connect().catch((err) => {
  console.error('Erreur de connexion à Redis:', err);
});

client.on('error', (err) => {
  console.error('Erreur Redis:', err);
});

module.exports = client;

