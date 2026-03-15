// receptionist.js - Rutas para recepcionistas
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middlewares/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Middleware para verificar que sea recepcionista o admin
const receptionistMiddleware = (req, res, next) => {
  if (req.user.role !== 'receptionist' && req.user.role !== 'admin') {
    return res.status(403).json({ 
      message: 'Acceso denegado. Se requieren permisos de recepcionista o administrador' 
    });
  }
  next();
};

// Todas las rutas requieren autenticación y rol de recepcionista/admin
router.use(authMiddleware);
router.use(receptionistMiddleware);

// Obtener TODAS las reservas (para recepcionistas)
router.get('/bookings', async (req, res) => {
  try {
    const { status, startDate, endDate } = req.query;
    
    const where = {};
    
    if (status) {
      where.status = status;
    }
    
    if (startDate || endDate) {
      where.checkIn = {};
      if (startDate) where.checkIn.gte = new Date(startDate);
      if (endDate) where.checkIn.lte = new Date(endDate);
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            document: true,
            phone: true
          }
        },
        room: true,
        invoice: true
      },
      orderBy: {
        checkIn: 'desc'
      }
    });

    res.json(bookings);
  } catch (error) {
    console.error('Error al obtener reservas:', error);
    res.status(500).json({ message: 'Error al obtener reservas' });
  }
});

// Buscar huéspedes por nombre o documento
router.get('/guests/search', async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ message: 'Se requiere término de búsqueda' });
    }

    const guests = await prisma.user.findMany({
      where: {
        role: 'guest',
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { document: { contains: query } },
          { email: { contains: query, mode: 'insensitive' } }
        ]
      },
      select: {
        id: true,
        name: true,
        email: true,
        document: true,
        phone: true
      }
    });

    res.json(guests);
  } catch (error) {
    console.error('Error al buscar huéspedes:', error);
    res.status(500).json({ message: 'Error al buscar huéspedes' });
  }
});

module.exports = router;