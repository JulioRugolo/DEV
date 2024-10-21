const User = require('../models/User');

const adminMiddleware = async (req, res, next) => {
  try {
    const user = await User.findById(req.user);
    if (user && user.admin) {
      next();
    } else {
      res.status(403).json({ message: 'Acesso negado. Somente administradores têm permissão para esta ação.' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Erro no servidor.' });
  }
};

module.exports = adminMiddleware;
