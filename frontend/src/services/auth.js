// auth.js - Servicio para autenticación con el backend
import axios from 'axios';

const API_URL = 'http://localhost:3000/api/auth';

// Login
export const login = async (credentials) => {
  try {
    const response = await axios.post(`${API_URL}/login`, credentials);
    return response.data;
  } catch (error) {
    console.error('Error en login:', error);
    throw error.response?.data || { message: 'Error al conectar con el servidor' };
  }
};

// Registro
export const register = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/register`, userData);
    return response.data;
  } catch (error) {
    console.error('Error en registro:', error);
    throw error.response?.data || { message: 'Error al conectar con el servidor' };
  }
};

// Obtener perfil (requiere token)
export const getProfile = async (token) => {
  try {
    const response = await axios.get(`${API_URL}/profile`, {
      headers: {
        Authorization: Bearer 
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    throw error.response?.data || { message: 'Error al conectar con el servidor' };
  }
};

// Guardar token en localStorage
export const setToken = (token) => {
  localStorage.setItem('token', token);
};

// Obtener token de localStorage
export const getToken = () => {
  return localStorage.getItem('token');
};

// Eliminar token (logout)
export const removeToken = () => {
  localStorage.removeItem('token');
};

// Verificar si el usuario está autenticado
export const isAuthenticated = () => {
  return !!getToken();
};