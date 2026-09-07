export const adminAuth = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (apiKey === process.env.ADMIN_API_KEY) {
    next();
  } else {
    res.status(401).json({ error: 'РќРµР°РІС‚РѕСЂРёР·РѕРІР°РЅ' });
  }
};
