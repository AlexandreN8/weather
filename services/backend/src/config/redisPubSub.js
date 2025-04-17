// redisPubSub.js
const redis = require('redis');

const subscriber = redis.createClient({
  socket: {
    host: process.env.REDIS_HOST || 'ter_redis',
    port: 6379
  },
  password: process.env.REDIS_PASSWORD
});

subscriber.connect().catch((err) => {
  console.error('Erreur de connexion au subscriber Redis:', err);
});

subscriber.on('error', (err) => {
  console.error('Erreur Redis subscriber:', err);
});

module.exports = subscriber;
