const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient();

// Ruta para obtener todas las habitaciones
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

// Ruta para obtener una habitación por ID
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

module.exports = router;