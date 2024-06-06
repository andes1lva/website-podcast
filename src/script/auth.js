const jwt = require('jsonwebtoken');

// Replace this with your own secret key
const secretKey = 'QGaGDcY6PGdSX071ca1Y0Q1bAjh1z8oFbgdK9dbXYLXU8H3sRx6WbFZmsu2UhVpO';

// Function to generate a token
function generateToken(payload) {
  return jwt.sign(payload, secretKey, { expiresIn: '1h' }); // Token valid for 1 hour
}

// Middleware to authenticate a token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401); // No token found

  jwt.verify(token, secretKey, (err, user) => {
    if (err) return res.sendStatus(403); // Invalid token
    req.user = user;
    next();
  });
}

module.exports = { generateToken, authenticateToken };

