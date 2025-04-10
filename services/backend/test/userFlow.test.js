//Import de Supertest pour envoyer des requetes HTTP vers http://localhost:5000
const request = require('supertest');

//Approche boite noire on n'importe pas app.js, on pointe directement sur http://localhost:5000 pour éviter de relancer le serveur et de déclencer une erreur

describe('Scénario fonctionnel : inscription -> connexion -> accès', () => {
  let token;
  let randomEmail;
  
  //Hook Jest qui s'exécute une fois avant les tests
  beforeAll(() => {
    // On génère un email unique pour éviter la duplication dans la base de données
    randomEmail = `test+${Date.now()}@example.com`;
  });

  it('Étape 1 : inscription', async () => {
    const res = await request('http://localhost:5000')
      .post('/api/users/register')
      .send({
        email: randomEmail,   // Pour éviter "email déjà utilisé"
        nom: 'TestNom',
        prenom: 'TestPrenom',
        password: 'Password1'
      });
    //Code accepté en cas de succès
    expect([200, 201]).toContain(res.status);
  });

  it('Étape 2 : connexion', async () => {
    const res = await request('http://localhost:5000')
      .post('/api/users/login')
      .send({
        email: randomEmail,
        password: 'Password1'
      });
    //On attend un code 200 pour le succès
    expect(res.status).toBe(200);
    // On attend un champ 'token'
    expect(res.body).toHaveProperty('token');
    token = res.body.token;
  });

  it('Étape 3 : accès à une route protégée', async () => {
    // /api/accueil renvoie du texte brut : "Bienvenue sur la page d'accueil !"
    // donc on vérifie res.text, pas res.body
    const res = await request('http://localhost:5000')
      .get('/api/accueil')
      //Permet de prouver la connexion
      .set('Authorization', `Bearer ${token}`);

    //l’accès réussi renvoie 200 si la route est accessible donc un middleware d'auth OK
    expect(res.status).toBe(200);
    // On vérifie que le texte contient la phrase
    expect(res.text).toContain("Bienvenue sur la page d'accueil !");
  });
});
