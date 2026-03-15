// reports.js - Rutas para reportes (solo admin)
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middlewares/auth');
const adminMiddleware = require('../middlewares/admin');

const router = express.Router();
const prisma = new PrismaClient();

// Todas las rutas requieren autenticación y ser admin
router.use(authMiddleware);
router.use(adminMiddleware);

// Reporte de ocupación por fechas
router.get('/occupancy', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({
                message: 'Se requieren fechas de inicio y fin (startDate, endDate)'
            });
        }

        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999); // Incluir todo el día final

        // Obtener todas las habitaciones
        const totalRooms = await prisma.room.count();

        // Obtener reservas en el período
        const bookings = await prisma.booking.findMany({
            where: {
                OR: [
                    {
                        checkIn: { lte: end },
                        checkOut: { gte: start }
                    }
                ],
                status: { not: 'cancelled' } // No incluir canceladas
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
            },
            orderBy: {
                checkIn: 'asc'
            }
        });

        // Calcular estadísticas por día
        const dailyStats = [];
        const currentDate = new Date(start);

        while (currentDate <= end) {
            const dateStr = currentDate.toISOString().split('T')[0];
            const nextDate = new Date(currentDate);
            nextDate.setDate(nextDate.getDate() + 1);

            // Reservas que ocupan habitación en esta fecha
            const occupied = bookings.filter(booking => {
                const checkIn = new Date(booking.checkIn);
                const checkOut = new Date(booking.checkOut);
                return checkIn <= nextDate && checkOut >= currentDate;
            }).length;

            dailyStats.push({
                date: dateStr,
                occupied,
                available: totalRooms - occupied,
                occupancyRate: Math.round((occupied / totalRooms) * 100) || 0
            });

            currentDate.setDate(currentDate.getDate() + 1);
        }

        // Resumen general
        const summary = {
            totalRooms,
            totalDays: dailyStats.length,
            averageOccupancy: Math.round(
                dailyStats.reduce((acc, day) => acc + day.occupancyRate, 0) / dailyStats.length
            ) || 0,
            maxOccupancy: Math.max(...dailyStats.map(d => d.occupancyRate)),
            minOccupancy: Math.min(...dailyStats.map(d => d.occupancyRate)),
            totalBookings: bookings.length
        };

        res.json({
            period: {
                start: startDate,
                end: endDate
            },
            summary,
            daily: dailyStats,
            bookings
        });
    } catch (error) {
        console.error('Error en reporte de ocupación:', error);
        res.status(500).json({ message: 'Error al generar reporte' });
    }
});

// Reporte de ingresos por período
router.get('/revenue', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({
                message: 'Se requieren fechas de inicio y fin (startDate, endDate)'
            });
        }

        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        // Obtener facturas en el período
        const invoices = await prisma.invoice.findMany({
            where: {
                issueDate: {
                    gte: start,
                    lte: end
                }
            },
            include: {
                booking: {
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
                }
            },
            orderBy: {
                issueDate: 'asc'
            }
        });

        // Calcular totales
        const totalRevenue = invoices.reduce((sum, inv) => sum + inv.total, 0);
        const totalTax = invoices.reduce((sum, inv) => sum + inv.tax, 0);
        const totalSubtotal = invoices.reduce((sum, inv) => sum + inv.subtotal, 0);

        // Agrupar por día
        const dailyRevenue = [];
        const currentDate = new Date(start);

        while (currentDate <= end) {
            const dateStr = currentDate.toISOString().split('T')[0];
            const nextDate = new Date(currentDate);
            nextDate.setDate(nextDate.getDate() + 1);

            const dayInvoices = invoices.filter(inv => {
                const invDate = new Date(inv.issueDate);
                return invDate >= currentDate && invDate < nextDate;
            });

            const dayTotal = dayInvoices.reduce((sum, inv) => sum + inv.total, 0);

            if (dayTotal > 0) {
                dailyRevenue.push({
                    date: dateStr,
                    total: dayTotal,
                    count: dayInvoices.length
                });
            }

            currentDate.setDate(currentDate.getDate() + 1);
        }

        res.json({
            period: {
                start: startDate,
                end: endDate
            },
            summary: {
                totalInvoices: invoices.length,
                totalRevenue,
                totalSubtotal,
                totalTax,
                averagePerDay: invoices.length > 0 ? Math.round(totalRevenue / invoices.length) : 0
            },
            daily: dailyRevenue,
            invoices
        });
    } catch (error) {
        console.error('Error en reporte de ingresos:', error);
        res.status(500).json({ message: 'Error al generar reporte' });
    }
});

module.exports = router;
