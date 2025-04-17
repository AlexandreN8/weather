const request = require('supertest');

describe('Test des erreurs de connexion', () => {
  let randomEmail = `test+${Date.now()}@example.com`;

  beforeAll(async () => {
    // On crée un user valide (mot de passe correct)
    await request('http://localhost:5000')
      .post('/api/users/register')
      .send({
        email: randomEmail,
        nom: 'UserError',
        prenom: 'Test',
        password: 'Password1'
      });
  });

  it('Connexion avec un mauvais mot de passe (email correct) renvoie 401', async () => {
    const res = await request('http://localhost:5000')
      .post('/api/users/login')
      .send({
        // On utilise le bon email
        email: randomEmail,
        // un mot de passe incorrect
        password: 'WrongPassword'
      });

    // On s’attend à un code 401
    expect(res.status).toBe(401);
    // On vérifie qu’il y a un champ 'error'
    expect(res.body).toHaveProperty('error');
  });

  it('Connexion avec un email inexistant (mais mot de passe correct) renvoie 401', async () => {
    const res = await request('http://localhost:5000')
      .post('/api/users/login')
      .send({
        // On utilise un email inexistant
        email: `nope+${Date.now()}@example.com`,
        // On réutilise le mot de passe correct : "Password1"
        password: 'Password1'
      });

    // on s’attend à un code 401
    expect(res.status).toBe(401);
    // On vérifie qu’il y a un champ 'error'
    expect(res.body).toHaveProperty('error');
  });
});
