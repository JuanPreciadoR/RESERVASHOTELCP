// admin.js - Servicio para funciones de administrador y recepcionista
import axios from 'axios';
import { getToken } from './auth';

const ADMIN_URL = 'http://localhost:3000/api/admin';
const RECEPTIONIST_URL = 'http://localhost:3000/api/receptionist';

// Configurar headers con token
const authHeaders = () => {
    const token = getToken();
    return {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };
};

// Obtener todas las reservas (admin o recepcionista según el rol)
export const getAllBookings = async (filters = {}) => {
    try {
        const queryParams = new URLSearchParams();

        if (filters.status) queryParams.append('status', filters.status);
        if (filters.startDate) queryParams.append('startDate', filters.startDate);
        if (filters.endDate) queryParams.append('endDate', filters.endDate);
        if (filters.limit) queryParams.append('limit', filters.limit);

        const queryString = queryParams.toString();
        // Usar la URL de recepcionista (más permisiva)
        const url = queryString ? `${RECEPTIONIST_URL}/bookings?${queryString}` : `${RECEPTIONIST_URL}/bookings`;

        const response = await axios.get(url, authHeaders());
        return response.data;
    } catch (error) {
        console.error('Error al obtener reservas:', error);
        throw error.response?.data || { message: 'Error al obtener reservas' };
    }
};

// Buscar huéspedes (solo recepcionista)
export const searchGuests = async (query) => {
    try {
        const response = await axios.get(`${RECEPTIONIST_URL}/guests/search?query=${query}`, authHeaders());
        return response.data;
    } catch (error) {
        console.error('Error al buscar huéspedes:', error);
        throw error.response?.data || { message: 'Error al buscar huéspedes' };
    }
};

// Obtener dashboard (solo admin)
export const getDashboard = async () => {
    try {
        const response = await axios.get(`${ADMIN_URL}/dashboard`, authHeaders());
        return response.data;
    } catch (error) {
        console.error('Error al obtener dashboard:', error);
        throw error.response?.data || { message: 'Error al obtener dashboard' };
    }
};

// Obtener todos los usuarios (solo admin)
export const getAllUsers = async () => {
    try {
        const response = await axios.get(`${ADMIN_URL}/users`, authHeaders());
        return response.data;
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        throw error.response?.data || { message: 'Error al obtener usuarios' };
    }
};

// Actualizar rol de usuario (solo admin)
export const updateUserRole = async (userId, role) => {
    try {
        const response = await axios.put(`${ADMIN_URL}/users/${userId}/role`, { role }, authHeaders());
        return response.data;
    } catch (error) {
        console.error('Error al actualizar rol:', error);
        throw error.response?.data || { message: 'Error al actualizar rol' };
    }
};

// Obtener reporte de ocupación (solo admin)
export const getOccupancyReport = async (startDate, endDate) => {
    try {
        const response = await axios.get(
            `${ADMIN_URL}/reports/occupancy?startDate=${startDate}&endDate=${endDate}`,
            authHeaders()
        );
        return response.data;
    } catch (error) {
        console.error('Error al obtener reporte:', error);
        throw error.response?.data || { message: 'Error al obtener reporte' };
    }
};