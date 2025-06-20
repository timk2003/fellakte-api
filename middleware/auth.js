const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function jwtAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Kein Token' });
  }
  const token = auth.split(' ')[1];
  try {
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user) {
      return res.status(401).json({ success: false, message: 'Ungültiges Token' });
    }
    req.user = data.user;
    next();
  } catch (e) {
    res.status(401).json({ success: false, message: 'Auth-Fehler' });
  }
}

module.exports = { jwtAuth }; 