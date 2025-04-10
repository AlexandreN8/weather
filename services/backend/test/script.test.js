const util = require('util');
const exec = util.promisify(require('child_process').exec);
const path = require('path');
const { expect } = require('@jest/globals');


require('dotenv').config({ path: path.join(__dirname, '../../.env.test') });

// Forcer manuellement les variables pour PostgreSQL et JWT
process.env.POSTGRES_USER = process.env.POSTGRES_USER || 'my_user';
process.env.POSTGRES_PASSWORD = process.env.POSTGRES_PASSWORD || 'my_password';
process.env.POSTGRES_DB = process.env.POSTGRES_DB || 'my_database';
process.env.POSTGRES_HOST = process.env.POSTGRES_HOST || 'localhost';
process.env.POSTGRES_PORT = process.env.POSTGRES_PORT || '5432';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'ta_cle_secrete';

jest.setTimeout(30000); // Augmente le timeout global pour les tests longs

describe('Tests pour alertUtils.js', () => {
  const { getAlertKey } = require('../src/scripts/alertUtils');

  test('doit retourner une clé basée sur alertname et container', () => {
    const alert = { labels: { alertname: 'CPU_Usage', container: 'server123' } };
    const key = getAlertKey(alert);
    expect(key).toBe('CPU_Usage_server123');
  });

  test('doit retourner "unknown_unknown" si aucun label n\'est fourni', () => {
    const alert = {};
    const key = getAlertKey(alert);
    expect(key).toBe('unknown_unknown');
  });
});

/*
describe('Tests pour createAdmin.js', () => {
  // Chemin absolu du script createAdmin.js
  const scriptPath = path.join(__dirname, '../src/scripts/createAdmin.js');

  // Générer des données de test uniques pour éviter les collisions dans la base de données PostgreSQL
  const testEmail = `test_admin_${Date.now()}@example.com`;
  const testName = `admin_${Date.now()}`;
  const testPassword = 'testpassword';

  test('doit créer un compte admin et le supprimer ensuite', async () => {
    // Exécuter le script createAdmin.js en transmettant les variables d'environnement
    const { stdout } = await exec(
      `node ${scriptPath} ${testEmail} ${testName} ${testPassword}`,
      { env: process.env }
    );
    expect(stdout).toMatch(/Admin créé avec succès/);

    // Vérifier dans PostgreSQL que le compte a bien été créé
    const pool = require('../src/config/db');
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [testEmail]);
    expect(result.rows.length).toBe(1);

    // Nettoyage : Supprimer l'utilisateur de test
    await pool.query('DELETE FROM users WHERE email = $1', [testEmail]);
  });
});
*/

describe('Tests pour generateHash.js', () => {
  const scriptPath = path.join(__dirname, '../src/scripts/generateHash.js');

  test('doit générer un hash pour le mot de passe admin', async () => {
    const { stdout } = await exec(`node ${scriptPath}`, { env: process.env });
    // On s'attend à ce que la sortie contienne "Hash généré:" suivi d'un hash bcrypt qui commence par "$2b$10$"
    expect(stdout).toMatch(/Hash généré: \$2b\$10\$/);
  });
});
