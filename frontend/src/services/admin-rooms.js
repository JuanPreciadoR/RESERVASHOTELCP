// admin-rooms.js - Servicio para administración de habitaciones
import axios from 'axios';
import { getToken } from './auth';

const API_URL = 'http://localhost:3000/api/admin/rooms';

// Configurar headers con token
const authHeaders = () => ({
  headers: {
    Authorization: `Bearer ${getToken()}`  
  }
});

// Obtener todas las habitaciones (admin)
export const getAllRoomsAdmin = async () => {
  try {
    const response = await axios.get(API_URL, authHeaders());
    return response.data;
  } catch (error) {
    console.error('Error al obtener habitaciones:', error);
    throw error.response?.data || { message: 'Error al obtener habitaciones' };
  }
};

// Obtener una habitación específica
export const getRoomByIdAdmin = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`, authHeaders());
    return response.data;
  } catch (error) {
    console.error('Error al obtener habitación:', error);
    throw error.response?.data || { message: 'Error al obtener habitación' };
  }
};

// Actualizar habitación
export const updateRoom = async (id, data) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, data, authHeaders());
    return response.data;
  } catch (error) {
    console.error('Error al actualizar habitación:', error);
    throw error.response?.data || { message: 'Error al actualizar habitación' };
  }
};

// Actualizar múltiples habitaciones del mismo tipo
export const bulkUpdateRoomsByType = async (type, data) => {
  try {
    const response = await axios.put(`${API_URL}/{type}/bulk-update`, data, authHeaders());
    return response.data;
  } catch (error) {
    console.error('Error en actualización masiva:', error);
    throw error.response?.data || { message: 'Error en actualización masiva' };
  }
};

// Obtener estadísticas de habitaciones
export const getRoomStats = async () => {
  try {
    const response = await axios.get(`${API_URL}/stats/summary`, authHeaders());
    return response.data;
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    throw error.response?.data || { message: 'Error al obtener estadísticas' };
  }
};