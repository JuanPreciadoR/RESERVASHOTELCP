// bookings.js - Servicio para reservas
import axios from 'axios';
import { getToken } from './auth';

const API_URL = 'http://localhost:3000/api/bookings';

// Configurar headers con token
const authHeaders = () => {
  const token = getToken();
  return {
    headers: {
      Authorization: `Bearer ${token}`  // ← CORREGIDO: con backticks
    }
  };
};

// Crear una nueva reserva
export const createBooking = async (bookingData) => {
  try {
    const response = await axios.post(API_URL, bookingData, authHeaders());
    return response.data;
  } catch (error) {
    console.error('Error al crear reserva:', error);
    throw error.response?.data || { message: 'Error al crear la reserva' };
  }
};

// Obtener reservas del usuario
export const getMyBookings = async () => {
  try {
    const response = await axios.get(`${API_URL}/my-bookings`, authHeaders());
    return response.data;
  } catch (error) {
    console.error('Error al obtener reservas:', error);
    throw error.response?.data || { message: 'Error al obtener reservas' };
  }
};

// Obtener una reserva por ID
export const getBookingById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`, authHeaders());
    return response.data;
  } catch (error) {
    console.error('Error al obtener reserva:', error);
    throw error.response?.data || { message: 'Error al obtener la reserva' };
  }
};

// Cancelar una reserva
export const cancelBooking = async (id) => {
  try {
    const response = await axios.put(`${API_URL}/${id}/cancel`, {}, authHeaders());
    return response.data;
  } catch (error) {
    console.error('Error al cancelar reserva:', error);
    throw error.response?.data || { message: 'Error al cancelar la reserva' };
  }
};

// Check-in
export const checkIn = async (id) => {
  try {
    const response = await axios.put(`${API_URL}/${id}/checkin`, {}, authHeaders());
    return response.data;
  } catch (error) {
    console.error('Error en check-in:', error);
    throw error.response?.data || { message: 'Error al realizar check-in' };
  }
};

// Check-out
export const checkOut = async (id) => {
  try {
    const response = await axios.put(`${API_URL}/${id}/checkout`, {}, authHeaders());
    return response.data;
  } catch (error) {
    console.error('Error en check-out:', error);
    throw error.response?.data || { message: 'Error al realizar check-out' };
  }
};