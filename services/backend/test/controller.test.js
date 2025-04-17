//Fichier qui permet de tester le comportement réel du controleur user

//Import des modules pour gérer les routes, créer l'appli Express et faire les requetes HTTP de test.
const path = require('path');
//permet de créer une appli http minimale pour les routes register et login
const express = require('express');
const bodyParser = require('body-parser');
const request = require('supertest');

// Forcer les variables d'environnement pour que le mailer dispose des informations d'identification
process.env.EMAIL_ADDRESS = 'noreply.ter2025@gmail.com';
process.env.EMAIL_PASSWORD = 'sehd tjtz urce zjyt';

// Forcer le mode test et JWT_SECRET pour les tests
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'ta_cle_secrete';

// Forcer les valeurs de connexion PostgreSQL pour les tests
process.env.POSTGRES_USER = 'my_user';
process.env.POSTGRES_PASSWORD = 'my_password';
process.env.POSTGRES_DB = 'my_database';
// Utiliser localhost pour la connex local en test
process.env.POSTGRES_HOST = 'localhost';
process.env.POSTGRES_PORT = '5432';

// Charger les variables d'environnement (pour d'autres variables, par exemple)
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

// Importer les fonctions du contrôleur
const { register, login } = require('../src/controller/userController');

// Créer une application Express minimale pour les tests
const app = express();
app.use(bodyParser.json());

// Monter les routes pour tester les fonctions du contrôleur
app.post('/register', register); //Appelle register pour créer un user
app.post('/login', login); //Appelle login pour connecter un user

describe('Tests fonctionnels du UserController', () => {
  it('devrait créer un nouvel utilisateur et l’insérer dans la base de données via /register', async () => {
    // Générer un email unique pour éviter toute collision
    const uniqueEmail = `test_${Date.now()}@example.com`;
    const response = await request(app)
      .post('/register')
      .send({
        email: uniqueEmail,
        nom: 'TestNom',
        prenom: 'TestPrenom',
        password: 'testpassword'
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('message', "Utilisateur créé avec succès.");
    expect(response.body).toHaveProperty('user');
    // Vérifier que le mot de passe n'est pas retourné dans la réponse
    expect(response.body.user.password).toBeUndefined();
  });

  it('devrait retourner 400 si des champs requis manquent via /register', async () => {
    const response = await request(app)
      .post('/register')
      .send({
        email: '',
        nom: '',
        prenom: '',
        password: ''
      });
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', "Email, nom, prenom et password sont requis.");
  });

  it('devrait retourner 400 si un utilisateur avec le même email existe déjà via /register', async () => {
    // Inscription initiale
    const uniqueEmail = `dup_${Date.now()}@example.com`;
    await request(app)
      .post('/register')
      .send({
        email: uniqueEmail,
        nom: 'DupNom',
        prenom: 'DupPrenom',
        password: 'password123'
      });
    // Nouvelle tentative avec le même email
    const response = await request(app)
      .post('/register')
      .send({
        email: uniqueEmail,
        nom: 'DupNom',
        prenom: 'DupPrenom',
        password: 'password123'
      });
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', "Un utilisateur avec cet email existe déjà.");
  });

  it('devrait retourner 400 si l’email ou le mot de passe manque lors du login', async () => {
    const response = await request(app)
      .post('/login')
      .send({
        email: '',
        password: ''
      });
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', "L'email et le mot de passe sont requis.");
  });

  it('devrait retourner 401 si l’utilisateur n’existe pas via /login', async () => {
    const response = await request(app)
      .post('/login')
      .send({
        email: 'nonexistent@example.com',
        password: 'testpassword'
      });
    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('error', "Identifiants invalides.");
  });

  it('devrait retourner 401 si le mot de passe est incorrect via /login', async () => {
    // Inscription pour le test
    const uniqueEmail = `login_${Date.now()}@example.com`;
    await request(app)
      .post('/register')
      .send({
        email: uniqueEmail,
        nom: 'LoginNom',
        prenom: 'LoginPrenom',
        password: 'correctpassword'
      });
    // Tentative de connexion avec un mot de passe erroné
    const response = await request(app)
      .post('/login')
      .send({
        email: uniqueEmail,
        password: 'wrongpassword'
      });
    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('error', "Identifiants invalides.");
  });

  it('devrait retourner 200 et un token si la connexion est réussie via /login', async () => {
    // Inscription préalable
    const uniqueEmail = `login_success_${Date.now()}@example.com`;
    await request(app)
      .post('/register')
      .send({
        email: uniqueEmail,
        nom: 'SuccessNom',
        prenom: 'SuccessPrenom',
        password: 'mypassword'
      });
    // Connexion avec les bons identifiants
    const response = await request(app)
      .post('/login')
      .send({
        email: uniqueEmail,
        password: 'mypassword'
      });
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', "Connexion réussie.");
    expect(response.body).toHaveProperty('user');
    expect(response.body).toHaveProperty('token');
    expect(response.body.user.password).toBeUndefined();
  });
  
  //Bloc de nettoyage qui permet de fermer le pool PostgreSQL pour que Jest se termine correctement
  afterAll(async () => {
    const db = require('../src/config/db');
    if (db.end) {
      await db.end();
    }
  });
});
