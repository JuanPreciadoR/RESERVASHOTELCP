// admin.js - Rutas exclusivas para administradores
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middlewares/auth');
const adminMiddleware = require('../middlewares/admin');

const router = express.Router();
const prisma = new PrismaClient();

// Todas las rutas requieren autenticacion y ser admin
router.use(authMiddleware);
router.use(adminMiddleware);

// Obtener TODAS las reservas (con filtros opcionales)
router.get('/bookings', async (req, res) => {
  try {
    const { status, startDate, endDate } = req.query;
    
    // Construir filtros dinamicamente
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

// Dashboard con estadisticas
router.get('/dashboard', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Obtener todas las habitaciones
    const rooms = await prisma.room.findMany();
    const totalRooms = rooms.length;
    const occupiedRooms = rooms.filter(r => r.status === 'occupied').length;
    
    // Estadisticas en paralelo
    const [
      totalBookings,
      todayCheckIns,
      todayCheckOuts,
      monthlyRevenue
    ] = await Promise.all([
      // Total reservas activas
      prisma.booking.count({
        where: {
          status: { in: ['confirmed', 'checked_in'] }
        }
      }),
      
      // Check-ins de hoy
      prisma.booking.count({
        where: {
          status: 'confirmed',
          checkIn: {
            gte: today,
            lt: tomorrow
          }
        }
      }),
      
      // Check-outs de hoy
      prisma.booking.count({
        where: {
          status: 'checked_in',
          checkOut: {
            gte: today,
            lt: tomorrow
          }
        }
      }),
      
      // Ingresos del mes
      prisma.invoice.aggregate({
        where: {
          issueDate: {
            gte: new Date(today.getFullYear(), today.getMonth(), 1),
            lt: new Date(today.getFullYear(), today.getMonth() + 1, 1)
          }
        },
        _sum: {
          total: true
        }
      })
    ]);

    res.json({
      totalRooms,
      occupiedRooms,
      availableRooms: totalRooms - occupiedRooms,
      totalBookings,
      todayCheckIns,
      todayCheckOuts,
      monthlyRevenue: monthlyRevenue._sum.total || 0,
      occupancyRate: totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0
    });
  } catch (error) {
    console.error('Error al obtener dashboard:', error);
    res.status(500).json({ message: 'Error al obtener dashboard' });
  }
});

// Reporte de ocupacion por fechas
router.get('/reports/occupancy', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ 
        message: 'Se requieren fechas de inicio y fin' 
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const bookings = await prisma.booking.findMany({
      where: {
        OR: [
          {
            checkIn: { lte: end },
            checkOut: { gte: start }
          }
        ],
        status: { not: 'cancelled' }
      },
      include: {
        room: true
      },
      orderBy: {
        checkIn: 'asc'
      }
    });

    res.json({
      startDate,
      endDate,
      totalBookings: bookings.length,
      bookings
    });
  } catch (error) {
    console.error('Error al generar reporte:', error);
    res.status(500).json({ message: 'Error al generar reporte' });
  }
});

// Gestion de usuarios (solo admin)
router.get('/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        document: true,
        phone: true,
        createdAt: true,
        _count: {
          select: { bookings: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    res.json(users);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ message: 'Error al obtener usuarios' });
  }
});

// Actualizar rol de usuario (solo admin)
router.put('/users/:id/role', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { role } = req.body;
    
    if (!['guest', 'receptionist', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Rol invalido' });
    }

    const user = await prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        email: true,
        name: true,
        role: true
      }
    });

    res.json(user);
  } catch (error) {
    console.error('Error al actualizar rol:', error);
    res.status(500).json({ message: 'Error al actualizar rol' });
  }
});

module.exports = router;