require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http'); // Pour créer un serveur HTTP
const socketIo = require('socket.io'); // Pour les websockets
const userRoutes = require('./routes/userRoutes');
const redisRoutes = require('./routes/redisRoutes');
const adminRoutes = require('./routes/adminRoutes');
const accueilRoutes = require('./routes/accueilRoutes');

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
io.on('connection', (socket) => {
  console.log('Un client est connecté, id:', socket.id);
  
  // Envoyer un message de bienvenue après 3 secondes
  setTimeout(() => {
    socket.emit('data_update', { message: 'Bienvenue sur le serveur en temps réel !' });
  }, 3000);

  // Tu peux définir ici des écouteurs d'événements spécifiques
  socket.on('disconnect', () => {
    console.log('Client déconnecté:', socket.id);
  });
});

const redisSubscriber = require('./config/redisPubSub');

const redisClient = require('./config/redis');

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




