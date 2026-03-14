// auth.js - Rutas de autenticación
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middlewares/auth'); // Importar middleware

const router = express.Router();
const prisma = new PrismaClient();

// Registro
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, document, phone } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        message: 'Email y contraseña son obligatorios' 
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ 
        message: 'El email ya está registrado' 
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || 'Usuario',
        document: document || null,
        phone: phone || null,
        role: 'guest'
      }
    });

    const { password: _, ...userWithoutPassword } = user;
    res.status(201).json(userWithoutPassword);

  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ 
      message: 'Error al registrar usuario' 
    });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        message: 'Email y contraseña son obligatorios' 
      });
    }

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({ 
        message: 'Credenciales inválidas' 
      });
    }

    const passwordValid = await bcrypt.compare(password, user.password);

    if (!passwordValid) {
      return res.status(401).json({ 
        message: 'Credenciales inválidas' 
      });
    }

    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role 
      }, 
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password: _, ...userWithoutPassword } = user;
    
    res.json({
      message: 'Login exitoso',
      token,
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ 
      message: 'Error al iniciar sesión' 
    });
  }
});

// Ruta protegida: Obtener perfil del usuario autenticado (NUEVO)
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    // req.user viene del middleware (tiene id, email, role)
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        document: true,
        phone: true,
        createdAt: true
        // Excluimos password explícitamente
      }
    });

    res.json(user);
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({ 
      message: 'Error al obtener perfil' 
    });
  }
});

module.exports = router;