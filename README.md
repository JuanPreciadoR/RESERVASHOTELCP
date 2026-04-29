# 🏨 ReservaHotelCP - Sistema de Gestión de Reservas

Sistema completo de gestión de reservas de hotel con autenticación y roles de usuario.

## 📋 Requisitos Previos

| Requisito | Versión mínima |
|-----------|----------------|
| Node.js | 18.x |
| PostgreSQL | 14.x |
| npm | 9.x |

---

## 🚀 Instalación Paso a Paso

### 1. Clonar el repositorio
```bash
git clone <URL_DEL_REPOSITORIO>
cd RESERVASHOTELCP
```

### 2. Instalar dependencias del Backend
```bash
cd backend
npm install
```

### 3. Instalar dependencias del Frontend
```bash
cd ../frontend
npm install
```

---

## ⚙️ Configuración de Base de Datos

### Paso 1: Iniciar PostgreSQL
Asegúrate de que el servicio de PostgreSQL esté corriendo:

**Windows:**
```bash
net start postgresql-x64-18
```

### Paso 2: Crear la base de datos
```bash
psql -U postgres -c "CREATE DATABASE reservashotel;"
```

### Paso 3: Configurar variables de entorno

Crea el archivo `backend/.env`:

```env
DATABASE_URL="postgresql://postgres:TU_PASSWORD@localhost:5432/reservashotel?schema=public"
JWT_SECRET="una_clave_secreta_segura"
```

> **Importante**: Reemplaza `TU_PASSWORD` con la contraseña de tu usuario postgres.

### Paso 4: Ejecutar migraciones
```bash
cd backend
npx prisma migrate dev --name init
```

### Paso 5: Poblar base de datos (opcional)
```bash
npm run seed
```

---

## ▶️ Ejecución del Proyecto

### Terminal 1 - Backend (Puerto 3000)
```bash
cd backend
npm start
```

### Terminal 2 - Frontend (Puerto 5173)
```bash
cd frontend
npm run dev
```

### Abrir en el navegador
Ve a: **http://localhost:5173**

---

## 👤 Usuarios de Prueba (del Seed)

| Rol | Email | Contraseña |
|-----|-------|------------|
| Admin | admin@hotel.com | admin123 |
| Recepcionista | recep1@hotel.com | recep123 |
| Huésped | guest1@hotel.com | guest123 |

---

## 📁 Estructura del Proyecto

```
RESERVASHOTELCP/
├── README.md
├── DIAGRAMA-BD.md
├── .gitignore
├── backend/
│   ├── .env
│   ├── package.json
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── seed.js
│   │   └── migrations/
│   └── src/
│       ├── app.js
│       ├── server.js
│       ├── middlewares/
│       └── routes/
└── frontend/
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── App.jsx
        ├── main.jsx
        ├── components/
        ├── contexts/
        ├── pages/
        └── services/
```

---

## 🔌 Endpoints de la API

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Registrar usuario | No |
| POST | `/api/auth/login` | Iniciar sesión | No |
| GET | `/api/rooms` | Listar habitaciones | No |
| POST | `/api/bookings` | Crear reserva | Sí |
| GET | `/api/bookings/my` | Mis reservas | Sí |
| GET | `/api/admin/users` | Listar usuarios | Admin |
| GET | `/api/reports/occupancy` | Reporte ocupación | Admin |

---

## 🚀 Despliegue

