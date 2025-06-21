const { supabaseAdmin, getUserClient } = require('../services/supabase');

async function jwtAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Kein Token' });
  }

  const token = auth.split(' ')[1];
  try {
    const { data, error } = await supabaseAdmin.auth.getUser(token);
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
