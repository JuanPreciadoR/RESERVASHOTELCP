const express = require('express');
const cors = require('cors');
const app = express();

console.log('🚀 Iniciando servidor...');

// Importar rutas
const roomsRoutes = require('./routes/rooms');
const authRoutes = require('./routes/auth');
const bookingsRoutes = require('./routes/bookings');
const adminRoutes = require('./routes/admin');
const receptionistRoutes = require('./routes/receptionist');
const reportsRoutes = require('./routes/reports');
const calendarRoutes = require('./routes/calendar');
const adminRoomsRoutes = require('./routes/admin-rooms'); 

console.log('✅ Rutas importadas:');
console.log('   - /api/rooms');
console.log('   - /api/auth');
console.log('   - /api/bookings');
console.log('   - /api/admin');
console.log('   - /api/receptionist');
console.log('   - /api/reports');
console.log('   - /api/calendar');
console.log('   - /api/admin/rooms');

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/rooms', roomsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/receptionist', receptionistRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/admin/rooms', adminRoomsRoutes); 

app.get('/', (req, res) => {
    res.send('API del Hotel Casa Preciado - version 1.0');
});

console.log('✅ Servidor configurado correctamente');

module.exports = app;