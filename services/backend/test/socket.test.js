const io = require('socket.io-client'); //On importe socket.io-client pour tester les coms en real-time avec Socket.IO
//Test de socket.io qui permet de fournir des data météo en temps réel et des alertes dynamiques au client
describe('Test de Socket.IO', () => {
  let clientSocket;

  beforeAll((done) => {
    // Se connecter au serveur Socket.IO sur localhost:5000
    clientSocket = io('http://localhost:5000', {
      transports: ['websocket'],
      forceNew: true,
    });
    clientSocket.on('connect', () => {
      done();
    });
  });

  afterAll(() => {
    if (clientSocket && clientSocket.connected) {
      clientSocket.disconnect();
    }
  });

  it('devrait recevoir l’événement data_update après connexion', (done) => {
    // On écoute l'événement 'data_update'
    clientSocket.on('data_update', (data) => {
      expect(data).toBeDefined();
      // Par exemple, vérifier qu’on reçoit un objet contenant des propriétés 'stations' et 'alerts'
      expect(data).toHaveProperty('stations');
      expect(data).toHaveProperty('alerts');
      done();
    });
  });
});
