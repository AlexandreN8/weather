require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http'); // Pour créer un serveur HTTP
const socketIo = require('socket.io'); // Pour les websockets
const userRoutes = require('./routes/userRoutes');
const redisRoutes = require('./routes/redisRoutes');
const adminRoutes = require('./routes/adminRoutes');
const accueilRoutes = require('./routes/accueilRoutes');
const redisSubscriber = require('./config/redisPubSub');
const redisClient = require('./config/redis');

// Importer la connexion à MongoDB
require('./config/mongo');

// Importer la route de test MongoDB
const testMongoRoute = require('./routes/testMongo');



// Création de l'application Express
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware pour gérer CORS : ici, on autorise toutes les origines
app.use(cors());
// Middleware pour parser le JSON
app.use(express.json());

// Monter le routeur Redis sous /api/redis par exemple
app.use('/api/redis', redisRoutes);
// Intégration du routeur pour la gestion des utilisateurs
app.use('/api/users', userRoutes);
// Intégration du routeur pour l'administration
app.use('/api/admin', adminRoutes);
// Intégration du routeur pour la page d'accueil
app.use('/api/accueil', accueilRoutes);

app.use('/api/test-mongo', testMongoRoute);

// Création d'un serveur HTTP
const server = http.createServer(app);

// Attacher Socket.IO au serveur HTTP
const io = socketIo(server, {
  cors: {
    origin: "*", // Ajuste cela selon les besoins de sécurité (ex: origine du front-end)
    methods: ["GET", "POST"]
  }
});

// Gérer les connexions Socket.IO
io.on('connection', async (socket) => {
  console.log('Un client est connecté, id:', socket.id);
  
  // Récupérer les données initiales de Redis
  try {
    const keys = await redisClient.keys('*');
    console.log(`Clés trouvées dans Redis au moment de la connexion: ${keys}`);
    const stations = {};
    const alerts = {};
    for (const key of keys) {
      const type = await redisClient.type(key);
      let value;
      switch (type) {
        case 'string':
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
      // Séparer les alertes des stations en fonction du préfixe de la clé
      if (key.startsWith('alert:')) {
        alerts[key] = value;
      } else {
        stations[key] = value;
      }
    }
    console.log("Données initiales envoyées:", { stations, alerts });
    // Envoyer un objet contenant à la fois les stations et les alertes
    socket.emit('data_update', { stations, alerts });
  } catch (err) {
    console.error("Erreur lors de la récupération des données initiales:", err);
  }
  // Envoyer un message de bienvenue après 3 secondes
  /*
  setTimeout(() => {
    socket.emit('data_update', { message: 'Bienvenue sur le serveur en temps réel !' });
  }, 3000);
  */
  // Tu peux définir ici des écouteurs d'événements spécifiques
  socket.on('disconnect', () => {
    console.log('Client déconnecté:', socket.id);
  });
});



// Abonnement au canal Redis "data_updates"
redisSubscriber.subscribe('data_updates', async (message) => {
  console.log('Message reçu depuis Redis sur "data_updates":', message);
  try {
    // On parse la chaîne JSON reçue, qui doit être déjà structurée
    const formattedData = JSON.parse(message);
    // Émettre directement l'objet formaté vers le front-end
    io.emit('data_update', formattedData);
  } catch (e) {
    console.error("Erreur lors du parsing du message:", e);
    // En cas d'erreur, on émet le message brut
    io.emit('data_update', message);
  }
});


server.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});




