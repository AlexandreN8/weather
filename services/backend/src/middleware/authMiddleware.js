const jwt = require('jsonwebtoken');

// fonction qui permet autoriser l'accès à l'admin
function isAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Token non fourni' });
  }
  
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role === 'admin') {
      return next();
    } else {
      return res.status(403).json({ error: 'Accès refusé : Administrateurs uniquement' });
    }
  } catch (err) {
    return res.status(401).json({ error: 'Token invalide' });
  }
}

module.exports = { isAdmin };
