import { useState, useEffect } from 'react';
import { getRooms } from '../services/api';

function RoomList() {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadRooms = async () => {
            try {
                console.log('Intentando cargar habitaciones...');
                const data = await getRooms();
                console.log('Datos recibidos:', data);
                console.log('Tipo de datos:', typeof data);
                console.log('¿Es arreglo?', Array.isArray(data));
                
                // Si data es un arreglo, úsalo, si no, crea un arreglo vacío
                if (Array.isArray(data)) {
                    setRooms(data);
                } else {
                    console.error('Los datos no son un arreglo:', data);
                    setRooms([]);
                }
            } catch (err) {
                console.error('Error al cargar:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        
        loadRooms();
    }, []);

    if (loading) {
        return <div style={{ textAlign: 'center', padding: '50px' }}>Cargando habitaciones...</div>;
    }

    if (error) {
        return <div style={{ color: 'red', textAlign: 'center', padding: '50px' }}>
            Error: {error}
        </div>;
    }

    if (!rooms || rooms.length === 0) {
        return <div style={{ textAlign: 'center', padding: '50px' }}>
            No hay habitaciones disponibles
        </div>;
    }

    return (
        <div>
            <h2 style={{ color: '#8B4513', marginBottom: '20px' }}>Nuestras Habitaciones</h2>
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
                gap: '20px' 
            }}>
                {rooms.map(room => (
                    <div key={room.id} style={{ 
                        border: '1px solid #ddd', 
                        padding: '20px', 
                        borderRadius: '8px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        backgroundColor: '#fff'
                    }}>
                        <h3 style={{ color: '#8B4513', marginTop: 0 }}>
                            {room.type} - #{room.number}
                        </h3>
                        <p><strong>Piso:</strong> {room.floor}</p>
                        <p><strong>Capacidad:</strong> {room.capacity} personas</p>
                        <p><strong>Precio:</strong>  COP/noche</p>
                        <p style={{ color: '#666' }}>{room.description}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default RoomList;