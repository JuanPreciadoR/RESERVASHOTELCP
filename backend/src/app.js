const express = require('express');
const cors = require('cors');
const app = express();

// Importar rutas
const roomsRoutes = require('./routes/rooms');

// Middlewares
app.use(cors()); // <-- ESTA LÍNEA ES LA SOLUCIÓN
app.use(express.json());

// Rutas
app.use('/api/rooms', roomsRoutes);

app.get('/', (req, res) => {
    res.send('API del Hotel Casa Preciado - version 1.0');
});

module.exports = app;