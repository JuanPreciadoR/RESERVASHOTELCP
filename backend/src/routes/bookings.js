// bookings.js - Rutas para gestionar reservas
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middlewares/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Todas las rutas de reservas requieren autenticacion
router.use(authMiddleware);

// Crear una nueva reserva
router.post('/', async (req, res) => {
    try {
        const { roomId, checkIn, checkOut, guests } = req.body;
        const userId = req.user.id;

        if (!roomId || !checkIn || !checkOut || !guests) {
            return res.status(400).json({ message: 'Faltan datos obligatorios' });
        }

        const room = await prisma.room.findUnique({
            where: { id: roomId }
        });

        if (!room) {
            return res.status(404).json({ message: 'Habitacion no encontrada' });
        }

        if (guests > room.capacity) {
            return res.status(400).json({
                message: `Capacidad maxima: ${room.capacity} personas`
            });
        }

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
            return res.status(400).json({
                message: 'Habitacion no disponible en esas fechas'
            });
        }

        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);
        const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
        const totalPrice = nights * room.price;

        const booking = await prisma.booking.create({
            data: {
                userId,
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
        res.status(500).json({ message: 'Error al crear la reserva' });
    }
});

// CHECK-IN
router.put('/:id/checkin', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const userId = req.user.id;

        const booking = await prisma.booking.findFirst({
            where: {
                id,
                userId
            },
            include: { room: true }
        });

        if (!booking) {
            return res.status(404).json({ message: 'Reserva no encontrada' });
        }

        if (booking.status !== 'confirmed') {
            return res.status(400).json({
                message: 'Solo se puede hacer check-in a reservas confirmadas'
            });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const checkInDate = new Date(booking.checkIn);
        checkInDate.setHours(0, 0, 0, 0);

        if (checkInDate > today) {
            return res.status(400).json({
                message: 'Aun no es la fecha de check-in'
            });
        }

        const [updatedBooking, updatedRoom] = await prisma.$transaction([
            prisma.booking.update({
                where: { id },
                data: { status: 'checked_in' }
            }),
            prisma.room.update({
                where: { id: booking.roomId },
                data: { status: 'occupied' }
            })
        ]);

        res.json({
            message: 'Check-in realizado exitosamente',
            booking: updatedBooking
        });
    } catch (error) {
        console.error('Error en check-in:', error);
        res.status(500).json({ message: 'Error al realizar check-in' });
    }
});

// CHECK-OUT
router.put('/:id/checkout', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const userId = req.user.id;

        const booking = await prisma.booking.findFirst({
            where: {
                id,
                userId
            },
            include: { room: true }
        });

        if (!booking) {
            return res.status(404).json({ message: 'Reserva no encontrada' });
        }

        if (booking.status !== 'checked_in') {
            return res.status(400).json({
                message: 'Solo se puede hacer check-out a reservas con check-in realizado'
            });
        }

        const subtotal = booking.totalPrice;
        const tax = Math.round(subtotal * 0.19);
        const total = subtotal + tax;

        const [updatedBooking, updatedRoom, invoice] = await prisma.$transaction([
            prisma.booking.update({
                where: { id },
                data: { status: 'checked_out' }
            }),
            prisma.room.update({
                where: { id: booking.roomId },
                data: { status: 'available' }
            }),
            prisma.invoice.create({
                data: {
                    bookingId: id,
                    subtotal,
                    tax,
                    total,
                    issueDate: new Date()
                }
            })
        ]);

        res.json({
            message: 'Check-out realizado exitosamente',
            invoice: {
                id: invoice.id,
                subtotal,
                tax,
                total,
                issueDate: invoice.issueDate
            }
        });
    } catch (error) {
        console.error('Error en check-out:', error);
        res.status(500).json({ message: 'Error al realizar check-out' });
    }
});

// Obtener reservas del usuario
router.get('/my-bookings', async (req, res) => {
    try {
        const bookings = await prisma.booking.findMany({
            where: { userId: req.user.id },
            include: {
                room: true,
                invoice: true
            },
            orderBy: { checkIn: 'desc' }
        });
        res.json(bookings);
    } catch (error) {
        console.error('Error al obtener reservas:', error);
        res.status(500).json({ message: 'Error al obtener reservas' });
    }
});

// Obtener una reserva especifica
router.get('/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const booking = await prisma.booking.findFirst({
            where: { id, userId: req.user.id },
            include: {
                room: true,
                invoice: true
            }
        });

        if (!booking) {
            return res.status(404).json({ message: 'Reserva no encontrada' });
        }

        res.json(booking);
    } catch (error) {
        console.error('Error al obtener reserva:', error);
        res.status(500).json({ message: 'Error al obtener reserva' });
    }
});

// Cancelar una reserva
router.put('/:id/cancel', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const booking = await prisma.booking.findFirst({
            where: { id, userId: req.user.id }
        });

        if (!booking) {
            return res.status(404).json({ message: 'Reserva no encontrada' });
        }

        if (booking.status === 'cancelled') {
            return res.status(400).json({ message: 'La reserva ya esta cancelada' });
        }

        if (['checked_in', 'checked_out'].includes(booking.status)) {
            return res.status(400).json({
                message: 'No se puede cancelar una reserva ya iniciada o finalizada'
            });
        }

        const updatedBooking = await prisma.booking.update({
            where: { id },
            data: { status: 'cancelled' }
        });

        res.json({
            message: 'Reserva cancelada exitosamente',
            booking: updatedBooking
        });
    } catch (error) {
        console.error('Error al cancelar reserva:', error);
        res.status(500).json({ message: 'Error al cancelar la reserva' });
    }
});

module.exports = router;