//Importar Express y crear app
const express = require('express');
const app = express();

//Importar Rutas
const roomsRoutes = require('./routes/rooms');

//Middleware para parsear JSON (Importante para recibir datos)
app.use(express.json());

//Rutas
app.use('/api/rooms', roomsRoutes);

//Ruta de prueba
app.get('/', (req, res) => {
    res.send('API del Hotel Casa Preciado - version 1.0');
})

module.exports = app;
