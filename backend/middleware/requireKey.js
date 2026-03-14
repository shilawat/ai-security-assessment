module.exports = function requireKey(req, res, next) {
  const key = req.headers['x-access-key'];
  let store;
  try {
    store = JSON.parse(process.env.ACCESS_KEYS || '{}');
  } catch {
    return res.status(500).json({ error: 'Server key store misconfigured.' });
  }
  if (!key || !store[key]?.active) {
    return res.status(401).json({ error: 'Invalid or missing access key.' });
  }
  next();
};
