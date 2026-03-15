const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middlewares/auth');

const router = express.Router();
const prisma = new PrismaClient();

console.log('🔄 Cargando rutas de bookings...');

router.use(authMiddleware);

// CHECK-IN (recepcionistas y admins pueden cualquier reserva)
router.put('/:id/checkin', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const userRole = req.user.role;

    let whereClause = { id };
    if (userRole !== 'admin' && userRole !== 'receptionist') {
      whereClause.userId = req.user.id;
    }

    const booking = await prisma.booking.findFirst({
      where: whereClause,
      include: { room: true }
    });

    if (!booking) return res.status(404).json({ message: 'Reserva no encontrada' });
    if (booking.status !== 'confirmed') return res.status(400).json({ message: 'Solo reservas confirmadas pueden hacer check-in' });

    await prisma.$transaction([
      prisma.booking.update({ where: { id }, data: { status: 'checked_in' } }),
      prisma.room.update({ where: { id: booking.roomId }, data: { status: 'occupied' } })
    ]);

    res.json({ message: 'Check-in exitoso' });
  } catch (error) {
    res.status(500).json({ message: 'Error en check-in' });
  }
});

// CHECK-OUT
router.put('/:id/checkout', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const userRole = req.user.role;

    let whereClause = { id };
    if (userRole !== 'admin' && userRole !== 'receptionist') {
      whereClause.userId = req.user.id;
    }

    const booking = await prisma.booking.findFirst({
      where: whereClause,
      include: { room: true }
    });

    if (!booking) return res.status(404).json({ message: 'Reserva no encontrada' });
    if (booking.status !== 'checked_in') return res.status(400).json({ message: 'Solo reservas con check-in pueden hacer check-out' });

    const tax = Math.round(booking.totalPrice * 0.19);
    const total = booking.totalPrice + tax;

    await prisma.$transaction([
      prisma.booking.update({ where: { id }, data: { status: 'checked_out' } }),
      prisma.room.update({ where: { id: booking.roomId }, data: { status: 'available' } }),
      prisma.invoice.create({
        data: {
          bookingId: id,
          subtotal: booking.totalPrice,
          tax,
          total,
          issueDate: new Date()
        }
      })
    ]);

    res.json({ message: 'Check-out exitoso' });
  } catch (error) {
    res.status(500).json({ message: 'Error en check-out' });
  }
});

// CREAR RESERVA (MODIFICADO para que recepcionistas puedan crear para otros usuarios)
router.post('/', async (req, res) => {
  try {
    const { roomId, checkIn, checkOut, guests, userId } = req.body;
    const userRole = req.user.role;
    const authenticatedUserId = req.user.id;

    // Determinar para quién se crea la reserva
    let targetUserId = authenticatedUserId;
    
    // Si es recepcionista o admin y se envió un userId, usar ese
    if ((userRole === 'admin' || userRole === 'receptionist') && userId) {
      targetUserId = parseInt(userId);
      
      // Verificar que el usuario destino existe
      const targetUser = await prisma.user.findUnique({
        where: { id: targetUserId }
      });
      if (!targetUser) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }
    }

    // Validar datos obligatorios
    if (!roomId || !checkIn || !checkOut || !guests) {
      return res.status(400).json({ message: 'Faltan datos obligatorios' });
    }

    // Verificar habitación
    const room = await prisma.room.findUnique({ where: { id: roomId } });
    if (!room) return res.status(404).json({ message: 'Habitación no encontrada' });

    // Verificar capacidad
    if (guests > room.capacity) {
      return res.status(400).json({ message: 'Excede capacidad máxima' });
    }

    // Verificar disponibilidad
    const existingBooking = await prisma.booking.findFirst({
      where: {
        roomId,
        status: { not: 'cancelled' },
        AND: [
          { checkIn: { lt: new Date(checkOut) } },
          { checkOut: { gt: new Date(checkIn) } }
        ]
      }
    });

    if (existingBooking) {
      return res.status(400).json({ message: 'Habitación no disponible' });
    }

    // Calcular precio
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    const totalPrice = nights * room.price;

    // Crear reserva
    const booking = await prisma.booking.create({
      data: {
        userId: targetUserId,
        roomId,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        guests,
        totalPrice,
        status: 'confirmed'
      },
      include: {
        room: true,
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    res.status(201).json(booking);
  } catch (error) {
    console.error('Error al crear reserva:', error);
    res.status(500).json({ message: 'Error al crear reserva' });
  }
});

// Obtener reservas del usuario autenticado
router.get('/my-bookings', async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: { userId: req.user.id },
      include: { room: true, invoice: true },
      orderBy: { checkIn: 'desc' }
    });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener reservas' });
  }
});

// Obtener una reserva específica
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const userRole = req.user.role;
    const userId = req.user.id;

    let whereClause = { id };
    if (userRole !== 'admin' && userRole !== 'receptionist') {
      whereClause.userId = userId;
    }

    const booking = await prisma.booking.findFirst({
      where: whereClause,
      include: { room: true, invoice: true, user: true }
    });

    if (!booking) return res.status(404).json({ message: 'Reserva no encontrada' });
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener reserva' });
  }
});

// Cancelar reserva
router.put('/:id/cancel', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const userRole = req.user.role;
    const userId = req.user.id;

    let whereClause = { id };
    if (userRole !== 'admin' && userRole !== 'receptionist') {
      whereClause.userId = userId;
    }

    const booking = await prisma.booking.findFirst({ where: whereClause });
    if (!booking) return res.status(404).json({ message: 'Reserva no encontrada' });

    if (['checked_in', 'checked_out'].includes(booking.status)) {
      return res.status(400).json({ message: 'No se puede cancelar' });
    }

    await prisma.booking.update({
      where: { id },
      data: { status: 'cancelled' }
    });

    res.json({ message: 'Reserva cancelada' });
  } catch (error) {
    res.status(500).json({ message: 'Error al cancelar' });
  }
});

module.exports = router;