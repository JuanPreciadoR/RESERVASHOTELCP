const express = require('express');
const cors = require('cors');
const app = express();

// Importar rutas
const roomsRoutes = require('./routes/rooms');
const authRoutes = require('./routes/auth');
const bookingsRoutes = require('./routes/bookings');
const adminRoutes = require('./routes/admin'); // NUEVA

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/rooms', roomsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/admin', adminRoutes); // NUEVA

app.get('/', (req, res) => {
    res.send('API del Hotel Casa Preciado - version 1.0');
});

module.exports = app;