import axios from 'axios';

// La URL de nuestro backend (Express)
const API_URL = 'http://localhost:3000/api';

export const getRooms = async () => {
    try {
        const response = await axios.get(`${API_URL}/rooms`);
        return response.data;
    } catch (error) {
        console.error('Error al obtener habitaciones:', error);
        return [];
    }
};

// Obtener una habitación por ID
export const getRoomById = async (id) => {
    try {
        const response = await axios.get(`${API_URL}/rooms/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error al obtener habitación:', error);
        throw error;
    }
};
