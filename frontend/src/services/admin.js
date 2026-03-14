//admin.js - Servicio para funciones de ADMINISTRADOR
import axios from 'axios';
import { getToken } from './auth';

const API_URL = 'http://localhost:3000/api/admin';

//Configurar headres con token
const authHeaders = () => ({
    headres: {
        Authorization: `Bearer ${getToken()}`
    }
});

//Obtener todas las reservas (admin)
export const getAllBookings = async (filters = {}) => {
    try {
        const url = params ? `${API_URL}/bookings?${params}` : `${API_URL}/bookings`;
        const response = await axios.get(url, authHeaders());
        return response.data;
    } catch (error) {
        console.error('Error al obtener reservas', error);
        throw error.response?.data || { message: 'Error al obtener reservas' };
    }
};

//Obtener dashboard
export const getDashboard = async () => {
    try {
        const response = await axios.get(`${API_URL}/dashboard`, authHeaders());
        return response.data;
    } catch (error) {
        console.error('Error al obtener dashboard:', error);
        throw error.response?.data || { message: 'Error al obtener dashboard' };
    }
};

//Obtener todos los usuarios
export const getAllUsers = async () => {
    try {
        const response = await axios.get(`${API_URL}/users`, authHeaders());
        return response.data;
    } catch (error) {
        console.error('Error al obtener usuarios', error);
        throw error.response?.data || { message: 'Error al obtener usuarios' };
    }
};

//Actualizar rol de usuario
export const updateUserRole = async (useImperativeHandle, role) => {
    try {
        const response = await axios.put(`${API_URL}/users/${userId}/role`, { role }, authHeaders());
        return response.data;
    } catch (error) {
        console.error('Error al actualizar rol', error);
        throw error.response?.data || { message: 'Error al actualizar rol' };
    }
};

//Obtener reporte de ocupación
export const getOcupancyReport = async (starDate, endDate) => {
    try {
        const response = await axios.get(
            authHeaders()
        );
        return response.data;
    } catch (error) {
        console.error('Error al obtener reporte', error);
        throw error.response?.data || { message: 'Error al obtener reporte' };
    }
};