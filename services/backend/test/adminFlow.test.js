/*const request = require('supertest');

describe('Tests des routes Admin', () => {
  let adminToken;
  let userToken;

  beforeAll(async () => {
    // Connexion en tant qu'administrateur
    const adminRes = await request('http://localhost:5000')
      .post('/api/users/login')
      .send({
        email: 'admin@example.com',
        password: 'AdminPassword'
      });
    adminToken = adminRes.body.token;

    // Connexion en tant qu'utilisateur normal
    const userRes = await request('http://localhost:5000')
      .post('/api/users/login')
      .send({
        email: 'test@example.com',
        password: 'Password1'
      });
    userToken = userRes.body.token;
  });

  // Test de la route d'accueil admin : GET /api/admin
  //Vérification que la route api/admin est autorisé pour un admin
  it('GET /api/admin avec token admin renvoie 200 et le message de bienvenue', async () => {
    const res = await request('http://localhost:5000')
      .get('/api/admin')
      .set('Authorization', `Bearer ${adminToken}`);
    //On espère un code 200 pour un succès
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message', "Bienvenue dans l'espace administrateur.");
  });
  //Refus d'accès à la route admin pour un user standard
  it('GET /api/admin avec token utilisateur renvoie 401 ou 403', async () => {
    const res = await request('http://localhost:5000')
      .get('/api/admin')
      .set('Authorization', `Bearer ${userToken}`);
    
    expect([401, 403]).toContain(res.status);
  });

  // Test de mise à jour du rôle d'un utilisateur par un admin
  it('PUT /api/admin/users/2/role met à jour le rôle de l’utilisateur avec ID 2', async () => {
    // Par exemple, on passe l'utilisateur de "user" à "admin"
    const newRole = 'admin';
    const res = await request('http://localhost:5000')
      .put('/api/admin/users/2/role')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ role: newRole });
    
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message', "Rôle mis à jour avec succès.");
    expect(res.body).toHaveProperty('user');
    expect(res.body.user).toHaveProperty('role', newRole);
  });

  // Test que l'appel de la route retourne un tableau des demandes de roles ouvertes des users
  it('GET /api/admin/role-requests/open renvoie 200 et un tableau de demandes', async () => {
    const res = await request('http://localhost:5000')
      .get('/api/admin/role-requests/open')
      .set('Authorization', `Bearer ${adminToken}`);
    
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('requests');
    expect(Array.isArray(res.body.requests)).toBe(true);
  });

  // Test que l'admin peut maj une demande de rôle avec un statut donné
  it('PUT /api/admin/role-requests/1 met à jour une demande de rôle si celle-ci existe', async () => {
    // Ici, on teste une demande avec l'ID 1.
    const res = await request('http://localhost:5000')
      .put('/api/admin/role-requests/1')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'accepted' });
    //200 pour succès et 400 pour échec
    expect([200, 404]).toContain(res.status);
    if (res.status === 200) {
      expect(res.body).toHaveProperty('message', "Demande mise à jour avec succès.");
      expect(res.body).toHaveProperty('request');
    }
  });
});*/