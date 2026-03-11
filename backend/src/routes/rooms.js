const express = require('express');
const router = express.Router();

// Datos falsos de habitaciones
const rooms = [
    {
        id: 1,
        type: 'Estándar',
        number: 101,
        floor: 1,
        price: 150000,
        capacity: 2,
        description: 'Habitación estándar con cama doble'
    },
    {
        id: 2,
        type: 'Suite',
        number: 301,
        floor: 3,
        price: 280000,
        capacity: 3,
        description: 'Suite con cama king size y jacuzzi'
    }
];

// Ruta para obtener todas las habitaciones
router.get('/', (req, res) => {
    res.json(rooms);
});

// Ruta para obtener una habitación por ID
router.get('/:id', (req, res) => {
    const room = rooms.find(r => r.id === parseInt(req.params.id));
    
    if (!room) {
        return res.status(404).json({ message: 'Habitación no encontrada' });
    }
    
    res.json(room);
});

module.exports = router;