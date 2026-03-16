/* NAVBAR PRINCIPAL - COMPONENTE*/

import React from 'react';
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Íconos de Bootstrap
import { Building, DoorOpen, CalendarCheck, PersonBadge, People, GraphUp, PersonCircle, BoxArrowRight, Search, Calendar, FileText, Key                    
} from 'react-bootstrap-icons';

// Importar estilos 
import './Navbar.css';

function NavigationBar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <Navbar className="navbar-premium" expand="lg" sticky="top" variant="dark">
      <Container>
        {/*  LOGO Y MARCA  */}
        <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
          <Building className="brand-icon me-2" />
          <span>Hotel</span>
          <span className="brand-highlight ms-1">CP</span>
        </Navbar.Brand>

        {/*  BOTÓN MENÚ MÓVIL  */}
        <Navbar.Toggle aria-controls="navbar-nav" />

        {/*  MENÚ PRINCIPAL  */}
        <Navbar.Collapse id="navbar-nav">
          <Nav className="ms-auto align-items-center">
            
            {/*  ENLACES PÚBLICOS  */}
            <Nav.Link as={Link} to="/rooms" className="nav-link">
              <DoorOpen className="nav-icon" />
              <span>Habitaciones</span>
            </Nav.Link>

            {/*  ENLACES PARA USUARIOS AUTENTICADOS  */}
            {isAuthenticated && (
              <>
                <Nav.Link as={Link} to="/my-bookings" className="nav-link">
                  <CalendarCheck className="nav-icon" />
                  <span>Mis Reservas</span>
                </Nav.Link>
                <Nav.Link as={Link} to="/profile" className="nav-link">
                  <PersonBadge className="nav-icon" />
                  <span>Mi Perfil</span>
                </Nav.Link>
              </>
            )}

            {/*  MENÚ PARA RECEPCIONISTAS Y ADMINS  */}
            {['receptionist', 'admin'].includes(user?.role) && (
              <NavDropdown 
                title={
                  <span className="nav-link d-inline-flex align-items-center">
                    <People className="nav-icon me-2" />
                    <span>Recepción</span>
                  </span>
                }
                className="nav-dropdown"
                renderMenuOnMount={true}
              >
                <NavDropdown.Item as={Link} to="/receptionist/bookings">
                  <FileText className="nav-icon me-2" />
                  Todas las Reservas
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/receptionist/search">
                  <Search className="nav-icon me-2" />
                  Buscar Huéspedes
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/calendar">
                  <Calendar className="nav-icon me-2" />
                  Calendario
                </NavDropdown.Item>
              </NavDropdown>
            )}

            {/*  MENÚ PARA ADMINISTRADORES  */}
            {user?.role === 'admin' && (
              <NavDropdown 
                title={
                  <span className="nav-link d-inline-flex align-items-center">
                    <GraphUp className="nav-icon me-2" />
                    <span>Admin</span>
                  </span>
                }
                className="nav-dropdown"
              >
                <NavDropdown.Item as={Link} to="/admin/dashboard">
                  <GraphUp className="nav-icon me-2" />
                  Dashboard
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/admin/users">
                  <People className="nav-icon me-2" />
                  Usuarios
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/admin/reports">
                  <FileText className="nav-icon me-2" />
                  Reportes
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/admin/rooms">
                  <Key className="nav-icon me-2" />
                  Habitaciones
                </NavDropdown.Item>
              </NavDropdown>
            )}

            {/*  MENÚ DE USUARIO / LOGIN / REGISTER  */}
            {isAuthenticated ? (
              <NavDropdown 
                title={
                  <span className="nav-link d-inline-flex align-items-center">
                    <PersonCircle className="nav-icon me-2" />
                    <span>{user?.name?.split(' ')[0] || 'Usuario'}</span>
                  </span>
                }
                className="nav-dropdown"
                align="end"
              >
                <NavDropdown.Item as={Link} to="/profile">
                  <PersonBadge className="nav-icon me-2" />
                  Mi Perfil
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/my-bookings">
                  <CalendarCheck className="nav-icon me-2" />
                  Mis Reservas
                </NavDropdown.Item>
                <NavDropdown.Divider className="dropdown-divider" />
                <NavDropdown.Item onClick={handleLogout}>
                  <BoxArrowRight className="nav-icon me-2" />
                  Cerrar Sesión
                </NavDropdown.Item>
              </NavDropdown>
            ) : (
              <>
                <Nav.Link as={Link} to="/login" className="nav-link">
                  Iniciar Sesión
                </Nav.Link>
                <Nav.Link as={Link} to="/register" className="nav-link register-link">
                  Registrarse
                </Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavigationBar;