### Frontend (Vercel)
1. Crea proyecto en [Vercel](https://vercel.com)
2. Conecta tu repositorio
3. Framework: **Vite**
4. Build: `npm run build`
5. Output: `dist`

### Backend (Render/Railway)
El backend no funciona en Vercel. Usa [Render](https://render.com) o [Railway](https://railway.app).

### Base de datos externa
Usa [Neon](https://neon.tech) o [Supabase](https://supabase.com).

---

## 🛠️ Comandos Útiles

```bash
# Desarrollo
cd backend && npm start      # Puerto 3000
cd frontend && npm run dev    # Puerto 5173

# Base de datos
cd backend && npx prisma migrate dev --name init
cd backend && npm run seed

# Build producción
cd frontend && npm run build
```

---

## ⚠️ Solución de Problemas

### "Cannot find module 'express'"
```bash
cd backend && npm install
```

### "Cannot connect to database"
1. Verifica que PostgreSQL esté corriendo
2. Verifica la contraseña en `backend/.env`
3. Verifica que la base de datos exista:
```bash
psql -U postgres -c "\l"
```

### "Port already in use"
```bash
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

---

## 📄 Licencia

ISC
psql -U postgres -c "CREATE DATABASE reservashotel;"
```

3. Crea el archivo `.env` en `backend/`:
```env
DATABASE_URL="postgresql://postgres:TU_PASSWORD@localhost:5432/reservashotel?schema=public"
JWT_SECRET="tu_secret_key_aqui"
```

### 4. Ejecutar migraciones y seed
```bash
cd backend
npx prisma migrate dev --name init
npm run seed
```

---

## ▶️ Ejecución

### Desarrollo (local)

**Terminal 1 - Backend:**
```bash
cd backend
npm start
# Servidor corriendo en http://localhost:3000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
# App corriendo en http://localhost:5173
```

---

## 👤 Usuarios de prueba (seed)

| Rol | Email | Contraseña |
|-----|-------|------------|
| Administrador | admin@hotel.com | admin123 |
| Recepcionista | recep1@hotel.com | recep123 |
| Recepcionista | recep2@hotel.com | recep123 |
| Huésped | guest1@hotel.com | guest123 |

---

## 📁 Estructura del proyecto

```
RESERVASHOTELCP/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma    # Definición de modelos
│   │   ├── seed.js          # Datos iniciales
│   │   └── migrations/      # Migraciones de BD
│   ├── src/
│   │   ├── app.js          # Configuración Express
│   │   ├── server.js       # Punto de entrada
│   │   ├── middlewares/    # Middlewares auth
│   │   └── routes/        # Endpoints API
│   └── .env                # Variables de entorno
│
├── frontend/
│   ├── src/
│   │   ├── components/    # Componentes reutilizables
│   │   ├── contexts/      # Contextos React
│   │   ├── pages/         # Páginas del app
│   │   ├── services/     # Servicios API
│   │   └── App.jsx       # Componente principal
│   └── vite.config.js    # Configuración Vite
│
└── README.md
```

---

## 🔑 Variables de entorno

### Backend (.env)
```env
DATABASE_URL=postgresql://user:password@host:5432/dbname?schema=public
JWT_SECRET=your_secret_key_here
```

### Frontend
El frontend usa Axios apuntando a `http://localhost:3000/api`. Para producción, actualizar `frontend/src/services/api.js`.

---

## 📝 API Endpoints

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Registrar usuario | No |
| POST | `/api/auth/login` | Iniciar sesión | No |
| GET | `/api/rooms` | Listar habitaciones | No |
| GET | `/api/rooms/:id` | Ver habitación | No |
| POST | `/api/bookings` | Crear reserva | Sí |
| GET | `/api/bookings/my` | Mis reservas | Sí |
| GET | `/api/admin/users` | Listar usuarios | Admin |
| POST | `/api/admin/rooms` | Crear habitación | Admin |

---

## 🚀 Despliegue en Vercel

### Frontend (Vercel)
1. Conectar repositorio a Vercel
2. Build command: `npm run build`
3. Output directory: `dist`
4. Variables: No requiere

### Backend (Vercel + PostgreSQL)
1. Crear proyecto en Vercel
2. Agregar PostgreSQL (Vercel Postgres o Neon)
3. Actualizar `DATABASE_URL` en variables de entorno
4. Desplegar como Serverless Functions o usar Render/Railway

---

## 📄 Licencia

ISC