// admin.js - Middleware para verificar si el usuario es administrador
const adminMiddleware = (req, res, next) => {
  // req.user viene del authMiddleware (ya ejecutado antes)
  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      message: 'Acceso denegado. Se requieren permisos de administrador' 
    });
  }
  next();
};

module.exports = adminMiddleware;