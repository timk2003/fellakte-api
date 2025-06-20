const { supabaseAdmin, getUserClient } = require('../services/supabase');

async function jwtAuth(req, res, next) {
  // 👇 CORS-Preflight immer durchlassen!
  if (req.method === 'OPTIONS') return next();

  const auth = req.headers.authorization;
  console.log('Authorization Header:', req.headers.authorization);
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Kein Token' });
  }

  const token = auth.split(' ')[1];
  console.log('Token:', token);
  try {
    const { data, error } = await supabaseAdmin.auth.getUser(token);
    console.log('getUser result:', { data, error });
    if (error || !data.user) {
      return res.status(401).json({ success: false, message: 'Ungültiges Token' });
    }
    req.user = data.user;
    req.token = token;
    req.userClient = getUserClient(token);
    next();
  } catch (e) {
    res.status(401).json({ success: false, message: 'Auth-Fehler' });
  }
}

module.exports = { jwtAuth };
