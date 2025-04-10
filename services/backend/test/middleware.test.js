const express = require('express');
const request = require('supertest');
const jwt = require('jsonwebtoken');

// Importer le middleware d'authentification depuis authMiddleware.js
const { isAdmin: isAdminAuth } = require('../src/middleware/authMiddleware');

// Forcer la clé secrète pour la vérification des tokens lors des tests
const TEST_SECRET = 'test_secret';
process.env.JWT_SECRET = TEST_SECRET;

describe('Tests pour les middlewares d’authentification (authMiddleware)', () => {
  let appAuth;

  beforeAll(() => {
    appAuth = express();
    // Définir une route protégée par isAdminAuth
    appAuth.get('/admin', isAdminAuth, (req, res) => {
      res.json({ message: 'Accès autorisé (admin)' });
    });
  });

  it('authMiddleware : doit renvoyer 401 si aucun token n’est fourni', async () => {
    const res = await request(appAuth).get('/admin');
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Token non fourni');
  });

  it('authMiddleware : doit renvoyer 401 si le token est invalide', async () => {
    const res = await request(appAuth)
      .get('/admin')
      .set('Authorization', 'Bearer token_invalide');
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Token invalide');
  });

  it('authMiddleware : doit renvoyer 403 si l’utilisateur n’est pas admin', async () => {
    const token = jwt.sign({ id: 1, role: 'user' }, TEST_SECRET);
    const res = await request(appAuth)
      .get('/admin')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
    expect(res.body.error).toBe('Accès refusé : Administrateurs uniquement');
  });

  it('authMiddleware : doit autoriser l’accès si l’utilisateur est admin', async () => {
    const token = jwt.sign({ id: 1, role: 'admin' }, TEST_SECRET);
    const res = await request(appAuth)
      .get('/admin')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Accès autorisé (admin)');
  });
});

// Importer directement le middleware loginLimiter (il est exporté directement)
const loginLimiter = require('../src/middleware/loginLimiter');

describe('Tests pour loginLimiter middleware', () => {
  let appLoginLimiter;

  beforeAll(() => {
    appLoginLimiter = express();
    // Monter loginLimiter sur une route de test
    appLoginLimiter.get('/admin-login', loginLimiter, (req, res) => {
      res.json({ message: 'Accès autorisé via loginLimiter (admin)' });
    });
  });

  it('loginLimiter : doit renvoyer 200 (accès autorisé) même si aucun token n’est fourni', async () => {
    const res = await request(appLoginLimiter).get('/admin-login');
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Accès autorisé via loginLimiter (admin)');
  });
});



// Pour cette partie, on utilise une base MongoDB réelle et initialisons Socket.IO pour éviter l'erreur de "Socket.IO n'est pas initialisé".
// Nous forçons MONGO_URI_TEST pour pointer vers la base utilisée (ici, "weatherDB" comme dans docker-compose)
process.env.MONGO_URI_TEST = 'mongodb://admin:password@localhost:27017/weatherDB?authSource=admin';

jest.setTimeout(60000); // Timeout fixé à 60 secondes pour les tests
jest.useRealTimers();   // Utilisation des timers réels

const http = require('http');
const { initSocket } = require('../src/config/socket');
// Initialiser Socket.IO sur un serveur HTTP de test
const server = http.createServer();
initSocket(server);

const mongoose = require('mongoose');
const { processAlert } = require('../src/middleware/alertMiddleware');
const Alert = require('../src/model/Alert');
const { getAlertKey } = require('../src/scripts/alertUtils');

describe('Tests pour alertMiddleware - processAlert', () => {
  beforeAll(async () => {
    const mongoURI = process.env.MONGO_URI_TEST;
    await mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
    // Nettoyer la collection Alert avant les tests
    await Alert.deleteMany({});
  });

  afterAll(async () => {
    // Nettoyer la collection et fermer la connexion
    //await Alert.deleteMany({});
    await mongoose.disconnect();
    // Libérer les timers éventuellement actifs
    jest.clearAllTimers();
  });

  // Vérifier que getAlertKey produit la même clé pour la même alerte, quel que soit le statut
  it('les clés générées par getAlertKey pour la même alerte doivent être identiques', () => {
    const dummyAlert = { 
      labels: { alertname: 'cpu_usage', container: 'server1' },
      value: 95,
      status: 'active'
    };
    const updatedAlert = { ...dummyAlert, status: 'resolved' };
    expect(getAlertKey(dummyAlert)).toBe(getAlertKey(updatedAlert));
  });

  it('devrait insérer une nouvelle alerte dans la base de données si elle n’existe pas', async () => {
    const dummyAlert = {
      labels: { alertname: 'cpu_usage', container: 'server1' },
      value: 95,
      status: 'active'
    };

    // Passer directement l'alerte (et non { alerts: dummyAlert })
    await processAlert(dummyAlert);

    const key = getAlertKey(dummyAlert);
    const alertInDb = await Alert.findOne({ key });
    expect(alertInDb).toBeDefined();
    expect(alertInDb.status).toBe('active');
  });

  it('devrait mettre à jour une alerte existante si le statut change', async () => {
    const dummyAlert = {
      labels: { alertname: 'cpu_usage', container: 'server1' },
      value: 95,
      status: 'active'
    };

    // Insérer initialement l'alerte
    await processAlert(dummyAlert);

    // Modifier le statut en "resolved"
    const updatedAlert = { ...dummyAlert, status: 'resolved' };
    await processAlert(updatedAlert);

    const key = getAlertKey(dummyAlert);
    const alertInDb = await Alert.findOne({ key });
    expect(alertInDb).toBeDefined();
    expect(alertInDb.status).toBe('resolved');
  });
});
