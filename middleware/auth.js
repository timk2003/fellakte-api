const { getAuth } = require('firebase-admin/auth');

async function jwtAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Kein Token' });
  }

  const token = auth.split(' ')[1];
  try {
    const decoded = await getAuth().verifyIdToken(token);
    req.user = { id: decoded.uid, email: decoded.email };
    req.token = token;
    next();
  } catch (e) {
    res.status(401).json({ success: false, message: 'Auth-Fehler: ' + e.message });
  }
}

module.exports = { jwtAuth };
