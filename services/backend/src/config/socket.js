// Socket.IO Singleton
const socketIo = require('socket.io');
let io = null;

const initSocket = (server) => {
  io = socketIo(server, {
    cors: {
      origin: "*", // Ajuste cela selon les besoins de sécurité (ex: origine du front-end)
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    console.log('Client connecté, id:', socket.id);
    socket.on('disconnect', () => {
      console.log('Client déconnecté, id:', socket.id);
    });
  });
};

const getIo = () => {
  if (!io) {
    throw new Error('Socket.IO n\'est pas initialisé!');
  }
  return io;
};

module.exports = { initSocket, getIo };
