import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { getRooms } from '../../services/api';

function RoomsPage() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRooms = async () => {
      const data = await getRooms();
      setRooms(data);
      setLoading(false);
    };
    loadRooms();
  }, []);

  // Agrupar por tipo y tomar el primer ejemplo de cada uno
  const roomTypes = {
    estandar: rooms.find(r => r.type === 'estandar'),
    suite: rooms.find(r => r.type === 'suite'),
    familiar: rooms.find(r => r.type === 'familiar')
  };

  const typeInfo = {
    estandar: {
      title: 'Habitación Estándar',
      description: 'Perfecta para viajeros individuales o parejas. Disfruta de una estancia cómoda y funcional con todos los servicios esenciales.',
      image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      icon: '🛏️'
    },
    suite: {
      title: 'Suite de Lujo',
      description: 'Experimenta el máximo confort en nuestras amplias suites. Incluye sala de estar independiente, jacuzzi y vistas panorámicas.',
      image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      icon: '👑'
    },
    familiar: {
      title: 'Habitación Familiar',
      description: 'Diseñada para familias, con espacio adicional y comodidades especiales para los más pequeños. Ideal para crear recuerdos inolvidables.',
      image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      icon: '👪'
    }
  };

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" style={{ color: '#8B4513' }} />
        <p>Cargando habitaciones...</p>
      </Container>
    );
  }

  return (
    <Container className="mt-5">
      <h1 style={{ color: '#8B4513', textAlign: 'center', marginBottom: '3rem' }}>
        Nuestras Habitaciones
      </h1>

      <Row>
        {Object.entries(typeInfo).map(([type, info]) => {
          const room = roomTypes[type];
          if (!room) return null;

          return (
            <Col md={4} key={type} className="mb-4">
              <Card className="h-100 shadow-sm">
                <Card.Img
                  variant="top"
                  src={info.image}
                  style={{ height: '250px', objectFit: 'cover' }}
                />
                <Card.Body>
                  <Card.Title style={{ color: '#8B4513', fontSize: '1.5rem' }}>
                    {info.icon} {info.title}
                  </Card.Title>
                  <Card.Text>
                    {info.description}
                  </Card.Text>
                  <div className="mb-3">
                    <strong>Características:</strong>
                    <ul className="mt-2">
                      <li>Capacidad: {room.capacity} personas</li>
                      <li>Precio por noche:  COP</li>
                      <li>Piso: {room.floor}</li>
                    </ul>
                  </div>
                  <div className="d-grid">
                    <Button
                      as={Link}
                      to={`/rooms/type/${type}`}
                      variant="primary"
                      style={{ backgroundColor: '#8B4513', borderColor: '#8B4513' }}
                    >
                      Ver habitaciones disponibles
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>
    </Container>
  );
}

export default RoomsPage;