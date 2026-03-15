const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middlewares/auth');
const adminMiddleware = require('../middlewares/admin');

const router = express.Router();
const prisma = new PrismaClient();

// Todas las rutas requieren autenticación y ser admin
router.use(authMiddleware);
router.use(adminMiddleware);

// Obtener todas las habitaciones (incluye estado)
router.get('/', async (req, res) => {
  try {
    const rooms = await prisma.room.findMany({
      orderBy: {
        number: 'asc'
      }
    });
    res.json(rooms);
  } catch (error) {
    console.error('Error al obtener habitaciones:', error);
    res.status(500).json({ message: 'Error al obtener habitaciones' });
  }
});

// Obtener una habitación específica
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const room = await prisma.room.findUnique({
      where: { id }
    });
    
    if (!room) {
      return res.status(404).json({ message: 'Habitación no encontrada' });
    }
    
    res.json(room);
  } catch (error) {
    console.error('Error al obtener habitación:', error);
    res.status(500).json({ message: 'Error al obtener habitación' });
  }
});

// Actualizar habitación
router.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { price, description, status } = req.body;
    
    // Validar que la habitación existe
    const existingRoom = await prisma.room.findUnique({
      where: { id }
    });
    
    if (!existingRoom) {
      return res.status(404).json({ message: 'Habitación no encontrada' });
    }
    
    // Validar estado permitido
    const allowedStatuses = ['available', 'occupied', 'maintenance', 'cleaning'];
    if (status && !allowedStatuses.includes(status)) {
      return res.status(400).json({ message: 'Estado no válido' });
    }
    
    // Actualizar solo los campos proporcionados
    const updateData = {};
    if (price !== undefined) updateData.price = parseFloat(price);
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;
    
    const updatedRoom = await prisma.room.update({
      where: { id },
      data: updateData
    });
    
    res.json(updatedRoom);
  } catch (error) {
    console.error('Error al actualizar habitación:', error);
    res.status(500).json({ message: 'Error al actualizar habitación' });
  }
});

// Actualizar múltiples habitaciones del mismo tipo (ej: subir precios de todas las suites)
router.put('/type/:type/bulk-update', async (req, res) => {
  try {
    const { type } = req.params;
    const { priceIncrease, newPrice, status } = req.body;
    
    // Construir la actualización
    const updateData = {};
    
    if (priceIncrease) {
      // Aumentar precio en porcentaje
      const rooms = await prisma.room.findMany({ where: { type } });
      for (const room of rooms) {
        const newPrice = room.price * (1 + priceIncrease / 100);
        await prisma.room.update({
          where: { id: room.id },
          data: { price: Math.round(newPrice) }
        });
      }
      return res.json({ message: `Precio actualizado para todas las habitaciones tipo ${type}` });
    }
    
    if (newPrice !== undefined) {
      updateData.price = parseFloat(newPrice);
    }
    
    if (status) {
      updateData.status = status;
    }
    
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: 'No hay datos para actualizar' });
    }
    
    const result = await prisma.room.updateMany({
      where: { type },
      data: updateData
    });
    
    res.json({ 
      message: `${result.count} habitaciones actualizadas`,
      count: result.count
    });
  } catch (error) {
    console.error('Error en actualización masiva:', error);
    res.status(500).json({ message: 'Error en actualización masiva' });
  }
});

// Obtener estadísticas de habitaciones
router.get('/stats/summary', async (req, res) => {
  try {
    const rooms = await prisma.room.findMany();
    
    const stats = {
      total: rooms.length,
      byType: {
        estandar: rooms.filter(r => r.type === 'estandar').length,
        suite: rooms.filter(r => r.type === 'suite').length,
        familiar: rooms.filter(r => r.type === 'familiar').length
      },
      byStatus: {
        available: rooms.filter(r => r.status === 'available').length,
        occupied: rooms.filter(r => r.status === 'occupied').length,
        maintenance: rooms.filter(r => r.status === 'maintenance').length,
        cleaning: rooms.filter(r => r.status === 'cleaning').length
      },
      priceRange: {
        min: Math.min(...rooms.map(r => r.price)),
        max: Math.max(...rooms.map(r => r.price)),
        avg: Math.round(rooms.reduce((acc, r) => acc + r.price, 0) / rooms.length)
      }
    };
    
    res.json(stats);
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ message: 'Error al obtener estadísticas' });
  }
});

module.exports = router;