const rateLimit = require('express-rate-limit');

// Middleware de limitation des tentatives de connexion
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limite à 5 tentatives par fenêtre
    message: 'Trop de tentatives de connexion, veuillez réessayer dans 15 minutes.',
});

module.exports = loginLimiter;