import React, { useState } from 'react';
import { Container, Row, Col, Button, Form, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaSwimmingPool, FaDumbbell, FaSpa, FaWifi, FaCoffee, FaParking } from 'react-icons/fa';

function HomePage() {
  const navigate = useNavigate();
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(2);

  const handleSearch = (e) => {
    e.preventDefault();
    // Construir URL con parámetros de búsqueda
    const params = new URLSearchParams({
      checkIn,
      checkOut,
      guests
    });
    navigate(`/rooms?${params.toString()}`);
  };

  return (
    <div>
      {/* Hero Section con imagen de fondo */}
      <div 
        style={{
          backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url("https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          height: '80vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          textAlign: 'center',
          marginBottom: '3rem'
        }}
      >
        <Container>
          <h1 style={{ fontSize: '4rem', fontWeight: 'bold', textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
            Hotel Casa Preciado
          </h1>
          <p style={{ fontSize: '1.5rem', marginBottom: '2rem', textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
            Tu refugio de lujo en el corazón de la ciudad
          </p>
          
          {/* Buscador rápido */}
          <Card style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', padding: '2rem', borderRadius: '10px' }}>
            <Form onSubmit={handleSearch}>
              <Row>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label style={{ color: '#333' }}>Fecha de entrada</Form.Label>
                    <Form.Control
                      type="date"
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label style={{ color: '#333' }}>Fecha de salida</Form.Label>
                    <Form.Control
                      type="date"
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      min={checkIn || new Date().toISOString().split('T')[0]}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label style={{ color: '#333' }}>Huéspedes</Form.Label>
                    <Form.Control
                      type="number"
                      min="1"
                      max="4"
                      value={guests}
                      onChange={(e) => setGuests(parseInt(e.target.value))}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={3} className="d-flex align-items-end">
                  <Button 
                    type="submit"
                    style={{ backgroundColor: '#8B4513', borderColor: '#8B4513' }}
                    className="w-100"
                  >
                    Buscar Habitaciones
                  </Button>
                </Col>
              </Row>
            </Form>
          </Card>
        </Container>
      </div>

      {/* Sección de Servicios */}
      <Container className="mb-5">
        <h2 style={{ color: '#8B4513', textAlign: 'center', marginBottom: '3rem' }}>
          Nuestros Servicios
        </h2>
        <Row>
          <Col md={4} className="mb-4">
            <Card className="text-center h-100">
              <Card.Body>
                <FaSwimmingPool size={50} style={{ color: '#8B4513', marginBottom: '1rem' }} />
                <Card.Title>Piscina</Card.Title>
                <Card.Text>
                  Disfruta de nuestra piscina al aire libre con vista a la ciudad
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4} className="mb-4">
            <Card className="text-center h-100">
              <Card.Body>
                <FaDumbbell size={50} style={{ color: '#8B4513', marginBottom: '1rem' }} />
                <Card.Title>Gimnasio</Card.Title>
                <Card.Text>
                  Gimnasio completamente equipado para tu rutina de ejercicios
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4} className="mb-4">
            <Card className="text-center h-100">
              <Card.Body>
                <FaSpa size={50} style={{ color: '#8B4513', marginBottom: '1rem' }} />
                <Card.Title>Spa</Card.Title>
                <Card.Text>
                  Relájate con nuestros tratamientos de spa y masajes
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} className="mb-4">
            <Card className="text-center h-100">
              <Card.Body>
                <FaWifi size={40} style={{ color: '#8B4513', marginBottom: '1rem' }} />
                <Card.Title>WiFi Gratis</Card.Title>
                <Card.Text>
                  Conexión de alta velocidad en todo el hotel
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} className="mb-4">
            <Card className="text-center h-100">
              <Card.Body>
                <FaCoffee size={40} style={{ color: '#8B4513', marginBottom: '1rem' }} />
                <Card.Title>Desayuno Incluido</Card.Title>
                <Card.Text>
                  Delicioso desayuno buffet todas las mañanas
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} className="mb-4">
            <Card className="text-center h-100">
              <Card.Body>
                <FaParking size={40} style={{ color: '#8B4513', marginBottom: '1rem' }} />
                <Card.Title>Parqueadero</Card.Title>
                <Card.Text>
                  Parqueadero privado y seguro para nuestros huéspedes
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Sección de Habitaciones Destacadas */}
      <Container className="mb-5">
        <h2 style={{ color: '#8B4513', textAlign: 'center', marginBottom: '3rem' }}>
          Habitaciones Destacadas
        </h2>
        <Row>
          <Col md={4} className="mb-4">
            <Card>
              <Card.Img 
                variant="top" 
                src="https://images.unsplash.com/photo-1631049307264-da0ec9d70304?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80" 
                style={{ height: '200px', objectFit: 'cover' }}
              />
              <Card.Body>
                <Card.Title>Habitación Estándar</Card.Title>
                <Card.Text>
                  Perfecta para viajeros individuales o parejas. Incluye cama doble, baño privado y TV.
                </Card.Text>
                <Button 
                  variant="primary" 
                  style={{ backgroundColor: '#8B4513', borderColor: '#8B4513' }}
                  onClick={() => navigate('/rooms')}
                >
                  Ver más
                </Button>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4} className="mb-4">
            <Card>
              <Card.Img 
                variant="top" 
                src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80" 
                style={{ height: '200px', objectFit: 'cover' }}
              />
              <Card.Body>
                <Card.Title>Suite de Lujo</Card.Title>
                <Card.Text>
                  Amplia suite con sala de estar, jacuzzi y vista panorámica de la ciudad.
                </Card.Text>
                <Button 
                  variant="primary" 
                  style={{ backgroundColor: '#8B4513', borderColor: '#8B4513' }}
                  onClick={() => navigate('/rooms')}
                >
                  Ver más
                </Button>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4} className="mb-4">
            <Card>
              <Card.Img 
                variant="top" 
                src="https://images.unsplash.com/photo-1566665797739-1674de7a421a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80" 
                style={{ height: '200px', objectFit: 'cover' }}
              />
              <Card.Body>
                <Card.Title>Habitación Familiar</Card.Title>
                <Card.Text>
                  Ideal para familias, con dos camas dobles y espacio adicional para niños.
                </Card.Text>
                <Button 
                  variant="primary" 
                  style={{ backgroundColor: '#8B4513', borderColor: '#8B4513' }}
                  onClick={() => navigate('/rooms')}
                >
                  Ver más
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Footer */}
      <footer style={{ backgroundColor: '#333', color: 'white', padding: '3rem 0', marginTop: '3rem' }}>
        <Container>
          <Row>
            <Col md={4}>
              <h5 style={{ color: '#DAA520' }}>Hotel Casa Preciado</h5>
              <p>Tu refugio de lujo en el corazón de la ciudad. Disfruta de la mejor experiencia hotelera.</p>
            </Col>
            <Col md={4}>
              <h5 style={{ color: '#DAA520' }}>Contacto</h5>
              <p>
                📍 Calle 123 #45-67, Bogotá<br />
                📞 +57 601 234 5678<br />
                ✉️ info@hotelcasapreciado.com
              </p>
            </Col>
            <Col md={4}>
              <h5 style={{ color: '#DAA520' }}>Síguenos</h5>
              <p>
                Facebook | Instagram | Twitter
              </p>
            </Col>
          </Row>
          <Row className="mt-4">
            <Col className="text-center">
              <small>&copy; 2026 Hotel Casa Preciado. Todos los derechos reservados.</small>
            </Col>
          </Row>
        </Container>
      </footer>
    </div>
  );
}

export default HomePage;