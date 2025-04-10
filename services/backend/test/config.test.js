//Test du sous répertoire config

const path = require('path'); //Permet de construire le chemin vers le env
// Charger le fichier .env pour récupérer toutes les variables d'environnement
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Surcharger certaines variables pour l'environnement de test comme REDIS_HOST afin d'assurer que les connexions se font vers les bons hôtes
process.env.REDIS_HOST = process.env.REDIS_HOST || 'localhost';
process.env.POSTGRES_USER = process.env.POSTGRES_USER || 'my_user';
process.env.POSTGRES_PASSWORD = process.env.POSTGRES_PASSWORD || 'my_password';
process.env.POSTGRES_DB = process.env.POSTGRES_DB || 'my_database';
process.env.POSTGRES_HOST = process.env.POSTGRES_HOST || 'localhost';
process.env.POSTGRES_PORT = process.env.POSTGRES_PORT || '5432';

const http = require('http');

// Import des modules du sous-répertoire config
const db = require('../src/config/db'); //gestion de la connexion Postgre SQL via un pool de connexions
const mailer = require('../src/config/mailer'); //module qui gère l'envoi d'email
const mongo = require('../src/config/mongo'); //connexion à MongoDB via Mongoose
const redisClient = require('../src/config/redis');// Connexion à Redis
const redisPubSub = require('../src/config/redisPubSub');
const { initSocket, getIo } = require('../src/config/socket'); //Init de Socket.IO et gestion de son instance

describe('Modules du répertoire config', () => {
  //Test que le module exporte un pool (query) qui signifie que la connex PostgreSQL est config
  describe('db.js', () => {
    it('devrait exporter un pool avec une méthode query', () => {
      expect(db).toBeDefined();
      expect(typeof db.query).toBe('function');
    });
    // La fonction testConnection est appelée automatiquement lors du chargement
  });
  // Tester que le module exporte la fonction qu'on utilisera pour envoyer des emails
  describe('mailer.js', () => {
    it('devrait exporter la fonction sendConfirmationEmail', () => {
      expect(mailer).toBeDefined();
      expect(typeof mailer.sendConfirmationEmail).toBe('function');
    });
  });

  describe('mongo.js', () => {
    it('devrait exporter une instance mongoose avec une connexion', () => {
      expect(mongo).toBeDefined();
      expect(mongo.connection).toBeDefined();
    });
    //Test de la connex MongoDB avec Mongoose avec un timeout pour s'assurer que la connex est établie dans un délai raisonnable
    it('devrait se connecter à MongoDB', done => {
      // Si la connexion est déjà établie, on appelle directement done()
      if (mongo.connection.readyState === 1) {
        return done();
      }
      // Délai de timeout à 10 secondes
      const timeoutId = setTimeout(() => {
        done(new Error('MongoDB ne s\'est pas connecté dans les temps'));
      }, 10000);
      // Utiliser once pour écouter l'événement 'connected' une seule fois
      mongo.connection.once('connected', () => {
        clearTimeout(timeoutId);
        done();
      });
    });
  });

  describe('redis.js', () => {
    it('devrait exporter un client Redis', () => {
      expect(redisClient).toBeDefined();
      expect(typeof redisClient.connect).toBe('function');
    });

    it('devrait se connecter à Redis', done => {
      if (redisClient.isOpen) {
        done();
      } else {
        const interval = setInterval(() => {
          if (redisClient.isOpen) {
            clearInterval(interval);
            done();
          }
        }, 100);
        setTimeout(() => {
          clearInterval(interval);
          if (!redisClient.isOpen) {
            done(new Error('Redis ne s\'est pas connecté dans les temps'));
          }
        }, 5000);
      }
    });
  });

  describe('redisPubSub.js', () => {
    it('devrait exporter un client Redis pour PubSub', () => {
      expect(redisPubSub).toBeDefined();
      expect(typeof redisPubSub.connect).toBe('function');
    });

    it('devrait se connecter à Redis pour PubSub', done => {
      if (redisPubSub.isOpen) {
        done();
      } else {
        const interval = setInterval(() => {
          if (redisPubSub.isOpen) {
            clearInterval(interval);
            done();
          }
        }, 100);
        setTimeout(() => {
          clearInterval(interval);
          if (!redisPubSub.isOpen) {
            done(new Error('Redis PubSub ne s\'est pas connecté dans les temps'));
          }
        }, 5000);
      }
    });
  });

  describe('socket.js', () => {
    it('devrait exporter initSocket et getIo', () => {
      expect(initSocket).toBeDefined();
      expect(typeof initSocket).toBe('function');
      expect(getIo).toBeDefined();
      expect(typeof getIo).toBe('function');
    });

    it('getIo devrait lancer une erreur si initSocket n\'a pas été appelé', () => {
      expect(() => getIo()).toThrow('Socket.IO n\'est pas initialisé!');
    });

    it('devrait initialiser Socket.IO et retourner une instance valide de Socket.IO', () => {
      // Création d'un serveur HTTP temporaire
      const server = http.createServer();
      initSocket(server);
      const io = getIo();
      expect(io).toBeDefined();
      //Vérif de l'instance avec la méthode on
      expect(typeof io.on).toBe('function');
      // Nettoyage du serveur
      server.close();
    });
  });
});

// Bloc de nettoyage : fermeture des connexions ouvertes
afterAll(async () => {
  // Fermer la connexion PostgreSQL
  if (db.end) {
    await db.end();
  }
  // Fermer la connexion MongoDB
  if (mongo.connection.readyState === 1) {
    await mongo.disconnect();
  }
  // Fermer la connexion Redis pour redisClient
  if (redisClient.isOpen) {
    await redisClient.quit();
  }
  // Fermer la connexion Redis pour redisPubSub
  if (redisPubSub.isOpen) {
    await redisPubSub.quit();
  }
});
