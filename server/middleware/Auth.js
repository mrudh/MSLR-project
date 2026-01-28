const jwt = require('jsonwebtoken');
require("dotenv").config();
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error("JWT_SECRET missing in environment");

function authenticateJWT(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.error('JWT verify error:', err.message);

    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
}


function requireEC(req, res, next) {
  if (!req.user || req.user.role !== 'ec') {
    return res.status(403).json({ error: 'Access denied. EC only.' });
  }
  next();
}

function requireVoter(req, res, next) {
  if (!req.user || req.user.role !== 'voter') {
    return res.status(403).json({ error: 'Access denied. Voters only.' });
  }
  next();
}

module.exports = { authenticateJWT, requireEC, requireVoter };
