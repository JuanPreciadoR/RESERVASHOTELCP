// auth.js - Middleware de autenticación
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    try {
        // 1. Obtener el token del header Authorization
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                message: 'No se proporcionó token de autenticación'
            });
        }

        // 2. El formato esperado es: "Bearer TOKEN"
        const token = authHeader.split(' ')[1]; // Separar "Bearer" del token

        if (!token) {
            return res.status(401).json({
                message: 'Formato de token inválido'
            });
        }

        // 3. Verificar el token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 4. Guardar la información del usuario en la petición
        req.user = decoded;

        // 5. Continuar con la siguiente función (la ruta)
        next();

    } catch (error) {
        // Si el token es inválido o expiró
        return res.status(401).json({
            message: 'Token inválido o expirado'
        });
    }
};

module.exports = authMiddleware;
