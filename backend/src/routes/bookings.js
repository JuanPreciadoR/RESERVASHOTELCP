//bookings.js - Rutas para gestionar reservas
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middlewares/auth');

const router = express.Router();
const prisma = new PrismaClient();

//Todas las rutas de reservas requiren autenticación
router.use(authMiddleware);

//Crear una nueva reserva
router.post('/', async (req, res) => {
    try {
        const { roomId, checkIn, checkOut, guests } = req.body;
        const userId = req.user.id; //Viene del token

        // 1. Validar datos obligatorios
        if (!roomId || !checkIn || !checkOut || !guests) {
            return res.status(400).json({
                message: 'Faltan datos obligatorios'
            });
        }

        // 2. Verificar que la habitación existe
        const room = await prisma.room.findUnique({
            where: { id: roomId }
        });

        if (!room) {
            return res.status(404).json({
                message: 'Habitación no encontrada'
            });
        }

        // 3. Verificar que la capacidad sea suficiente
        if (guests > room.capacity) {
            return res.status(400).json({
                message: `La habitación solo tiene capacidad para ${room.capacity} personas`
            });
        }

        // 4. Verificar disponibilidad (que no haya reservas en esas fechas)
        const existingBooking = await prisma.booking.findFirst({
            where: {
                roomId,
                status: { not: 'cancelled' }, // Ignorar reservas canceladas
                AND: [
                    { checkIn: { lt: new Date(checkOut) } },
                    { checkOut: { gt: new Date(checkIn) } }
                ]
            }
        });

        if (existingBooking) {
            return res.status(400).json({
                message: 'La habitación no está disponible en esas fechas'
            });
        }

        // 5. Calcular precio total
        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);
        const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
        const totalPrice = nights * room.price;

        // 6. Crear la reserva
        const booking = await prisma.booking.create({
            data: {
                userId,
                roomId,
                checkIn: checkInDate,
                checkOut: checkOutDate,
                guests,
                totalPrice,
                status: 'pending' // Pendiente de confirmación
            },
            include: {
                room: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });

        res.status(201).json(booking);

    } catch (error) {
        console.error('Error al crear reserva:', error);
        res.status(500).json({
            message: 'Error al crear la reserva'
        });
    }
});

// Obtener reservas del usuario autenticado
router.get('/my-bookings', async (req, res) => {
    try {
        const bookings = await prisma.booking.findMany({
            where: { userId: req.user.id },
            include: {
                room: true
            },
            orderBy: {
                checkIn: 'desc'
            }
        });

        res.json(bookings);
    } catch (error) {
        console.error('Error al obtener reservas:', error);
        res.status(500).json({
            message: 'Error al obtener reservas'
        });
    }
});

// Obtener una reserva específica
router.get('/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);

        const booking = await prisma.booking.findFirst({
            where: {
                id,
                userId: req.user.id // Solo el dueño puede verla
            },
            include: {
                room: true,
                invoice: true
            }
        });

        if (!booking) {
            return res.status(404).json({
                message: 'Reserva no encontrada'
            });
        }

        res.json(booking);
    } catch (error) {
        console.error('Error al obtener reserva:', error);
        res.status(500).json({
            message: 'Error al obtener reserva'
        });
    }
});

// Cancelar una reserva
router.put('/:id/cancel', async (req, res) => {
    try {
        const id = parseInt(req.params.id);

        // Buscar la reserva
        const booking = await prisma.booking.findFirst({
            where: {
                id,
                userId: req.user.id // Solo el dueño puede cancelarla
            }
        });

        if (!booking) {
            return res.status(404).json({
                message: 'Reserva no encontrada'
            });
        }

        // Verificar que no esté ya cancelada o finalizada
        if (booking.status === 'cancelled') {
            return res.status(400).json({
                message: 'La reserva ya está cancelada'
            });
        }

        if (booking.status === 'checked_out') {
            return res.status(400).json({
                message: 'No se puede cancelar una reserva ya finalizada'
            });
        }

        // Actualizar estado a cancelado
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
        res.status(500).json({
            message: 'Error al cancelar la reserva'
        });
    }
});

module.exports = router;
