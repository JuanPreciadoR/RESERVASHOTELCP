// calendar.js - Rutas para calendario
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middlewares/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Obtener eventos para calendario (requiere autenticación)
router.get('/events', authMiddleware, async (req, res) => {
  try {
    const { start, end } = req.query;
    
    if (!start || !end) {
      return res.status(400).json({ message: 'Se requieren fechas start y end' });
    }

    const startDate = new Date(start);
    const endDate = new Date(end);

    // Obtener reservas en el rango de fechas
    const bookings = await prisma.booking.findMany({
      where: {
        OR: [
          {
            checkIn: { lte: endDate },
            checkOut: { gte: startDate }
          }
        ]
      },
      include: {
        room: true,
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    // Transformar a formato de eventos para calendario
    const events = bookings.map(booking => {
      // Definir color según estado
      let color = '#3788d8'; // azul por defecto
      switch(booking.status) {
        case 'confirmed':
          color = '#28a745'; // verde
          break;
        case 'checked_in':
          color = '#ffc107'; // amarillo
          break;
        case 'checked_out':
          color = '#6c757d'; // gris
          break;
        case 'cancelled':
          color = '#dc3545'; // rojo
          break;
        default:
          color = '#17a2b8'; // celeste
      }

      return {
        id: booking.id,
        title: `${booking.room?.type} #${booking.room?.number} - ${booking.user?.name || 'Huésped'}
        `,
        start: booking.checkIn,
        end: booking.checkOut,
        color: color,
        extendedProps: {
          status: booking.status,
          guests: booking.guests,
          totalPrice: booking.totalPrice,
          roomNumber: booking.room?.number,
          roomType: booking.room?.type,
          guestName: booking.user?.name,
          guestEmail: booking.user?.email
        }
      };
    });

    res.json(events);
  } catch (error) {
    console.error('Error al obtener eventos:', error);
    res.status(500).json({ message: 'Error al obtener eventos' });
  }
});

module.exports = router;