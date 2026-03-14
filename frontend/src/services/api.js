//SERVICIO PARA LLAMAR AL BACKEND
import axios from 'axios';


const API_URL = 'http://localhost:3000/api';

export const getRooms = async () => {
    try {
        console.log('Llamando a:', API_URL + '/rooms');
        const response = await axios.get(`${API_URL}/rooms`);
        console.log('Respuesta completa:', response);
        return response.data;
    } catch (error) {
        console.error('Error detallado:', {
            mensaje: error.message,
            respuesta: error.response?.data,
            status: error.response?.status
        });
        throw error;
    }
};