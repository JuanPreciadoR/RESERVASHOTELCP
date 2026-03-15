import React from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function NavigationBar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <Navbar bg="light" expand="lg" className="mb-4">
      <Container>
        <Navbar.Brand as={Link} to="/" style={{ color: '#8B4513', fontWeight: 'bold' }}>
          Hotel Casa Preciado
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/rooms">Habitaciones</Nav.Link>
            {isAuthenticated && (
              <>
                <Nav.Link as={Link} to="/my-bookings">Mis Reservas</Nav.Link>
                <Nav.Link as={Link} to="/profile">Mi Perfil</Nav.Link>
              </>
            )}
            {['receptionist', 'admin'].includes(user?.role) && (
              <>
                <Nav.Link as={Link} to="/receptionist/bookings">Recepción</Nav.Link>
                <Nav.Link as={Link} to="/receptionist/search">Buscar Huéspedes</Nav.Link>
                <Nav.Link as={Link} to="/calendar">Calendario</Nav.Link>
              </>
            )}
            {user?.role === 'admin' && (
              <>
                <Nav.Link as={Link} to="/admin/dashboard">Dashboard</Nav.Link>
                <Nav.Link as={Link} to="/admin/users">Usuarios</Nav.Link>
                <Nav.Link as={Link} to="/admin/reports">Reportes</Nav.Link>
                <Nav.Link as={Link} to="/admin/rooms">Habitaciones</Nav.Link>
              </>
            )}
          </Nav>
          <Nav>
            {isAuthenticated ? (
              <>
                <Navbar.Text className="me-3">
                  Hola, {user?.name || 'Usuario'} ({user?.role})
                </Navbar.Text>
                <Button variant="outline-danger" size="sm" onClick={handleLogout}>
                  Cerrar Sesión
                </Button>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login">Iniciar Sesión</Nav.Link>
                <Nav.Link as={Link} to="/register">Registrarse</Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavigationBar;
