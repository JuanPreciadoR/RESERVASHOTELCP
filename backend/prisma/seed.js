//Script para llenar la base con datos iniciales
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');

async function main() {
  console.log('🌱 Sembrando base de datos...');

  // 1. ELIMINAR DATOS EXISTENTES
  console.log('Limpiando datos existentes...');
  await prisma.invoice.deleteMany({});
  await prisma.booking.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.room.deleteMany({});
  console.log('✅ Datos anteriores eliminados');

  // 2. Crear habitaciones
  const rooms = [];
  
  // Estándar (8)
  for (let i = 1; i <= 8; i++) {
    rooms.push({
      number: 100 + i,
      type: 'estandar',
      floor: i <= 4 ? 1 : 2,
      price: 150000,
      capacity: 2,
      description: 'Habitación estándar con cama doble, baño privado, TV y aire acondicionado.',
      status: 'available'
    });
  }
  
  // Suites (8)
  for (let i = 1; i <= 8; i++) {
    rooms.push({
      number: 300 + i,
      type: 'suite',
      floor: i <= 4 ? 3 : 4,
      price: 280000,
      capacity: 3,
      description: 'Suite con cama king size, sala de estar, jacuzzi y vista panorámica.',
      status: 'available'
    });
  }
  
  // Familiares (8)
  for (let i = 1; i <= 8; i++) {
    rooms.push({
      number: 500 + i,
      type: 'familiar',
      floor: 5,
      price: 200000,
      capacity: 4,
      description: 'Habitación familiar con dos camas dobles, espacio adicional y vista al jardín.',
      status: 'available'
    });
  }

  // Insertar habitaciones
  for (const room of rooms) {
    await prisma.room.create({ data: room });
  }
  console.log('✅ 24 habitaciones creadas');

  // 3. Crear usuarios
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  // Admin
  await prisma.user.create({
    data: {
      email: 'admin@hotel.com',
      password: hashedPassword,
      name: 'Admin Principal',
      role: 'admin',
      document: '123456789',
      phone: '3001234567'
    }
  });
  console.log('✅ Administrador creado');

  // Recepcionistas
  const recepPassword = await bcrypt.hash('recep123', 10);
  await prisma.user.createMany({
    data: [
      {
        email: 'recep1@hotel.com',
        password: recepPassword,
        name: 'Carlos Recepcion',
        role: 'receptionist',
        document: '987654321',
        phone: '3007654321'
      },
      {
        email: 'recep2@hotel.com',
        password: recepPassword,
        name: 'Ana Recepcion',
        role: 'receptionist',
        document: '456789123',
        phone: '3009876543'
      }
    ]
  });
  console.log('✅ 2 recepcionistas creados');

  // Huéspedes (CON BACKTICKS CORRECTOS)
  const guestPassword = await bcrypt.hash('guest123', 10);
  const guests = [];
  for (let i = 1; i <= 5; i++) {
    guests.push({
      email: `guest${i}@email.com`,
      password: guestPassword,
      name: `Huésped ${i}`,
      role: 'guest',
      document: `10000000${i}`,
      phone: `30011100${i}`
    });
  }
  await prisma.user.createMany({ data: guests });
  console.log('✅ 5 huéspedes creados');

  console.log('🌱 Seed completado exitosamente');
  console.log('📊 Resumen:');
  console.log(`- Habitaciones: ${await prisma.room.count()}`);
  console.log(`- Usuarios: ${await prisma.user.count()}`);
}

main()
  .catch(e => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });