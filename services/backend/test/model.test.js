process.env.POSTGRES_USER = 'my_user';
process.env.POSTGRES_PASSWORD = 'my_password';
process.env.POSTGRES_DB = 'my_database';
process.env.POSTGRES_HOST = 'localhost';
process.env.POSTGRES_PORT = '5432';
process.env.JWT_SECRET = 'ta_cle_secrete';

const { expect } = require('@jest/globals');

// Tests pour PostgreSQL
const pool = require('../src/config/db');
const adminModel = require('../src/model/adminModel');
const userModel = require('../src/model/userModel');

describe('Tests pour les modèles PostgreSQL', () => {
  beforeAll(async () => {
    // Nettoyer les utilisateurs de test et les demandes de rôle
    await pool.query("DELETE FROM users WHERE email LIKE 'test_%'");
    await pool.query("DELETE FROM role_request WHERE id_user < 0"); // On utilise des id_user négatifs pour les tests
  });

  afterAll(async () => {
    //Permet de nettoyer la base postgre après les tests, commenter pour voir la modif réel
    await pool.query("DELETE FROM users WHERE email LIKE 'test_%'");
    await pool.query("DELETE FROM role_request WHERE id_user < 0");
    await pool.end(); // Fermer la connexion PostgreSQL
  });

  test('userModel: createUser et findUser', async () => {
    const email = `test_${Date.now()}@example.com`;
    const nom = 'TestNom';
    const prenom = 'TestPrenom';
    const hashedPassword = 'hashed_password';
    const createdUser = await userModel.createUser(email, nom, prenom, hashedPassword);
    expect(createdUser).toBeDefined();
    expect(createdUser.email).toBe(email);

    const foundUser = await userModel.findUser(email);
    expect(foundUser).toBeDefined();
    expect(foundUser.email).toBe(email);
  });

  test('adminModel: getUserCount et getUsersPaginated', async () => {
    const countBefore = await adminModel.getUserCount();

    const email = `test_${Date.now()}@example.com`;
    await userModel.createUser(email, 'PaginateNom', 'PaginatePrenom', 'hashed_pass');

    const countAfter = await adminModel.getUserCount();
    expect(countAfter).toBeGreaterThan(countBefore);

    const users = await adminModel.getUsersPaginated(0, 5);
    expect(users).toBeInstanceOf(Array);
    expect(users.length).toBeLessThanOrEqual(5);
  });

  test('adminModel: updateUserRole', async () => {
    const email = `test_${Date.now()}@example.com`;
    const user = await userModel.createUser(email, 'RoleNom', 'RolePrenom', 'hashed_pass');
    const updatedUser = await adminModel.updateUserRole(user.id, 'admin');
    expect(updatedUser).toBeDefined();
    expect(updatedUser.role).toBe('admin');
  });

  test('adminModel: getOpenRoleRequests et updateRoleRequest', async () => {
    // Créer un utilisateur de test pour respecter la contrainte de clé étrangère
    const email = `test_role_${Date.now()}@example.com`;
    const testUser = await userModel.createUser(email, 'RoleTest', 'Tester', 'dummy_password');

    // Insertion d'une demande de rôle de test en utilisant l'id de l'utilisateur
    const insertQuery = `
      INSERT INTO role_request (id_user, desired_role, status, created_at, updated_at)
      VALUES ($1, 'moderator', 'pending', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING *
    `;
    const insertResult = await pool.query(insertQuery, [testUser.id]);
    const roleRequest = insertResult.rows[0];
    expect(roleRequest).toBeDefined();

    const openRequests = await adminModel.getOpenRoleRequests();
    expect(openRequests.length).toBeGreaterThan(0);

    // Mise à jour avec une valeur de statut autorisée.
    // La contrainte "status_valid" n'autorise que 'pending', 'accepted' et 'refused'
    const newStatus = 'accepted';
    const updatedRequest = await adminModel.updateRoleRequest(roleRequest.id, newStatus);
    expect(updatedRequest).toBeDefined();
    expect(updatedRequest.status).toBe(newStatus);
  });
});

// Tests pour les modèles Mongoose
process.env.MONGO_URI_TEST = 'mongodb://admin:password@localhost:27017/weatherDB?authSource=admin';
jest.setTimeout(60000);

const mongoose = require('mongoose');
const Alert = require('../src/model/Alert');
const ArchivedAlert = require('../src/model/ArchivedAlertSystem');
const { getAlertKey } = require('../src/scripts/alertUtils');

describe('Tests pour les modèles Mongoose', () => {
  beforeAll(async () => {
    const mongoURI = process.env.MONGO_URI_TEST;
    await mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
    await Alert.deleteMany({});
    await ArchivedAlert.deleteMany({});
  });

  afterAll(async () => {
    //Permet de nettoyer la base MongoDB après l'exécution des tests
    await Alert.deleteMany({});
    await ArchivedAlert.deleteMany({});
    await mongoose.disconnect();
  });

  test('Alert model: création et lecture d’une alerte', async () => {
    const alertData = {
      key: 'test_alert_1',
      status: 'active',
      labels: { alertname: 'test', container: 'test_container' },
      annotations: { description: 'Alerte de test', summary: 'Résumé' },
      startsAt: new Date(),
      endsAt: null
    };
    const createdAlert = await Alert.create(alertData);
    expect(createdAlert).toBeDefined();
    expect(createdAlert.key).toBe('test_alert_1');
    const foundAlert = await Alert.findOne({ key: 'test_alert_1' });
    expect(foundAlert).toBeDefined();
    expect(foundAlert.status).toBe('active');
  });

  test('ArchivedAlert model: création et lecture d’une alerte archivée', async () => {
    const archivedData = {
      key: 'test_archived_alert_1',
      status: 'archived',
      labels: { alertname: 'test_archived', container: 'archived_container' },
      annotations: { description: 'Alerte archivée de test', summary: 'Résumé archivé' },
      startsAt: new Date(),
      endsAt: new Date()
    };
    const createdArchivedAlert = await ArchivedAlert.create(archivedData);
    expect(createdArchivedAlert).toBeDefined();
    expect(createdArchivedAlert.key).toBe('test_archived_alert_1');
    const foundArchived = await ArchivedAlert.findOne({ key: 'test_archived_alert_1' });
    expect(foundArchived).toBeDefined();
    expect(foundArchived.status).toBe('archived');
  });
});